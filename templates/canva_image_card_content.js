import { marked } from "marked";

export default function createImageCardContentSlide(data, slideId) {
  return `
    <section class="slide image-card-content-slide" id="${slideId}">
      <div class="icc-slide-container">
        <div class="icc-slide-title-box">${marked.parse(data.title)}</div>
        <div class="icc-slide-row">
          <div class="icc-slide-image-card">
            <div class="icc-slide-image-wrapper">
              <img src="${data.imageUrl1}" alt="slide image 1" />
            </div>
            <div class="icc-slide-card-content">
              <div class="icc-slide-subtitle">${marked.parse(
                data.subtitle1
              )}</div>
              <div class="icc-slide-content">${marked.parse(
                data.content1
              )}</div>
            </div>
          </div>
          <div class="icc-slide-image-card">
            <div class="icc-slide-image-wrapper">
              <img src="${data.imageUrl2}" alt="slide image 2" />
            </div>
            <div class="icc-slide-card-content">
              <div class="icc-slide-subtitle">${marked.parse(
                data.subtitle2
              )}</div>
              <div class="icc-slide-content">${marked.parse(
                data.content2
              )}</div>
            </div>
          </div>
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .image-card-content-slide {
          background-image: url('https://corsproxy.io/?https://i.ibb.co/XZbqydhC/content-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .icc-slide-container {
          width: 64%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }
        .icc-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 140%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 7.5%;
        }
        .icc-slide-row {
          margin-top: 9%;
          display: flex;
          height: 60%;
          width: 100%;
          gap: 5%;
          justify-content: center;
        }
        .icc-slide-image-card {
          width: 45%;
          background-color: #ffd59e;
          border-radius: 5%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .icc-slide-image-wrapper {
          height: 50%;
          aspect-ratio: 1/1;
          position: relative;
        }
        .icc-slide-image-wrapper img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .icc-slide-card-content {
          padding: 5% 4%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .icc-slide-subtitle {
          font-size: 80%;
          font-weight: 600;
          margin-bottom: 3%;
        }
        .icc-slide-content {
          font-size: 75%;
          font-weight: 400;
        }
      </style>
    </section>
  `;
}
