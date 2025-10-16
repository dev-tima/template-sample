import { marked } from "marked";

export default function createTitleOnlySlide(data, slideId) {
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
