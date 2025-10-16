import { marked } from "marked";
import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createPictureWithTopicSlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');

  return `
    <section class="slide pwt-slide" id="${slideId}">
      <div class="pwt-slide-container">
        <div class="pwt-slide-title-box">${marked.parse(data.title)}</div>
        <div class="pwt-slide-row">
          <div class="pwt-slide-image-box">
            <img src="${wrapWithCorsProxy(data.imageUrl)}" alt="slide image" />
          </div>
          <div class="pwt-slide-text-box">
            <div class="pwt-slide-text-topic">${marked.parse(data.topic)}</div>
            <div class="pwt-slide-keywords">${data.keywords
              .map((k) => `#${k}`)
              .join(" ")}</div>
          </div>
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .pwt-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
        }
        .pwt-slide-container {
          width: 64%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }
        .pwt-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 7.5%;
        }
        .pwt-slide-row {
          display: flex;
          width: 100%;
          gap: 5%;
          justify-content: center;
          align-items: center;
          margin-top: 9%;
        }
        .pwt-slide-image-box {
          width: 45%;
          aspect-ratio: 1 / 1;
          position: relative;
        }
        .pwt-slide-image-box img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 5%;
        }
        .pwt-slide-text-box {
          width: 45%;
          aspect-ratio: 1 / 1;
          background-color: #ffd59e;
          border-radius: 5%;
          display: flex;
          flex-direction: column;
          justify-content: start;
          align-items: center;
          box-sizing: border-box;
          text-align: center;
          padding: 5% 3%;
        }
        .pwt-slide-text-topic {
          display: flex;
          flex: 1;
          margin-top: 8%;
          font-size: 75%;
          font-weight: 400;
        }
        .pwt-slide-keywords {
          font-size: 75%;
          font-weight: 600;
        }
      </style>
    </section>
  `;
}
