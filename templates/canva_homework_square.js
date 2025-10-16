import { marked } from "marked";

export default function createHomeworkSquareSlide(data, slideId) {
  // data.homeworks: [{ homework: string, description: string }, ...]
  const colors = ["#FFE897", "#FFE6C3", "#DAF7F1"];
  const homeworks = (data.homeworks || []).slice(0, 3);

  return `
    <section class="slide hs-slide" id="${slideId}">
      <div class="hs-slide-container">
        <div class="hs-slide-title-box">${marked.parse(data.title)}</div>
        <div class="hs-slide-row">
          ${homeworks
            .map(
              (homework, idx) => `
            <div class="hs-slide-card" style="background-color:${colors[idx]};">
              <div class="hs-slide-homework">${marked.parse(
                homework.homework
              )}</div>
              <div class="hs-slide-description">${marked.parse(
                homework.description
              )}</div>
            </div>`
            )
            .join("")}
        </div>
        <div class="hs-slide-footer-text">
            <span class="hs-slide-footer-icon">☆&nbsp;</span>${marked.parse(
              data.footer
            )}</div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .hs-slide {
          background-image: url('https://corsproxy.io/?https://i.ibb.co/XZbqydhC/content-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .hs-slide-container {
          width: 80%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content:start;
        }
        .hs-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 6%;
        }
        .hs-slide-row {
          display: flex;
          gap: 2%;
          justify-content: center;
          align-items: center;
          margin-top: 6%;
          width: 100%;
        }
        .hs-slide-card {
          position: relative;
          width: 28%;
          aspect-ratio: 1 / 1;
          border-radius: 5%;
          padding: 4% 3%;
          box-sizing: border-box;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
        }
        .hs-slide-homework {
          display: flex;
          justify-content: center;
          width: 100%;
          font-size: 80%;
          font-weight: 600;
        }
        .hs-slide-description {
          display: flex;
          justify-content: center;
          width: 100%;
          font-size: 75%;
          font-weight: 400;
        }
        .hs-slide-footer-icon {
          font-size: 80%;
          color: #F76C6C;
          transform: rotate(5deg);
        }
        .hs-slide-footer-text {
          display: flex;
          flex: 1;
          width: 100%;
          font-size: 80%;
          font-weight: 600;
          align-items: center;
          justify-content: center;
        }
      </style>
    </section>
  `;
}
