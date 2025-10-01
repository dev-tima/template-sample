import { marked } from "marked";

export default function createTitleSlide(data, slideId) {
	return `
    <section class="slide title-slide" id="${slideId}">
      <div class="title-slide-container">
        <div class="title-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="title-slide-subtitle-box">
          ${marked.parse(data.subtitle)}
        </div>
      </div>
      <style>
        .title-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0px;
          line-height: 1.08;
        }
        .title-slide-container {
          width: 75%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          height: 100%;
        }
        .title-slide-title-box, .title-slide-subtitle-box {
          width: 100%;
        }
        .title-slide-title-box {
          display: flex;
          height: 40%;
          align-items: flex-end;
          justify-content: center;
          font-size: 300%;
          text-align: center;
          margin-bottom: 1%; 
        }
        .title-slide-subtitle-box {
          display: flex;
          height: 30%;
          align-items: flex-start;
          justify-content: center;
          font-size: 120%;
          text-align: center;
        }
      </style>
    </section>
  `;
}
