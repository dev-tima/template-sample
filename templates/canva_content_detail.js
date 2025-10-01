import { marked } from "marked";

export default function createContentDetailSlide(data, slideId) {
	const details = data.details ? data.details.slice(0, 3) : [];

	return `
    <section class="slide content-detail-slide" id="${slideId}">
      <div class="cd-slide-container">
        <div class="cd-slide-title-box">
          ${marked.parse(data.title)}
        </div>
        <div class="cd-slide-header-box">${marked.parse(data.header)}</div>
        <div class="cd-slide-list-container">
          ${details
				.map(
					(detail, index) => `
            <div class="cd-slide-item">
              <div class="cd-slide-number">${index + 1}</div>
              <div class="cd-slide-text">${marked.parse(detail)}</div>
            </div>`
				)
				.join("")}
        </div>
      </div>
      <style>
        .content-detail-slide {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1.08;
        }
        .cd-slide-container {
          width: 80%;
          height: 84%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
        }
        .cd-slide-title-box {
          display: flex;
          height: 8%;
          font-size: 240%;
          font-weight: 700;
          align-items: center;
          justify-content: center;
          margin-top: 6%;
        }
        .cd-slide-header-box {
          display: flex;
          width: 75%;
          height: 10%;
          align-items: center;
          padding: 0.8% 3%;
          background-color: #ffd59e;
          border-radius: 50px;
          font-size: 100%;
          font-weight: 500;
          justify-content: center;
          margin-top: 8%;
        }
        .cd-slide-list-container {
          display: flex;
          width: 100%;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin-top: 2%;
        }
        .cd-slide-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3%;
        }
        .cd-slide-number {
          display: flex;
          width: 6%;
          aspect-ratio: 1 / 1;
          background-color: #ffd59e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100%;
          font-weight: 500;
          flex-shrink: 0;
          margin-right: 4%;
        }
        .cd-slide-text {
          display: flex;
          width: 100%:
          font-size: 90%;
          font-weight: 500;
        }
      </style>
    </section>
  `;
}
