import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createTitleOnlySlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');

  return `
    <section class="slide title-only-slide" id="${slideId}">
      <div class="to-slide-container">
        <div class="to-slide-title-box">
          ${marked.parse(data.title)}
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .title-only-slide {
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
        .to-slide-container {
          width: 85%;
          height: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: start;
        }
        .to-slide-title-box {
          margin-top: 4%;
          height: 20%;
          display: flex;
          align-items: center;
          justify-content: start;
          font-size: 140%;
        }
      </style>
    </section>
  `;
}
