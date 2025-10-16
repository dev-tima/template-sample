export default function createBlankSlide(data, slideId) {
  return `
    <section class="slide blank-slide" id="${slideId}">
      <style>
        /* Import Google Font */
        @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');

        .blank-slide {
          background-image: url('https://corsproxy.io/?https://i.ibb.co/XZbqydhC/content-bg.png');
          background-size: cover;
          background-position: center;
          font-family: "Alan Sans", sans-serif;
        }
      </style>
    </section>
  `;
}
