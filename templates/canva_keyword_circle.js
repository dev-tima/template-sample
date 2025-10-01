import { marked } from "marked";

export default function createKeywordCirclesSlide(data, slideId) {
	// data.keywords: [{ keyword: string, description: string }, ...]
	const colors = ["#FFE897", "#FFE6C3", "#DAF7F1"];
	const keywords = (data.keywords || []).slice(0, 3);

	return `
    <section class="slide kcs-slide" id="${slideId}">
      <div class="kcs-slide-container">
        <div class="kcs-slide-title-box">${marked.parse(data.title)}</div>
        <div class="kcs-slide-row">
          ${keywords
				.map(
					(keyword, idx) => `
            <div class="kcs-slide-circle" style="background-color:${
				colors[idx]
			};">
              <div class="kcs-slide-keyword">${marked.parse(
					keyword.keyword
				)}</div>
              <div class="kcs-slide-description">${marked.parse(
					keyword.description
				)}</div>
            </div>
          `
				)
				.join("")}
        </div>
      </div>
      <style>
        .kcs-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .kcs-slide-container {
          width: 80%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content:start;
        }
        .kcs-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 240%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 6%;
        }
        .kcs-slide-row {
          display: flex;
          gap: 2%;
          justify-content: center;
          align-items: center;
          margin-top: 9%;
          width: 100%;
        }
        .kcs-slide-circle {
          width: 28%;
          aspect-ratio: 1/1;       /* 1:1 aspect ratio */
          position: relative;
          border-radius: 50%;     /* perfect circle */
          box-sizing: border-box;
          text-align: center;
          padding: 6% 3% 5% 3%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .kcs-slide-keyword {
          display: flex;
          justify-content: center;
          width: 100%;
          font-size: 100%;
          font-weight: 600;
        }
        .kcs-slide-description {
          display: flex;
          justify-content: center;
          width: 100%;
          font-size: 90%;
          font-weight: 400;
        }
      </style>
    </section>
  `;
}
