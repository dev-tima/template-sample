import { marked } from "marked";

export default function createTitleSlide(data, slideId) {
  return `
    <section class="slide canva-title-slide" id="${slideId}">
      <div class="ct-slide-container">
        <div class="ct-slide-header-box">
          ${marked.parse(data.header)}
        </div>
        <div class="ct-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="ct-slide-subtitle-box">
          ${marked.parse(data.subtitle)}
        </div>
        <div class="ct-slide-footer-box">
          ${marked.parse(data.footer)}
        </div>
      </div>
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .canva-title-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
          background-image: url('https://corsproxy.io/?https://i.ibb.co/MDpwtB2R/intro-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
        }
        .ct-slide-container {
          width: 75%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
          height: 84%;
        }
        .ct-slide-header-box {
          display: flex;
          width: 48%;
          height: 8%;
          align-items: center;
          padding: 0.8% 3%;
          background-color: #ffd59e;
          border-radius: 50px;
          font-size: 80%;
          font-weight: 500;
          justify-content: center;
          border: 2px solid #000101;
          margin-top: 10%;
        }
        .ct-slide-title-box {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 200%;
          font-weight: 700;
          text-align: center;
          margin-top: 3%;
        }
        .ct-slide-subtitle-box {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100%;
          font-weight: 600;
          text-align: center;
          margin-top: 1%;
        }
        .ct-slide-footer-box {
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
