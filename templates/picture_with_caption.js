import { marked } from "marked";

export default function createPictureWithCaptionSlide(data, slideId) {
	return `
    <section class="slide picture-with-caption-slide" id="${slideId}">
      <div class="pwc-slide-container">
        <div class="pwc-slide-caption-container">
          <div class="pwc-slide-title-box">
            ${marked.parse(data.title)}
          </div>
          <div class="pwc-slide-caption-box">
            ${marked.parse(data.caption)}
          </div>
        </div>
        <div class="pwc-slide-image-container">
          <div class="pwc-slide-image-box">
            <img src="${data.imageUrl}" alt="${data.altText || ""}" />
          </div>
        </div>
      </div>
      <style>
        .picture-with-caption-slide {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          flex-direction: column;
          padding: 0;
          line-height: 1.08;
        }
        .pwc-slide-container {
          display: flex;
          flex-direction: row;
          width: 85%;
          height: 80%;
          margin: 3% auto 0;
          gap: 4.5%;
        }
        .pwc-slide-caption-container {
          display: flex;
          flex-direction: column;
          width: 38%;
          height: 100%;
        }
        .pwc-slide-title-box {
          display: flex;
          align-items: flex-end;
          height: 55%;
          font-size: 160%;
        }
        .pwc-slide-caption-box {
          display: flex;
          height: 100%;
          font-size: 80%;
        }
        .pwc-slide-image-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 100%;
        }
        .pwc-slide-image-box {
          flex: 1;
          position: relative;
          margin-top: 14%;
        }
        .pwc-slide-image-box img {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          object-fit: fill;
        }
      </style>
    </section>
  `;
}
