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
        .title-only-slide {
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
          font-size: 230%;
        }
      </style>
    </section>
  `;
}
