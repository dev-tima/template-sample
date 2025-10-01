import { marked } from "marked";

export default function createObjectiveSlide(data, slideId) {
	const objectives = data.objectives ? data.objectives.slice(0, 4) : [];

	return `
    <section class="slide canva-objective-slide" id="${slideId}">
      <div class="objective-slide-container">
        <div class="objective-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="objective-slide-list-container">
          ${objectives
				.map(
					(objective, index) => `
            <div class="objective-slide-item">
              <div class="objective-number">${index + 1}</div>
              <div class="objective-text">${marked.parse(objective)}</div>
            </div>
          `
				)
				.join("")}
        </div>
      </div>
      <style>
        .canva-objective-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .objective-slide-container {
          width: 80%;
          display: flex;
          flex-direction: column;
          justify-content: start;
          height: 84%;
        }
        .objective-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 240%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 6%;
        }
        .objective-slide-list-container {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .objective-slide-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3%;
        }
        .objective-number {
          width: 6%;
          aspect-ratio: 1 / 1;
          background-color: #ffd59e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 120%;
          font-weight: 600;
          flex-shrink: 0;
          border: 2px solid #000101;
          margin-right: 4%;
        }
        .objective-text {
          font-size: 140%;
          font-weight: 500;
        }
      </style>
    </section>
  `;
}
