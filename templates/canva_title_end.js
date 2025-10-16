import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createTitleEndSlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');
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
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .title-end-slide {
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
