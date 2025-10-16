import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createTwoContentSlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');
  return `
    <section class="slide two-content-slide" id="${slideId}">
      <div class="tc-slide-container">
        <div class="tc-slide-title-box">${marked.parse(data.title)}</div>
        <div class="tc-slide-content-container">
          <div class="tc-slide-content-box">
            ${marked.parse(data.content1)}
          </div>
          <div class="tc-slide-content-box">
            ${marked.parse(data.content2)}
          </div>
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .two-content-slide {
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0px;
          line-height: 1.08;
        }
        .tc-slide-container {
          width: 85%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          height: 100%;
        }
        .tc-slide-title-box .tc-slide-content-container {
          width: 100%;
        }
        .tc-slide-title-box {
          display: flex;
          height: 20%;
          align-items: center;
          justify-content: start;
          font-size: 140%;
          margin-bottom: 1%; 
        }
        .tc-slide-content-container {
          display: flex;
          flex-direction: row;
          gap: 1%;
          justify-content: space-between;
          height: 60%;
        }
        .tc-slide-content-box {
          display: flex;
          flex-direction: column;
          width: 49.5%;
          height:100%;
          font-size: 90%;
        }
      </style>
    </section>
  `;
}
