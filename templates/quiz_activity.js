import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createQuizActivitySlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');
  const question = data.question || "Question text";
  const choices = data.choices || [];
  const correctAnswer = data.correctAnswer || 0;
  const initialActivityFromData = {
    selectedChoiceIndex: typeof data.selectedChoiceIndex === 'number' ? data.selectedChoiceIndex : (data._activity && typeof data._activity.selectedChoiceIndex === 'number' ? data._activity.selectedChoiceIndex : null),
    correctAnswerIndex: typeof data.correctAnswerIndex === 'number' ? data.correctAnswerIndex : (data._activity && typeof data._activity.correctAnswerIndex === 'number' ? data._activity.correctAnswerIndex : null),
    isCorrect: typeof data.studentAnswerCorrect === 'boolean' ? data.studentAnswerCorrect : (data._activity && typeof data._activity.isCorrect === 'boolean' ? data._activity.isCorrect : null)
  };

  // Generate inline script that will execute when the HTML is inserted
  const scriptContent = `
    (function() {
      console.log('Quiz script loaded for slide ${slideId}');

      function initQuiz_${slideId}() {
        const slide = document.getElementById('${slideId}');
        console.log('Trying to find slide ${slideId}:', slide);

        if (!slide) {
          setTimeout(initQuiz_${slideId}, 50);
          return;
        }

        const activityType = 'quiz_activity';
        const quizQuestion = ${JSON.stringify(question)};
        const quizChoices = ${JSON.stringify(choices)};
        const quizCorrectIndex = ${JSON.stringify(correctAnswer)};

        const choiceElements = slide.querySelectorAll('.quiz-choice');
        console.log('Found', choiceElements.length, 'quiz choices');

        if (choiceElements.length === 0) {
          setTimeout(initQuiz_${slideId}, 50);
          return;
        }

        let answered = false;
        const initialActivity = ${JSON.stringify(initialActivityFromData)};

        (function captureContext() {
          try {
            const params = new URLSearchParams(window.location.search);
            const authToken = params.get('authToken');
            const lessonId = params.get('lessonId');
            if (authToken) window.__authToken = authToken;
            if (lessonId) window.__lessonId = lessonId;
          } catch (e) {}
        })();

        // Resolve lessonId: URL param > window.__lessonId
        const lessonIdFromWindow = (typeof window !== 'undefined' && window.__lessonId) || null;
        function getLessonId() {
          try {
            const params = new URLSearchParams(window.location.search);
            const fromUrl = params.get('lessonId');
            if (fromUrl) return fromUrl;
          } catch (e) {}
          return lessonIdFromWindow;
        }

        async function logActivity(activityType, activityData) {
          // Get auth token from global variable or localStorage (dev fallback)
          let apiToken = window.__authToken;
          if (!apiToken) {
            try { apiToken = localStorage.getItem('authToken'); } catch (e) {}
          }
          if (!apiToken) {
            console.warn('Auth token not found; skipping activity log');
            return;
          }

          const payload = {
            lessonId: getLessonId(),
            slideId: '${slideId}',
            activityType,
            activityData: JSON.stringify(activityData || {})
          };

          try {
            const res = await fetch('https://dev-api-gateway.redbrick.ai/v1/edu/activities/log', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiToken
              },
              body: JSON.stringify(payload)
            });
            if (!res.ok) {
              console.warn('Failed to log activity', res.status);
            }
          } catch (err) {
            console.warn('Error logging activity', err);
          }
        }

        function normalizeText(t) {
          try { return String(t || '').replace(/\s+/g, ' ').trim().toLowerCase(); } catch { return ''; }
        }

        function getDomChoicesText() {
          try {
            return Array.from(choiceElements).map(c => c.querySelector('.quiz-choice-text')?.innerText?.trim() || '');
          } catch (e) { return []; }
        }

        async function hydrateFromActivity() {
          if (initialActivity && initialActivity.selectedChoiceIndex !== null) {
            try {
              answered = true;
              choiceElements.forEach(function(c) { c.classList.add('disabled'); });
              let correctChoice = null;
              choiceElements.forEach(function(c) {
                if (parseInt(c.dataset.choiceIndex, 10) === initialActivity.correctAnswerIndex) {
                  correctChoice = c;
                }
              });
              choiceElements.forEach(function(c) {
                const idx = parseInt(c.dataset.choiceIndex, 10);
                if (idx === initialActivity.selectedChoiceIndex) {
                  const isCorrect = c.dataset.correct === 'true';
                  if (isCorrect) {
                    c.classList.add('correct', 'selected');
                  } else {
                    c.classList.add('incorrect', 'selected');
                    if (correctChoice) correctChoice.classList.add('correct');
                  }
                }
              });
              return; // skip API fetch if JSON provided data
            } catch (e) {
              console.warn('Failed applying initial activity from JSON, will attempt API', e);
            }
          }

          let apiToken = window.__authToken;
          if (!apiToken) {
            try { apiToken = localStorage.getItem('authToken'); } catch (e) {}
          }
          if (!apiToken) {
            console.warn('Auth token not found; skipping activity hydrate');
            return;
          }

          const lessonId = getLessonId();
          if (!lessonId) return;

          const url = new URL('https://dev-api-gateway.redbrick.ai/v1/edu/activities/student');
          url.searchParams.set('lessonId', lessonId);
          url.searchParams.set('page', '1');
          url.searchParams.set('limit', '100');

          try {
            const res = await fetch(url.toString(), {
              method: 'GET',
              headers: { 'Authorization': 'Bearer ' + apiToken }
            });
            if (!res.ok) return;
            const data = await res.json();
            const activities = Array.isArray(data.activities) ? data.activities : [];
            const my = activities.find(a => a.slideId === '${slideId}' && a.activityType === activityType);
            if (!my) return;
            let parsed = {};
            try { parsed = JSON.parse(my.activityData || '{}'); } catch {}

            let selectedIndex = (typeof parsed.selectedChoiceIndex === 'number' ? parsed.selectedChoiceIndex : null);
            let correctIndex = (typeof parsed.correctAnswerIndex === 'number' ? parsed.correctAnswerIndex : null);

            // Fallback: try to map using texts if indices are missing or out of range
            const domChoices = getDomChoicesText();
            const selectedText = parsed.selectedAnswerText || (typeof selectedIndex === 'number' ? (quizChoices?.[selectedIndex] ?? domChoices?.[selectedIndex]) : null);
            const correctText = parsed.correctAnswerText || (typeof correctIndex === 'number' ? (quizChoices?.[correctIndex] ?? domChoices?.[correctIndex]) : null);

            if ((selectedIndex === null || selectedIndex < 0 || selectedIndex >= domChoices.length) && selectedText) {
              const needle = normalizeText(selectedText);
              selectedIndex = domChoices.findIndex(t => normalizeText(t) === needle);
            }
            if ((correctIndex === null || correctIndex < 0 || correctIndex >= domChoices.length) && correctText) {
              const needle = normalizeText(correctText);
              correctIndex = domChoices.findIndex(t => normalizeText(t) === needle);
            }

            if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= choiceElements.length) return;

            // Apply UI state
            answered = true;
            choiceElements.forEach(function(c) { c.classList.add('disabled'); });

            let correctChoice = null;
            choiceElements.forEach(function(c) {
              if (parseInt(c.dataset.choiceIndex, 10) === correctIndex) {
                correctChoice = c;
              }
            });

            choiceElements.forEach(function(c) {
              const idx = parseInt(c.dataset.choiceIndex, 10);
              if (idx === selectedIndex) {
                const isCorrect = c.dataset.correct === 'true';
                if (isCorrect) {
                  c.classList.add('correct', 'selected');
                } else {
                  c.classList.add('incorrect', 'selected');
                  if (correctChoice) correctChoice.classList.add('correct');
                }
              }
            });
          } catch (e) {
            console.warn('Failed to hydrate quiz activity', e);
          }
        }

        function onAnswerSelected(isCorrect, selectedChoice, correctChoice) {
          console.log('Answer selected. Correct?', isCorrect);
          if (isCorrect) {
            alert('🎉 Correct! Great job!');
          } else {
            const correctText = correctChoice.querySelector('.quiz-choice-text').innerText.trim();
            alert('❌ Incorrect. The correct answer was: ' + correctText);
          }
        }

        choiceElements.forEach(function(choice) {
          console.log('Attaching click listener to choice:', choice);
          choice.addEventListener('click', function(event) {
            console.log('Choice clicked!', this);
            if (answered) return;

            answered = true;
            const isCorrect = this.dataset.correct === 'true';
            const selectedIndex = parseInt(this.dataset.choiceIndex, 10);

            choiceElements.forEach(function(c) { c.classList.add('disabled'); });

            let correctChoice = null;
            let correctIndex = null;
            choiceElements.forEach(function(c) {
              if (c.dataset.correct === 'true') {
                correctChoice = c;
                correctIndex = parseInt(c.dataset.choiceIndex, 10);
              }
            });

            if (isCorrect) {
              this.classList.add('correct', 'selected');
            } else {
              this.classList.add('incorrect', 'selected');
              if (correctChoice) {
                correctChoice.classList.add('correct');
              }
            }

            onAnswerSelected(isCorrect, this, correctChoice);

            const selectedAnswerText = (quizChoices && quizChoices[selectedIndex] !== undefined)
              ? quizChoices[selectedIndex]
              : (this.querySelector('.quiz-choice-text')?.innerText?.trim() || '');
            const correctAnswerText = (quizChoices && quizChoices[correctIndex] !== undefined)
              ? quizChoices[correctIndex]
              : (correctChoice?.querySelector('.quiz-choice-text')?.innerText?.trim() || '');

            logActivity(activityType, {
              question: quizQuestion,
              choices: Array.isArray(quizChoices) && quizChoices.length ? quizChoices : getDomChoicesText(),
              isCorrect: !!isCorrect,
              selectedChoiceIndex: selectedIndex,
              selectedAnswerText,
              correctAnswerIndex: correctIndex,
              correctAnswerText
            });
          });
        });

        hydrateFromActivity();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuiz_${slideId});
      } else {
        initQuiz_${slideId}();
      }
    })();
  `;

  return `
    <section class="slide canva-quiz-activity-slide" id="${slideId}">
      <div class="quiz-slide-container">
        <div class="quiz-slide-title-box">
          ${marked.parse(data.title || "Quiz Time!")}
        </div>
        <div class="quiz-question-box">
          ${marked.parse(question)}
        </div>
        <div class="quiz-choices-container">
          ${choices
            .map(
              (choice, index) => `
            <button class="quiz-choice" data-choice-index="${index}" data-correct="${
                index === correctAnswer
              }">
              <span class="quiz-choice-letter">${String.fromCharCode(
                65 + index
              )}</span>
              <span class="quiz-choice-text">${marked.parse(choice)}</span>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .canva-quiz-activity-slide {
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
        .quiz-slide-container {
          width: 85%;
          display: flex;
          flex-direction: column;
          justify-content: start;
          height: 84%;
        }
        .quiz-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 110%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 4%;
          margin-bottom: 3%;
        }
        .quiz-question-box {
          font-size: 90%;
          font-weight: 600;
          text-align: center;
          margin-bottom: 5%;
          padding: 0 5%;
        }
        .quiz-choices-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3%;
          flex: 1;
          align-content: center;
          padding: 0 5%;
        }
        .quiz-choice {
          display: flex;
          align-items: center;
          padding: 3% 4%;
          background-color: #ffffff;
          border: 3px solid #333;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 85%;
          font-weight: 500;
          text-align: left;
          min-height: 80px;
        }
        .quiz-choice:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          border-color: #555;
        }
        .quiz-choice-letter {
          width: 50px;
          height: 50px;
          background-color: #ffd59e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 95%;
          font-weight: 700;
          flex-shrink: 0;
          margin-right: 4%;
          border: 2px solid #000101;
        }
        .quiz-choice-text {
          flex: 1;
        }
        .quiz-choice-text p {
          margin: 0 !important;
        }
        .quiz-choice.selected {
          border-width: 4px;
        }
        .quiz-choice.correct {
          background-color: #d4edda;
          border-color: #28a745;
        }
        .quiz-choice.correct .quiz-choice-letter {
          background-color: #28a745;
          color: white;
        }
        .quiz-choice.incorrect {
          background-color: #f8d7da;
          border-color: #dc3545;
        }
        .quiz-choice.incorrect .quiz-choice-letter {
          background-color: #dc3545;
          color: white;
        }
        .quiz-choice.disabled {
          pointer-events: none;
          opacity: 0.7;
        }
      </style>
    </section>
    <script>${scriptContent}</script>
  `;
}
