import { marked } from "marked";

export default function createPictureWithTopicSlide(data, slideId) {
	return `
    <section class="slide pwt-slide" id="${slideId}">
      <div class="pwt-slide-container">
        <div class="pwt-slide-title-box">${marked.parse(data.title)}</div>
        <div class="pwt-slide-row">
          <div class="pwt-slide-image-box">
            <img src="${data.imageUrl}" alt="slide image" />
          </div>
          <div class="pwt-slide-text-box">
            <div class="pwt-slide-text-title">${marked.parse(data.title)}</div>
            <div class="pwt-slide-text-topic">${marked.parse(data.topic)}</div>
            <div class="pwt-slide-keywords">${data.keywords
				.map((k) => `#${k}`)
				.join(" ")}</div>
          </div>
        </div>
      </div>
      <style>
        .pwt-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
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
          font-size: 240%;
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
        .pwt-slide-text-title {
          font-size: 100%;
          font-weight: 600;
        }
        .pwt-slide-text-topic {
          display: flex;
          flex: 1;
          margin-top: 8%;
          font-size: 90%;
          font-weight: 400;
        }
        .pwt-slide-keywords {
          font-size: 90%;
          font-weight: 600;
        }
      </style>
    </section>
  `;
}
