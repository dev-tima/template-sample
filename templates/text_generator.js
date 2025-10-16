import { marked } from "marked";

export default function createTextGeneratorSlide(data, slideId) {
  const apiUrl =
    data.apiUrl || "https://dev-ai-model.redbrick.ai/api/chat-generator";
  const title = data.title || "AI Text Generator";
  const defaultSystemPrompt =
    data.systemPrompt ||
    "You are a helpful AI assistant that generates thoughtful and creative responses based on the given prompts.";
  const inputPlaceholder =
    data.inputPlaceholder || "Enter your prompt here...";
  const outputPlaceholder =
    data.outputPlaceholder || "Your generated output will appear here...";

  return `
    <section class="slide text-generator-slide" id="${slideId}">
      <div class="tg-container">
        <div class="tg-title-box">${marked.parse(title)}</div>

        <div class="tg-main-section">
          <div class="tg-output-area" id="output-${slideId}">
            <div class="tg-output-placeholder">${outputPlaceholder}</div>
          </div>
          <div class="tg-input-area">
            <textarea
              class="tg-user-input"
              id="promptInput-${slideId}"
              placeholder="${inputPlaceholder}"
              rows="2"
            ></textarea>
            <button class="tg-generate-btn" data-slide="${slideId}">Generate</button>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const slideId = "${slideId}";
          const apiUrl = "${apiUrl}";
          const defaultSystemPrompt = ${JSON.stringify(defaultSystemPrompt)};

          let isGenerating = false;

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
            const generateBtn = document.querySelector('.tg-generate-btn[data-slide="' + slideId + '"]');
            const promptInput = document.getElementById("promptInput-" + slideId);
            const outputBox = document.getElementById("output-" + slideId);

            if (!generateBtn || !promptInput || !outputBox) {
              console.error("Required elements not found for slide:", slideId);
              return;
            }

            // Generate button
            generateBtn.addEventListener("click", handleGenerate);

            // Enter key to generate (Ctrl/Cmd+Enter)
            promptInput.addEventListener("keydown", (e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleGenerate();
              }
            });

            async function handleGenerate() {
              if (isGenerating) return;

              const userPrompt = promptInput.value.trim();
              if (!userPrompt) return;

              const systemPrompt = defaultSystemPrompt;

              // Show loading state (reset flex centering for loading)
              outputBox.style.display = 'flex';
              outputBox.style.alignItems = 'center';
              outputBox.style.justifyContent = 'center';
              outputBox.innerHTML = '<div class="tg-loading"><div class="tg-spinner"></div><div>Generating...</div></div>';
              isGenerating = true;
              generateBtn.disabled = true;
              generateBtn.textContent = "Generating...";

              try {
                await generateResponse(systemPrompt, userPrompt, outputBox);
              } catch (error) {
                outputBox.style.display = 'flex';
                outputBox.style.alignItems = 'center';
                outputBox.style.justifyContent = 'center';
                outputBox.innerHTML = '<div class="tg-error"><strong>Error:</strong> ' + error.message + '</div>';
                isGenerating = false;
                generateBtn.disabled = false;
                generateBtn.textContent = "Generate";
              }
            }

            async function generateResponse(systemPrompt, userPrompt, outputBox) {
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
                throw new Error('API token not found. Please set it in localStorage with key "authToken"');
              }

              const headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer " + apiToken,
              };

              const requestBody = {
                systemPrompt: systemPrompt,
                messages: [{ role: "user", content: userPrompt }],
                stream: true
              };

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.error || "API Error: " + response.status + " " + response.statusText
                );
              }

              // Handle streaming response (Vercel AI SDK format)
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let fullResponse = "";

              // Create output content div and center it
              outputBox.style.display = 'flex';
              outputBox.style.alignItems = 'center';
              outputBox.style.justifyContent = 'center';
              outputBox.innerHTML = '<div class="tg-output-content"></div>';
              const contentDiv = outputBox.querySelector('.tg-output-content');

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  // Backend sends Vercel AI SDK format: 0:"text" 0:"more" etc.
                  const chunk = decoder.decode(value, { stream: true });

                  // Find all text chunks in format: 0:"text"
                  const regex = /0:"([^"]*)"/g;
                  let match;

                  while ((match = regex.exec(chunk)) !== null) {
                    const text = match[1];
                    fullResponse += text;
                    contentDiv.textContent = fullResponse;
                  }
                }
              } catch (error) {
                console.error("Streaming error:", error);
                throw new Error("Error receiving response: " + error.message);
              } finally {
                isGenerating = false;
                generateBtn.disabled = false;
                generateBtn.textContent = "Generate";
              }
            }
          }
        })();
      </script>

      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .text-generator-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
          background-image: url('https://corsproxy.io/?https://i.ibb.co/XZbqydhC/content-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
        }

        .tg-container {
          width: 70%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }

        .tg-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 3%;
          margin-bottom: 2%;
        }

        .tg-title-box p {
          margin: 0;
          line-height: 1;
        }

        .tg-main-section {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
        }

        .tg-output-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tg-output-placeholder {
          color: #999;
          font-style: italic;
          font-size: 0.75em;
          text-align: center;
        }

        .tg-output-content {
          color: #333;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-size: 0.75em;
          line-height: 1.6;
          max-width: 100%;
          text-align: center;
        }

        .tg-input-area {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 2px solid #ddd;
          background: white;
        }

        .tg-user-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.75em;
          font-family: inherit;
          resize: none;
          background: white;
        }

        .tg-user-input:focus {
          outline: none;
          border-color: #000;
        }

        .tg-generate-btn {
          background: #000;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 0.8em;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tg-generate-btn:hover:not(:disabled) {
          background: #333;
        }

        .tg-generate-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .tg-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #666;
          height: 100%;
        }

        .tg-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #000;
          border-radius: 50%;
          animation: tg-spin 1s linear infinite;
        }

        @keyframes tg-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tg-error {
          color: #c33;
          background: #fee;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #c33;
          font-size: 0.75em;
          text-align: center;
        }
      </style>
    </section>
  `;
}
