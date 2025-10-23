import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createChatActivitySlide(data, slideId) {
  const apiUrl =
    data.apiUrl || "https://dev-ai-model.redbrick.ai/api/chat-generator";
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');
  const title = data.title || "AI Chat Tutor";
  const defaultSystemPrompt =
    data.systemPrompt ||
    data.defaultSystemPrompt ||
    "You are a helpful educational tutor. Explain concepts clearly and encourage students to think critically. Ask guiding questions to help students discover answers themselves.";
  const placeholder =
    data.placeholder || "Ask me anything about today's lesson...";

  return `
    <section class="slide chat-activity-slide" id="${slideId}">
      <div class="act-container">
        <div class="act-title-box">${marked.parse(title)}</div>

        <div class="act-chat-section">
          <div class="act-messages" id="messages-${slideId}">
            <div class="act-welcome-message">
              <div class="act-message act-ai-message">
                <div class="act-message-content">
                  <p>Hello! I'm your AI tutor. Ask me anything about today's lesson.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="act-input-area">
            <textarea
              class="act-user-input"
              id="userInput-${slideId}"
              placeholder="${placeholder}"
              rows="2"
            ></textarea>
            <button class="act-send-btn" data-slide="${slideId}">Send</button>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const slideId = "${slideId}";
          const activityType = "chat_activity";
          const apiUrl = "${apiUrl}";
          const defaultSystemPrompt = ${JSON.stringify(defaultSystemPrompt)};

          let conversationHistory = [];
          let isStreaming = false;

          // Capture authToken from URL immediately on page load
          (function captureContext() {
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('authToken');
            const lessonId = params.get('lessonId');
            if (authToken) window.__authToken = authToken;
            if (lessonId) window.__lessonId = lessonId;
          })();

          const lessonIdFromWindow = (typeof window !== 'undefined' && window.__lessonId) || null;
          function getLessonId() {
            try {
              const params = new URLSearchParams(window.location.search);
              return params.get('lessonId') || lessonIdFromWindow;
            } catch (e) { return lessonIdFromWindow; }
          }

          async function logActivity(activityType, activityData) {
            let apiToken = window.__authToken;
            if (!apiToken) {
              try { apiToken = localStorage.getItem('authToken'); } catch (e) {}
            }
            if (!apiToken) return;

            const payload = {
              lessonId: getLessonId(),
              slideId: slideId,
              activityType,
              activityData: JSON.stringify(activityData || {})
            };

            try {
              const res = await fetch('https://dev-api-gateway.redbrick.ai/v1/edu/activities/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiToken },
                body: JSON.stringify(payload)
              });
              // ignore failures silently
            } catch (e) { /* ignore */ }
          }

          // Wait for DOM to be ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSlide);
          } else {
            initSlide();
          }

          function initSlide() {
            const sendBtn = document.querySelector('.act-send-btn[data-slide="' + slideId + '"]');
            const userInput = document.getElementById("userInput-" + slideId);

            if (!sendBtn || !userInput) {
              console.error("Required elements not found for slide:", slideId);
              return;
            }

            // Send button
            sendBtn.addEventListener("click", handleSend);

            // Enter key to send (Shift+Enter for new line)
            userInput.addEventListener("keydown", (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            });

            async function handleSend() {
              if (isStreaming) return;

              const userMessage = userInput.value.trim();
              if (!userMessage) return;

              const systemPrompt = defaultSystemPrompt;

              // Add user message to UI
              addMessage("user", userMessage);
              userInput.value = "";

              // Add to conversation history
              conversationHistory.push({ role: "user", content: userMessage });

              // Show typing indicator
              const typingId = showTypingIndicator();
              isStreaming = true;
              sendBtn.disabled = true;

              try {
                await sendMessageToAPI(systemPrompt, conversationHistory, typingId, userMessage);
              } catch (error) {
                removeTypingIndicator(typingId);
                addMessage("error", error.message);
                isStreaming = false;
                sendBtn.disabled = false;
              }
            }

            async function sendMessageToAPI(systemPrompt, messages, typingId, lastUserMessage) {
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
                systemPrompt: systemPrompt,
                messages: messages,
                stream: true
              };

              const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(requestBody),
              });

              if (!response.ok) {
                throw new Error("Oops, something went wrong please try again");
              }

              removeTypingIndicator(typingId);

              // Handle streaming response (Vercel AI SDK format)
              const reader = response.body.getReader();
              const decoder = new TextDecoder();
              let aiMessageDiv = createAIMessageDiv();
              let fullResponse = "";

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
                    updateAIMessage(aiMessageDiv, fullResponse);
                  }
                }

                // Add complete message to conversation history
                conversationHistory.push({ role: "assistant", content: fullResponse });
                logActivity(activityType, {
                  userMessage: lastUserMessage,
                  assistantMessage: fullResponse
                });

              } catch (error) {
                console.error("Streaming error:", error);
                throw new Error("Oops, something went wrong please try again");
              } finally {
                isStreaming = false;
                sendBtn.disabled = false;
              }
            }

            function addMessage(role, content) {
              const messagesContainer = document.getElementById("messages-" + slideId);
              const messageDiv = document.createElement("div");
              messageDiv.className = "act-message act-" + role + "-message";

              const contentDiv = document.createElement("div");
              contentDiv.className = "act-message-content";

              if (role === "error") {
                contentDiv.innerHTML = "<p><strong>Error:</strong> " + content + "</p>";
              } else {
                contentDiv.innerHTML = "<p>" + content.replace(/\\n/g, "<br>") + "</p>";
              }

              messageDiv.appendChild(contentDiv);
              messagesContainer.appendChild(messageDiv);
              scrollToBottom();
            }

            function createAIMessageDiv() {
              const messagesContainer = document.getElementById("messages-" + slideId);
              const messageDiv = document.createElement("div");
              messageDiv.className = "act-message act-ai-message";

              const contentDiv = document.createElement("div");
              contentDiv.className = "act-message-content";
              contentDiv.innerHTML = "<p></p>";

              messageDiv.appendChild(contentDiv);
              messagesContainer.appendChild(messageDiv);
              scrollToBottom();

              return messageDiv;
            }

            function updateAIMessage(messageDiv, content) {
              const contentDiv = messageDiv.querySelector(".act-message-content p");
              if (contentDiv) {
                contentDiv.textContent = content;
                scrollToBottom();
              }
            }

            function showTypingIndicator() {
              const messagesContainer = document.getElementById("messages-" + slideId);
              const typingDiv = document.createElement("div");
              const typingId = "typing-" + Date.now();
              typingDiv.id = typingId;
              typingDiv.className = "act-typing-indicator";
              typingDiv.innerHTML = \`
                <div class="act-typing-dots">
                  <span></span><span></span><span></span>
                </div>
              \`;
              messagesContainer.appendChild(typingDiv);
              scrollToBottom();
              return typingId;
            }

            function removeTypingIndicator(typingId) {
              const typingDiv = document.getElementById(typingId);
              if (typingDiv) {
                typingDiv.remove();
              }
            }

            function scrollToBottom() {
              const messagesContainer = document.getElementById("messages-" + slideId);
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
                const mine = acts.filter(a => a.slideId === slideId && a.activityType === activityType);
                // sort by createdAt
                mine.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                for (const a of mine) {
                  try {
                    const d = JSON.parse(a.activityData || '{}');
                    if (d.userMessage) addMessage('user', String(d.userMessage));
                    if (d.assistantMessage) addMessage('ai', String(d.assistantMessage));
                  } catch {}
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

        .chat-activity-slide {
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

        .act-container {
          width: 70%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }

        .act-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 3%;
          margin-bottom: 2%;
        }

        .act-title-box p {
          margin: 0;
          line-height: 1;
        }

        .act-chat-section {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex: 1;
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
        }

        .act-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .act-message {
          max-width: 85%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.75em;
          line-height: 1.4;
        }

        .act-user-message {
          align-self: flex-end;
          background: #000;
          color: white;
        }

        .act-ai-message {
          align-self: flex-start;
          background: #f0f0f0;
          color: #333;
        }

        .act-error-message {
          align-self: center;
          background: #fee;
          color: #c33;
          border: 1px solid #c33;
          font-size: 0.7em;
        }

        .act-message-content p {
          margin: 0;
        }

        .act-typing-indicator {
          align-self: flex-start;
          padding: 12px 16px;
        }

        .act-typing-dots {
          display: flex;
          gap: 4px;
        }

        .act-typing-dots span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: act-typing 1.4s infinite;
        }

        .act-typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .act-typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes act-typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }

        .act-input-area {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 2px solid #ddd;
          background: white;
        }

        .act-user-input {
          flex: 1;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.75em;
          font-family: inherit;
          resize: none;
          background: white;
        }

        .act-user-input:focus {
          outline: none;
          border-color: #000;
        }

        .act-send-btn {
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

        .act-send-btn:hover:not(:disabled) {
          background: #333;
        }

        .act-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
    </section>
  `;
}
