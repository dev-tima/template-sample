import { marked } from "marked";

export default function createQuizActivitySlide(data, slideId) {
  const question = data.question || "Question text";
  const choices = data.choices || [];
  const correctAnswer = data.correctAnswer || 0;
  const background = data.background || "https://corsproxy.io/?https://i.ibb.co/MDpwtB2R/intro-bg.png";

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

        const choiceElements = slide.querySelectorAll('.quiz-choice');
        console.log('Found', choiceElements.length, 'quiz choices');

        if (choiceElements.length === 0) {
          setTimeout(initQuiz_${slideId}, 50);
          return;
        }

        let answered = false;

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

            choiceElements.forEach(function(c) { c.classList.add('disabled'); });

            let correctChoice = null;
            choiceElements.forEach(function(c) {
              if (c.dataset.correct === 'true') {
                correctChoice = c;
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
          });
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuiz_${slideId});
      } else {
        initQuiz_${slideId}();
      }
    })();
  `;

  return `
    <section class="slide canva-quiz-activity-slide" id="${slideId}" style="background-image: url('${background}'); background-size: cover; background-position: center;">
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
        .canva-quiz-activity-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
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
