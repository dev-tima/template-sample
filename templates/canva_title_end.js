import { marked } from "marked";

export default function createTitleEndSlide(data, slideId) {
  return `
    <section class="slide title-end-slide" id="${slideId}">
      <div class="title-end-slide-container">
        <div class="title-end-slide-title-box">${marked.parse(data.title)}</div>
        <div class="title-end-slide-subtitle-box">${marked.parse(
          data.subtitle
        )}</div>
        <div class="title-end-slide-footer-box">${marked.parse(
          data.footer
        )}</div>
      </div>
      <style>
        .title-end-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .title-end-slide-container {
          width: 75%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 84%;
        }
        .title-end-slide-title-box {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 200%;
          font-weight: 700;
          text-align: center;
          margin-top: 3%;
        }
        .title-end-slide-subtitle-box {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100%;
          font-weight: 600;
          text-align: center;
          margin-top: 1%;
        }
        .title-end-slide-footer-box {
          align-self: center;
          font-size: 85%;
          font-weight: 500;
          text-align: center;
          margin-top: 12%;
        }
      </style>
    </section>
  `;
}
