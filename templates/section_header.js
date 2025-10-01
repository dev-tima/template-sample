import { marked } from "marked";

export default function createSectionHeaderSlide(data, slideId) {
	return `
    <section class="slide section-header-slide" id="${slideId}">
      <div class="sh-slide-container">
        <div class="sh-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="sh-slide-subtitle-box">
          ${marked.parse(data.subtitle)}
        </div>
      </div>
      <style>
        .section-header-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0px;
          line-height: 1.08;
        }
        .sh-slide-container {
          width: 85%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          height: 100%;
        }
        .sh-slide-title-box, .sh-slide-subtitle-box {
          width: 100%;
        }
        .sh-slide-title-box {
          display: flex;
          height: 45%;
          align-items: flex-end;
          justify-content: start;
          font-size: 300%;
          text-align: start;
          margin-top: 3%;
          margin-bottom: 1%; 
        }
        .sh-slide-subtitle-box {
          display: flex;
          height: 24%;
          align-items: flex-start;
          justify-content: start;
          font-size: 130%;
          color: #808080;
          text-align: center;
        }
      </style>
    </section>
  `;
}
