import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createComparisonSlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');
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
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .comparison-slide {
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
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
          font-size: 140%;
        }
        .c-slide-compare-container {
          display: flex;
          gap: 1%;
          height: 60%;
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
          font-size: 90%;
          font-weight: bold;
          display: flex;
          align-items: flex-end;
          justify-content: start;
        }
        .c-slide-col-content {
          height: 50%;
          font-size: 100%;
          overflow-y: auto;
        }
      </style>
    </section>
  `;
}
