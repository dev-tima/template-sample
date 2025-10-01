import { marked } from "marked";

export default function createContentWithCaptionSlide(data, slideId) {
	return `
    <section class="slide content-with-caption-slide" id="${slideId}">
      <div class="cwc-slide-container">
        <div class="cwc-slide-caption-container">
          <div class="cwc-slide-title-box">
            ${marked.parse(data.title)}
          </div>
          <div class="cwc-slide-caption-box">
            ${marked.parse(data.caption)}
          </div>
        </div>
        <div class="cwc-slide-content-container">
          <div class="cwc-slide-content-box">
            ${marked.parse(data.content)}
          </div>
        </div>
      </div>
      <style>
        .content-with-caption-slide {
          display: flex;
          align-items: center;
          justify-content: start;
          padding: 0;
          line-height: 1.08;
          flex-direction: column;
        }
        .cwc-slide-container {
          width: 85%;
          height: 80%;
          margin: 0 auto;
          display: flex;
          flex-direction: row;
          margin-top: 3%;
          gap: 4.5%;
        }
        .cwc-slide-caption-container {
          display: flex;
          width: 38%;
          height: 100%;
          flex-direction: column;
        }
        .cwc-slide-title-box {
          height: 55%;
          display: flex;
          align-items: flex-end;
          font-size: 160%;
        }
        .cwc-slide-caption-box {
          height: 100%;
          display: flex;
          font-size: 80%;
        }
        .cwc-slide-content-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex: 1;
        }
        .cwc-slide-content-box {
          display: flex;
          flex-direction: column; 
          align-items: flex-start;
          justify-content: flex-start;
          width: 100%;
          height: 100%;
          font-size: 160%;
          margin-top: 14%;
        }
      </style>
    </section>
  `;
}
