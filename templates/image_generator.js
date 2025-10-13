import { marked } from "marked";

export default function createImageGeneratorSlide(data, slideId) {
  const apiUrl = "https://dev-ai-model.redbrick.ai/api/image-generator";
  const title = data.title || "AI Image Generator";
  const placeholder =
    data.placeholder ||
    'Describe the thumbnail you want to generate... (e.g., "Space adventure game with rocket ships and planets")';
  const gameId = "presentation_" + Date.now();

  return `
    <section class="slide image-generator-slide" id="${slideId}">
      <div class="ig-container">
        <div class="ig-title-box">${marked.parse(title)}</div>

        <div class="ig-content-wrapper">
          <div class="ig-image-section">
            <div class="ig-loading" id="loading-${slideId}">
              <div class="ig-spinner"></div>
              <p>Generating your image...</p>
            </div>

            <div class="ig-error" id="error-${slideId}"></div>

            <div class="ig-result" id="result-${slideId}">
              <img class="ig-generated-image" id="generatedImage-${slideId}" alt="Generated image">
              <button class="ig-download-btn" data-slide="${slideId}">Download Image</button>
            </div>
          </div>

          <div class="ig-control-section">
            <div class="ig-input-section">
              <textarea
                class="ig-prompt"
                id="prompt-${slideId}"
                placeholder="${placeholder}"
              ></textarea>
            </div>

            <button class="ig-generate-btn" data-slide="${slideId}">Generate Image ✨</button>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const slideId = "${slideId}";
          const apiUrl = "${apiUrl}";
          const gameId = "${gameId}";

          // Wait for DOM to be ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSlide);
          } else {
            initSlide();
          }

          function initSlide() {
            const generateBtn = document.querySelector('.ig-generate-btn[data-slide="' + slideId + '"]');
            const downloadBtn = document.querySelector('.ig-download-btn[data-slide="' + slideId + '"]');

            if (!generateBtn) {
              console.error("Generate button not found for slide:", slideId);
              return;
            }

            // Generate button
            generateBtn.addEventListener("click", async () => {
              const prompt = document.getElementById("prompt-" + slideId).value.trim();

              if (!prompt) {
                showError("Please enter a prompt");
                return;
              }

              hideError();
              showLoading();
              hideResult();

              try {
                const imageUrl = await generateImageFromAPI(prompt, apiUrl, gameId);
                displayImage(imageUrl, prompt);
              } catch (error) {
                showError(error.message);
              } finally {
                hideLoading();
              }
            });

            // Download button
            if (downloadBtn) {
              downloadBtn.addEventListener("click", () => {
                const img = document.getElementById("generatedImage-" + slideId);
                const url = img.src;

                const a = document.createElement("a");
                a.href = url;
                a.download = "thumbnail-" + Date.now() + ".png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              });
            }

            async function generateImageFromAPI(prompt, apiUrl, gameId) {
              // Extract token from URL hash first, fallback to localStorage
              const getAuthTokenFromHash = () => {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                return params.get('authToken');
              };

              const apiToken = getAuthTokenFromHash() || localStorage.getItem("authToken");

              if (!apiToken) {
                throw new Error(
                  'API token not found. Please set it in localStorage with key "authToken"'
                );
              }

              const headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer " + apiToken,
              };

              const requestBody = {
                prompt: prompt,
                gameId: gameId,
              };

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.error ||
                    "API Error: " + response.status + " " + response.statusText
                );
              }

              const data = await response.json();

              if (!data.success) {
                throw new Error(data.error || "Image generation failed");
              }

              return data.image || null;
            }

            function displayImage(url, prompt) {
              const img = document.getElementById("generatedImage-" + slideId);
              img.src = url;
              img.alt = prompt;
              document.getElementById("result-" + slideId).classList.add("active");
            }

            function showLoading() {
              document.getElementById("loading-" + slideId).classList.add("active");
              document.querySelector('.ig-generate-btn[data-slide="' + slideId + '"]').disabled = true;
            }

            function hideLoading() {
              document.getElementById("loading-" + slideId).classList.remove("active");
              document.querySelector('.ig-generate-btn[data-slide="' + slideId + '"]').disabled = false;
            }

            function showError(message) {
              const errorEl = document.getElementById("error-" + slideId);
              errorEl.textContent = message;
              errorEl.classList.add("active");
            }

            function hideError() {
              document.getElementById("error-" + slideId).classList.remove("active");
            }

            function hideResult() {
              document.getElementById("result-" + slideId).classList.remove("active");
            }
          }
        })();
      </script>

      <style>
        .image-generator-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }

        .ig-container {
          width: 85%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }

        .ig-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 4%;
          margin-bottom: 2%;
        }

        .ig-title-box p {
          margin: 0;
          line-height: 1;
        }

        .ig-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3%;
          align-items: start;
          width: 100%;
          flex: 1;
        }

        .ig-image-section {
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          min-height: 30vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ig-control-section {
          display: flex;
          flex-direction: column;
        }

        .ig-input-section {
          width: 100%;
          height: 30vh;
        }

        .ig-prompt {
          width: 100%;
          padding: 20px;
          border: 2px solid #ddd;
          border-radius: 12px;
          font-size: 0.85em;
          font-family: inherit;
          min-height: 28vh;
          resize: vertical;
          background: white;
          box-sizing: border-box;
        }

        .ig-prompt:focus {
          outline: none;
          border-color: #000;
        }

        .ig-generate-btn {
          width: 100%;
          background: #000;
          color: white;
          border: none;
          padding: 16px;
          font-size: 0.95em;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 700;
          transition: all 0.2s;
        }

        .ig-generate-btn:hover:not(:disabled) {
          background: #333;
        }

        .ig-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ig-loading {
          display: none;
          text-align: center;
        }

        .ig-loading.active {
          display: block;
        }

        .ig-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #000;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: ig-spin 1s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes ig-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ig-loading p {
          font-size: 0.85em;
          font-weight: 500;
        }

        .ig-error {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #c33;
          display: none;
          font-size: 0.8em;
        }

        .ig-error.active {
          display: block;
        }

        .ig-result {
          display: none;
          text-align: center;
          width: 100%;
        }

        .ig-result.active {
          display: block;
        }

        .ig-generated-image {
          max-width: 80%;
          max-height: 360px;
          border-radius: 12px;
          border: 2px solid #ddd;
          margin-bottom: 15px;
        }

        .ig-download-btn {
          background: #000;
          color: white;
          border: none;
          padding: 10px 24px;
          font-size: 0.85em;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .ig-download-btn:hover {
          background: #333;
        }
      </style>
    </section>
  `;
}
