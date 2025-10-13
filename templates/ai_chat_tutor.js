import { marked } from "marked";

export default function createAIChatTutorSlide(data, slideId) {
  const apiUrl =
    data.apiUrl || "https://dev-ai-model.redbrick.ai/api/chat-generator";
  const title = data.title || "AI Chat Tutor";
  const defaultSystemPrompt =
    data.systemPrompt ||
    data.defaultSystemPrompt ||
    "You are a helpful educational tutor. Explain concepts clearly and encourage students to think critically. Ask guiding questions to help students discover answers themselves.";
  const placeholder =
    data.placeholder || "Ask me anything about today's lesson...";

  return `
    <section class="slide ai-chat-tutor-slide" id="${slideId}">
      <div class="act-container">
        <div class="act-title-box">${marked.parse(title)}</div>

        <div class="act-content-wrapper">
          <div class="act-chat-section">
            <div class="act-messages" id="messages-${slideId}">
              <div class="act-welcome-message">
                <div class="act-message act-ai-message">
                  <div class="act-message-content">
                    <p>👋 Hello! I'm your AI tutor. Ask me anything about today's lesson, and I'll help you understand the concepts better.</p>
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

          <div class="act-control-section">
            <div class="act-system-prompt-section">
              <label class="act-label">System Prompt (Tutor's Behavior):</label>
              <textarea
                class="act-system-prompt"
                id="systemPrompt-${slideId}"
                rows="12"
              >${defaultSystemPrompt}</textarea>
            </div>

            <div class="act-actions">
              <button class="act-clear-btn" data-slide="${slideId}">Clear Chat</button>
              <button class="act-reset-btn" data-slide="${slideId}">Reset Prompt</button>
            </div>
          </div>
        </div>
      </div>

      <script>
        (function() {
          const slideId = "${slideId}";
          const apiUrl = "${apiUrl}";
          const defaultSystemPrompt = ${JSON.stringify(defaultSystemPrompt)};

          let conversationHistory = [];
          let isStreaming = false;

          // Wait for DOM to be ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSlide);
          } else {
            initSlide();
          }

          function initSlide() {
            const sendBtn = document.querySelector('.act-send-btn[data-slide="' + slideId + '"]');
            const clearBtn = document.querySelector('.act-clear-btn[data-slide="' + slideId + '"]');
            const resetBtn = document.querySelector('.act-reset-btn[data-slide="' + slideId + '"]');
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

            // Clear chat button
            clearBtn.addEventListener("click", () => {
              conversationHistory = [];
              const messagesContainer = document.getElementById("messages-" + slideId);
              messagesContainer.innerHTML = \`
                <div class="act-welcome-message">
                  <div class="act-message act-ai-message">
                    <div class="act-message-content">
                      <p>👋 Hello! I'm your AI tutor. Ask me anything about today's lesson, and I'll help you understand the concepts better.</p>
                    </div>
                  </div>
                </div>
              \`;
            });

            // Reset prompt button
            resetBtn.addEventListener("click", () => {
              document.getElementById("systemPrompt-" + slideId).value = defaultSystemPrompt;
            });

            async function handleSend() {
              if (isStreaming) return;

              const userMessage = userInput.value.trim();
              if (!userMessage) return;

              const systemPrompt = document.getElementById("systemPrompt-" + slideId).value.trim();

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
                await sendMessageToAPI(systemPrompt, conversationHistory, typingId);
              } catch (error) {
                removeTypingIndicator(typingId);
                addMessage("error", error.message);
                isStreaming = false;
                sendBtn.disabled = false;
              }
            }

            async function sendMessageToAPI(systemPrompt, messages, typingId) {
              // Extract token from URL hash first, fallback to localStorage
              const getAuthTokenFromHash = () => {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                return params.get('authToken');
              };

              const apiToken = getAuthTokenFromHash() || localStorage.getItem("authToken");

              if (!apiToken) {
                throw new Error('API token not found. Please set it in localStorage with key "authToken"');
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.error || "API Error: " + response.status + " " + response.statusText
                );
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

              } catch (error) {
                console.error("Streaming error:", error);
                throw new Error("Error receiving response: " + error.message);
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
          }
        })();
      </script>

      <style>
        .ai-chat-tutor-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }

        .act-container {
          width: 85%;
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
          margin-top: 4%;
          margin-bottom: 2%;
        }

        .act-title-box p {
          margin: 0;
          line-height: 1;
        }

        .act-content-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3%;
          align-items: start;
          width: 100%;
          flex: 1;
          overflow: hidden;
        }

        .act-chat-section {
          display: flex;
          flex-direction: column;
          height: 95%;
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

        .act-control-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          height: 100%;
        }

        .act-system-prompt-section {
          display: flex;
          max-height: 80%;
          flex-direction: column;
          gap: 8px;
        }

        .act-label {
          font-size: 0.75em;
          font-weight: 600;
          color: #555;
        }

        .act-system-prompt {
          width: 100%;
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 0.7em;
          font-family: inherit;
          resize: vertical;
          background: white;
          box-sizing: border-box;
          flex: 1;
        }

        .act-system-prompt:focus {
          outline: none;
          border-color: #000;
        }

        .act-actions {
          display: flex;
          gap: 10px;
        }

        .act-clear-btn,
        .act-reset-btn {
          flex: 1;
          background: white;
          color: #333;
          border: 2px solid #ddd;
          padding: 10px;
          font-size: 0.75em;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .act-clear-btn:hover,
        .act-reset-btn:hover {
          background: #f5f5f5;
          border-color: #000;
        }
      </style>
    </section>
  `;
}
