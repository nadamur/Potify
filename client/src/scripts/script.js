function toggleText() {
  var x = document.getElementById("textSH");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

// Get the header
var header = document.getElementById("myHeader");

const carousel = [...document.querySelectorAll('.carousel img')];

let carouselImageIndex = 0;

const changeCarousel = () => {
  carousel[carouselImageIndex].classList.toggle('active');

  if (carouselImageIndex >= carousel.length - 1) {
    carouselImageIndex = 0;
  } else {
    carouselImageIndex++;
  }

  carousel[carouselImageIndex].classList.toggle('active');
}

setInterval(() => {
  changeCarousel();
}, 3000);