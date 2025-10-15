import { marked } from "marked";

export default function createStudentInputFieldActivitySlide(data, slideId) {
  const title = data.title || "Student Feedback";
  const questions = data.questions || [];

  // Generate unique IDs for each question
  const questionsWithIds = questions.map((q, index) => ({
    ...q,
    id: `question-${slideId}-${index}`,
  }));

  // Generate inline script for interactivity
  const scriptContent = `
    (function() {
      console.log('Student input field activity script loaded for slide ${slideId}');

      function initStudentActivity_${slideId}() {
        const slide = document.getElementById('${slideId}');
        console.log('Trying to find slide ${slideId}:', slide);

        if (!slide) {
          setTimeout(initStudentActivity_${slideId}, 50);
          return;
        }

        // Initialize star ratings
        const starContainers = slide.querySelectorAll('.star-rating-container');
        console.log('Found', starContainers.length, 'star rating containers');

        starContainers.forEach((container) => {
          const stars = container.querySelectorAll('.star');
          const input = container.querySelector('input[type="hidden"]');
          let currentRating = 0;

          stars.forEach((star, index) => {
            // Hover effect
            star.addEventListener('mouseenter', () => {
              highlightStars(stars, index + 1);
            });

            // Click to set rating
            star.addEventListener('click', () => {
              currentRating = index + 1;
              input.value = currentRating;
              container.setAttribute('data-rating', currentRating);
              highlightStars(stars, currentRating);
            });
          });

          // Mouse leave - restore current rating
          container.addEventListener('mouseleave', () => {
            highlightStars(stars, currentRating);
          });
        });

        function highlightStars(stars, rating) {
          stars.forEach((star, index) => {
            if (index < rating) {
              star.classList.add('active');
              star.innerHTML = '★';
            } else {
              star.classList.remove('active');
              star.innerHTML = '☆';
            }
          });
        }

        // Share button functionality
        const shareBtn = slide.querySelector('.share-button');
        if (shareBtn) {
          shareBtn.addEventListener('click', () => {
            const responses = [];
            const questions = ${JSON.stringify(questionsWithIds)};

            questions.forEach((question) => {
              const questionId = question.id;
              let answer = '';

              if (question.type === 'text') {
                const textarea = slide.querySelector('#' + questionId);
                answer = textarea ? textarea.value : '';
              } else if (question.type === 'rating') {
                const hiddenInput = slide.querySelector('#' + questionId);
                answer = hiddenInput ? hiddenInput.value || '0' : '0';
              }

              responses.push({
                question: question.question,
                type: question.type,
                answer: answer
              });
            });

            // Format responses for sharing
            const formattedResponses = responses.map((r, index) => {
              const answerText = r.type === 'rating'
                ? (r.answer === '0' ? 'Not rated' : r.answer + ' star' + (r.answer === '1' ? '' : 's'))
                : (r.answer || 'No response');
              return 'Q' + (index + 1) + '. ' + r.question + '\\n   Answer: ' + answerText;
            }).join('\\n\\n');

            const shareText = '=== Student Feedback ===\\n\\n' + formattedResponses;

            // Try to copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(shareText)
                .then(() => {
                  // Visual feedback
                  const originalText = shareBtn.textContent;
                  shareBtn.textContent = '✓ Copied!';
                  shareBtn.style.backgroundColor = '#28a745';

                  setTimeout(() => {
                    shareBtn.textContent = originalText;
                    shareBtn.style.backgroundColor = '';
                  }, 2000);
                })
                .catch((err) => {
                  console.error('Failed to copy:', err);
                  alert('Responses logged to console');
                  console.log(shareText);
                });
            } else {
              // Fallback for browsers without clipboard API
              console.log('Student Responses:', responses);
              console.log(shareText);
              alert('Responses logged to console (clipboard not available)');
            }
          });
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStudentActivity_${slideId});
      } else {
        initStudentActivity_${slideId}();
      }
    })();
  `;

  // Generate question HTML
  const generateQuestionHTML = (question) => {
    if (question.type === "text") {
      return `
        <div class="question-item">
          <label class="question-label" for="${question.id}">
            ${marked.parse(question.question)}
          </label>
          <textarea
            id="${question.id}"
            class="text-input"
            rows="3"
            placeholder="Type your answer here..."
          ></textarea>
        </div>
      `;
    } else if (question.type === "rating") {
      return `
        <div class="question-item">
          <label class="question-label">
            ${marked.parse(question.question)}
          </label>
          <div class="star-rating-container" data-rating="0">
            <input type="hidden" id="${question.id}" value="0" />
            <span class="star" data-value="1">☆</span>
            <span class="star" data-value="2">☆</span>
            <span class="star" data-value="3">☆</span>
            <span class="star" data-value="4">☆</span>
            <span class="star" data-value="5">☆</span>
            <span class="rating-label">Click to rate</span>
          </div>
        </div>
      `;
    }
    return "";
  };

  return `
    <section class="slide student-input-activity-slide" id="${slideId}">
      <div class="activity-container">
        <div class="activity-title-box">
          ${marked.parse(title)}
        </div>

        <div class="questions-scroll-container">
          <div class="questions-list">
            ${questionsWithIds.map(generateQuestionHTML).join("")}
          </div>
        </div>

        <div class="share-section">
          <button class="share-button">Share Your Responses</button>
        </div>
      </div>

      <style>
        .student-input-activity-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.2;
        }

        .activity-container {
          width: 80%;
          height: 75%;
          display: flex;
          flex-direction: column;
        }

        .activity-title-box {
          font-size: 120%;
          font-weight: 700;
          text-align: center;
          padding: 1.5% 0;
          border-bottom: 2px solid #e0e0e0;
          margin-bottom: 2%;
        }

        .activity-title-box p {
          margin: 0;
        }

        .questions-scroll-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 2%;
          margin-bottom: 2%;
          scrollbar-width: thin;
          scrollbar-color: #888 #f0f0f0;
        }

        .questions-scroll-container::-webkit-scrollbar {
          width: 8px;
        }

        .questions-scroll-container::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 4px;
        }

        .questions-scroll-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .questions-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        .questions-list {
          padding: 1% 0;
        }

        .question-item {
          margin-bottom: 4%;
          padding: 2.5%;
          background: #f9f9f9;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
        }

        .question-label {
          display: block;
          font-size: 90%;
          font-weight: 600;
          margin-bottom: 1.5%;
          color: #333;
        }

        .question-label p {
          margin: 0;
        }

        .text-input {
          width: 96%;
          padding: 1.5%;
          font-size: 85%;
          font-family: inherit;
          border: 2px solid #ddd;
          border-radius: 8px;
          resize: vertical;
          min-height: 60px;
          background: white;
          transition: border-color 0.3s ease;
        }

        .text-input:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .star-rating-container {
          display: flex;
          align-items: center;
          gap: 0.5%;
          padding: 1% 0;
        }

        .star {
          font-size: 200%;
          color: #ddd;
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          user-select: none;
        }

        .star:hover {
          transform: scale(1.1);
        }

        .star.active {
          color: #FFD700;
        }

        .rating-label {
          margin-left: 2%;
          font-size: 75%;
          color: #666;
          font-style: italic;
        }

        .star-rating-container[data-rating="1"] .rating-label::after { content: " (1 star)"; }
        .star-rating-container[data-rating="2"] .rating-label::after { content: " (2 stars)"; }
        .star-rating-container[data-rating="3"] .rating-label::after { content: " (3 stars)"; }
        .star-rating-container[data-rating="4"] .rating-label::after { content: " (4 stars)"; }
        .star-rating-container[data-rating="5"] .rating-label::after { content: " (5 stars)"; }

        .star-rating-container[data-rating]:not([data-rating="0"]) .rating-label {
          content: "";
        }

        .star-rating-container[data-rating]:not([data-rating="0"]) .rating-label::before {
          content: "";
        }

        .star-rating-container[data-rating]:not([data-rating="0"]) .rating-label {
          color: #333;
          font-style: normal;
        }

        .share-section {
          padding: 2% 0 1% 0;
          border-top: 2px solid #e0e0e0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .share-button {
          background: #000;
          color: white;
          border: none;
          padding: 1.5% 4%;
          font-size: 95%;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .share-button:hover {
          background: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .share-button:active {
          transform: translateY(0);
        }
      </style>
    </section>
    <script>${scriptContent}</script>
  `;
}
