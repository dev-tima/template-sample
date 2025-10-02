import { marked } from "marked";

export default function createContentSummarySlide(data, slideId) {
  const summarys = data.summarys ? data.summarys.slice(0, 2) : [];

  return `
    <section class="slide content-summary-slide" id="${slideId}">
      <div class="cs-slide-container">
        <div class="cs-slide-title-box">${marked.parse(data.title)}</div>
        <div class="cs-slide-header-box">${marked.parse(data.header)}</div>
        <div class="cs-slide-list-container">
          ${summarys
            .map(
              (summary, idx) => `
            <div class="cs-slide-item">
              <div class="cs-slide-icon">✓</div>
              <div class="cs-slide-text">${marked.parse(summary)}</div>
            </div>
            ${
              idx < summarys.length - 1
                ? `<div class="cs-slide-div"></div>`
                : ""
            }
            `
            )
            .join("")}
        </div>
      </div>
      <style>
        .content-summary-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .cs-slide-container {
          width: 80%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }
        .cs-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 6%;
        }
        .cs-slide-header-box {
          display: flex;
          width: 75%;
          height: 10%;
          align-items: center;
          padding: 0.8% 3%;
          background-color: #ffd59e;
          border-radius: 50px;
          font-size: 80%;
          font-weight: 500;
          justify-content: center;
          margin-top: 8%;
        }
        .cs-slide-list-container {
          display: flex;
          width: 100%;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin-top: 2%;
        }
        .cs-slide-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 3%;
        }
        .cs-slide-icon {
          flex-shrink: 0;
          width: 6%;
          aspect-ratio: 1 / 1;
          background-color: #FFD59E;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80%;
          font-weight: 500;
          color: #fff;
          margin-right: 4%;
        }
        .cs-slide-text {
          flex: 1;
          font-size: 75%;
          font-weight: 500;
        }
        .cs-slide-div {
          height: 2px;
          background-color: #262626;
          width: 100%;
          margin-bottom: 2%;
        }
      </style>
    </section>
  `;
}
