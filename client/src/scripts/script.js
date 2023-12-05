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

//display the users playlists
function createNewPlaylist(){
  return;
}

//function to get the users playlists
async function getUserPlaylist(){
  try {
    const response = await fetch(`/login`);
    if (!response.ok) {
      //if no heroes found, displays message
      console.log("Error fetching log in status");
    }else{
      const data = await response.json();
      console.log(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//function to display most listened to artists
async function mostListenedToArtists(){
  try {
    const response = await fetch(`/totalSongListenTime`);
    if (!response.ok) {
      console.log("Error fetching log in status");
    }else{
      const data = await response.json();
      console.log(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//function to recommend artist album to user
