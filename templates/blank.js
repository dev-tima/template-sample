import { wrapWithCorsProxy } from "../utils/url-helper.js";

export default function createBlankSlide(data, slideId) {
  const bgImage = wrapWithCorsProxy('https://store.redbrick.land/prod/user-assets/43578d3e-1d56-4d98-a47e-6e9799c023b6/content-bg_1760594211431.png');

  return `
    <section class="slide blank-slide" id="${slideId}">
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .blank-slide {
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
        }
      </style>
    </section>
  `;
}
