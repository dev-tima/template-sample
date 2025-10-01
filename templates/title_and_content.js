import { marked } from "marked";

export default function createTitleAndContentSlide(data, slideId) {
	return `
    <section class="slide title-and-content-slide" id="${slideId}">
      <div class="tac-slide-container">
        <div class="tac-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="tac-slide-content-box">
          ${marked.parse(data.content)}
        </div>
      </div>
      <style>
        .title-and-content-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0px;
          line-height: 1.08;
        }
        .tac-slide-container {
          width: 85%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: start;
          height: 100%;
        }
        .tac-slide-title-box, .title-slide-subtitle-box {
          width: 100%;
        }
        .tac-slide-title-box {
          margin-top: 4%;
          display: flex;
          height: 20%;
          align-items: center;
          justify-content: start;
          font-size: 230%;
          margin-bottom: 1%; 
        }
        .tac-slide-content-box {
          display: flex;
          flex-direction: column;
          height: 62%;
          align-items: flex-start;
          justify-content: start;
          font-size: 140%;
        }
      </style>
    </section>
  `;
}
