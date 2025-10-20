import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createImageGeneratorSlide(data, slideId) {
  const apiUrl = "https://dev-ai-model.redbrick.ai/api/image-generator";
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');

  // Determine if we're in dev mode for inline script (to wrap API response image URLs)
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  const title = data.title || "AI Image Generator";
  const systemPrompt = data.systemPrompt || "";
  const placeholder = data.placeholder || "";
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
          const isDev = ${isDev};
          // Capture authToken from URL immediately on page load
          (function captureContext() {
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('authToken');
            const lessonId = params.get('lessonId');
            if (authToken) window.__authToken = authToken;
            if (lessonId) window.__lessonId = lessonId;
          })();

          function getLessonId() {
            try {
              const params = new URLSearchParams(window.location.search);
              return params.get('lessonId') || (typeof window !== 'undefined' ? window.__lessonId : null);
            } catch (e) { return (typeof window !== 'undefined' ? window.__lessonId : null); }
          }

          async function logActivity(activityType, activityData) {
            let apiToken = window.__authToken;
            if (!apiToken) { try { apiToken = localStorage.getItem('authToken'); } catch (e) {} }
            if (!apiToken) return;
            const payload = {
              lessonId: getLessonId(),
              slideId: slideId,
              activityType,
              activityData: JSON.stringify(activityData || {})
            };
            try {
              await fetch('https://dev-api-gateway.redbrick.ai/v1/edu/activities/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiToken },
                body: JSON.stringify(payload)
              });
            } catch (e) {}
          }

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
                const storedUrl = await persistImageUrlToAssets(imageUrl, prompt).catch(() => imageUrl);
                displayImage(storedUrl, prompt);
                // Log image generation with stored asset URL (or original on fallback)
                logActivity('image_generate', {
                  prompt: prompt,
                  imageUrl: storedUrl
                });
              } catch (error) {
                showError(error.message);
              } finally {
                hideLoading();
              }
            });

            async function persistImageUrlToAssets(sourceUrl, prompt) {
              // fetch the image as Blob
              let blob;
              try {
                let resp = await fetch(sourceUrl, { mode: 'cors' });
                if (!resp.ok) throw new Error('Fetch failed');
                blob = await resp.blob();
              } catch (e1) {
                try {
                  const proxied = 'https://corsproxy.io/?' + sourceUrl;
                  const resp2 = await fetch(proxied, { mode: 'cors' });
                  if (!resp2.ok) throw new Error('Proxy fetch failed');
                  blob = await resp2.blob();
                } catch (e2) {
                  console.warn('Could not fetch generated image as blob; using original URL', e2);
                  throw e2;
                }
              }

              const token = (function() {
                let t = window.__authToken;
                if (!t) { try { t = localStorage.getItem('authToken'); } catch (e) {} }
                return t;
              })();
              if (!token) throw new Error('Missing auth token for asset upload');

              const filenameBase = 'generated-image-' + Date.now();
              const filename = filenameBase + '.png';

              const presignRes = await fetch('https://dev-api-gateway.redbrick.ai/v1/utils/upload-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ type: 'userAssets', filename, gameId })
              });
              if (!presignRes.ok) throw new Error('Failed to get upload URL');
              const presignData = await presignRes.json();
              const { uploadUrl, downloadUrl } = (presignData && presignData.data) || {};
              if (!uploadUrl || !downloadUrl) throw new Error('Invalid upload URL response');

              const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': blob.type || 'image/png' }, body: blob });
              if (!putRes.ok) throw new Error('Failed to upload image to asset store');

              return downloadUrl;
            }

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
                throw new Error('Please make sure you are logged in or try after publishing');
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
                throw new Error("Oops, something went wrong please try again");
              }

              const data = await response.json();

              if (!data.success) {
                throw new Error("Oops, something went wrong please try again");
              }

              return data.image || null;
            }

            function displayImage(url, prompt) {
              const img = document.getElementById("generatedImage-" + slideId);
              // Wrap with CORS proxy in dev mode
              const wrappedUrl = isDev && url && !url.includes('fonts.googleapis.com') && !url.startsWith('https://corsproxy.io/?')
                ? 'https://corsproxy.io/?' + url
                : url;
              img.src = wrappedUrl;
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

            (async function hydrateFromActivities() {
              let apiToken = window.__authToken;
              if (!apiToken) { try { apiToken = localStorage.getItem('authToken'); } catch (e) {} }
              const lessonId = getLessonId();
              if (!apiToken || !lessonId) return;
              try {
                const url = new URL('https://dev-api-gateway.redbrick.ai/v1/edu/activities/student');
                url.searchParams.set('lessonId', lessonId);
                url.searchParams.set('page', '1');
                url.searchParams.set('limit', '200');
                const res = await fetch(url.toString(), { headers: { Authorization: 'Bearer ' + apiToken } });
                if (!res.ok) return;
                const data = await res.json();
                const acts = Array.isArray(data.activities) ? data.activities : [];
                const mine = acts.filter(a => a.slideId === slideId && a.activityType === 'image_generate');
                if (!mine.length) return;
                mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const latest = mine[0];
                let payload = {};
                try { payload = JSON.parse(latest.activityData || '{}'); } catch {}
                const urlStr = payload.imageUrl || '';
                const promptStr = String(payload.prompt || '');
                if (urlStr) {
                  displayImage(String(urlStr), promptStr);
                }
                const promptInputEl = document.getElementById('prompt-' + slideId);
                if (promptInputEl && promptStr) {
                  promptInputEl.value = promptStr;
                }
              } catch (e) {
                // ignore
              }
            })();
          }
        })();
      </script>

      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .image-generator-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
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
