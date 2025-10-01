import { marked } from "marked";

export default function createComparisonSlide(data, slideId) {
	return `
    <section class="slide comparison-slide" id="${slideId}">
      <div class="c-slide-container">
        <div class="c-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="c-slide-compare-container">
          <div class="c-slide-col">
            <div class="c-slide-col-title">
              ${marked.parse(data.subtitle1)}
            </div>
            <div class="c-slide-col-content">
              ${marked.parse(data.content1)}
            </div>
          </div>
          <div class="c-slide-col">
            <div class="c-slide-col-title">
              ${marked.parse(data.subtitle2)}
            </div>
            <div class="c-slide-col-content">
              ${marked.parse(data.content2)}
            </div>
          </div>
        </div>
      </div>
      <style>
        .comparison-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .c-slide-container {
          width: 85%;
          height: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: start;
        }
        .c-slide-title-box {
          margin-top: 4%;
          height: 20%;
          display: flex;
          align-items: center;
          justify-content: start;
          font-size: 230%;
        }
        .c-slide-compare-container {
          display: flex;
          gap: 1%;
          height:60%
        }
        .c-slide-col {
          height: 100%;
          width: 49.5%;
          display: flex;
          flex-direction: column;
        }
        .c-slide-col-title {
          height: 20%;
          width: 100%;
          font-size: 125%;
          font-weight: bold;
          display: flex;
          align-items: flex-end;
          justify-content: start;
        }
        .c-slide-col-content {
          height: 50%;
          font-size: 150%;
          overflow-y: auto;
        }
      </style>
    </section>
  `;
}
