import { marked } from "marked";

export default function createTitleQnASlide(data, slideId) {
  return `
    <section class="slide title-qna-slide" id="${slideId}">
      <div class="tq-slide-container">
        <div class="tq-decorations">
          <div class="tq-question-mark tq-left">?</div>
          <div class="tq-qna-text">Q&A</div>
          <div class="tq-question-mark tq-right">?</div>
        </div>
        <div class="tq-slide-title">${marked.parse(data.title)}</div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .title-qna-slide {
          background-image: url('https://corsproxy.io/?https://i.ibb.co/XZbqydhC/content-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
          position: relative;
        }
        .tq-slide-container {
          width: 80%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .tq-decorations {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
        }
        .tq-qna-text {
          font-size: 200%;
          font-weight: 700;
          color: #FFD59E;
          position: relative;
          z-index: 2;
        }
        .tq-question-mark {
          font-size: 300%;
          font-weight: 700;
          position: absolute;
        }
        .tq-question-mark.tq-left {
          z-index: 0;
          color: #B8C5E8;
          left: 12%;
          top: 32%;
          transform: rotate(-15deg);
        }
        .tq-question-mark.tq-right {
          z-index: 0;
          color: #FFD59E;
          right: 6%;
          bottom: -220%;
          transform: rotate(20deg);
        }
        .tq-slide-title {
          text-align: center;
          margin-top: 2%;
          font-size: 160%;
          font-weight: 700;
          position: relative;
          z-index: 2;
        }
      </style>
    </section>
  `;
}
