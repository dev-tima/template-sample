import { marked } from "marked";

export default function createImageGeneratorSlide(data, slideId) {
  const apiUrl = "https://dev-ai-model.redbrick.ai/api/image-generator";
  const title = data.title || "AI Image Generator";
  const systemPrompt = data.systemPrompt || "";
  const placeholder = data.placeholder || "";
  const gameId = "presentation_" + Date.now();
  const background = data.background || "https://corsproxy.io/?https://i.ibb.co/MDpwtB2R/intro-bg.png";

  return `
    <section class="slide image-generator-slide" id="${slideId}" style="background-image: url('${background}'); background-size: cover; background-position: center;">
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

            <button class="ig-generate-btn" data-slide="${slideId}">Generate Image</button>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const slideId = "${slideId}";
          const apiUrl = "${apiUrl}";
          const gameId = "${gameId}";
          const systemPrompt = ${JSON.stringify(systemPrompt)};

          // Capture authToken from URL immediately on page load
          (function captureAuthToken() {
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('authToken');

            if (authToken) {
              window.__authToken = authToken;
            }
          })();

          // Wait for DOM to be ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSlide);
          } else {
            initSlide();
          }

          function initSlide() {
            const generateBtn = document.querySelector('.ig-generate-btn[data-slide="' + slideId + '"]');

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
                const imageUrl = await generateImageFromAPI(prompt, apiUrl, gameId, systemPrompt);
                displayImage(imageUrl, prompt);
              } catch (error) {
                showError(error.message);
              } finally {
                hideLoading();
              }
            });

            async function generateImageFromAPI(prompt, apiUrl, gameId, systemPrompt) {
              // Get auth token from global variable (captured on page load)
              // Fallback to localStorage for dev mode (when not in credentialless iframe)
              let apiToken = window.__authToken;

              if (!apiToken) {
                try {
                  apiToken = localStorage.getItem("authToken");
                } catch (e) {
                  // Expected in credentialless iframe
                }
              }

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
                systemPrompt: systemPrompt,
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
          margin-left: 3%;
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
          flex: 0.9;
        }

        .ig-image-section {
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 20px;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
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
          width: 100%;
          height: 100%;
          text-align: center;
          align-items: center;
          justify-content: center;
        }

        .ig-result.active {
          display: flex;
        }

        .ig-generated-image {
          max-width: 90%;
          max-height: 40vh;
          width: auto;
          height: auto;
          border-radius: 12px;
          border: 2px solid #ddd;
          object-fit: contain;
        }
      </style>
    </section>
  `;
}
