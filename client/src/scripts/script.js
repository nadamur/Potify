document.addEventListener("DOMContentLoaded", () =>{
  diplayMostListenedToArtists();
  displayTopListener();
})

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
function createNewPlaylist() {
  return;
}

//function to get the users playlists
async function getUserPlaylist() {
  try {
    const response = await fetch(`/login`);
    if (!response.ok) {
      //if no heroes found, displays message
      console.log("Error fetching log in status");
    } else {
      const data = await response.json();
      console.log(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//function to display most listened to artists
<<<<<<< HEAD
async function mostListenedToArtists() {
=======
async function diplayMostListenedToArtists(){
>>>>>>> 73d32a3bc182820492059cf17deb689b047fe826
  try {
    const response = await fetch(`http://localhost:3000/api/totalSongListenTime`);
    if (!response.ok) {
      console.log("Error fetching log in status");
    } else {
      const data = await response.json();
      const artistsDIV = document.getElementById('top-artists')
      let n = 3;
      for (song of data){
        const artistDIV = document.createElement('div');
        artistDIV.classList.add('playlist-card');
        const artistIMG = document.createElement('img');
        artistIMG.classList.add('playlist-card-img');
        artistIMG.src = `images/image${n}.png`;
        artistName = document.createElement('p');
        artistName.classList.add('playlist-card-name');
        artistName.textContent = song.artistID;
        artistDIV.appendChild(artistIMG);
        artistDIV.appendChild(artistName);
        artistsDIV.appendChild(artistDIV);
        n = n+1;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

<<<<<<< HEAD
function performSearch() {
  // Get the search input value
  var searchTerm = document.getElementById("searchInput").value.trim();

  // Get the search results div
  var searchResultsDiv = document.getElementById("searchResults");

  // Check if the search term is not empty
  if (searchTerm !== "") {
    // Display the search term in the results div
    displaySearchResults(searchTerm);
    // Show the search results div
    searchResultsDiv.style.display = "block";
  } else {
    // If the search term is empty, hide the results div
    hideSearchResults();
  }
}

function displaySearchResults(result) {
  // Get the search results div
  var searchResultsDiv = document.getElementById("searchResults");

  // Display the result in a paragraph
  var resultHeader = document.createElement("h2");
  resultHeader.textContent = "Display Search Result"

  // Display the result in a paragraph
  var resultParagraph = document.createElement("p");
  resultParagraph.textContent = "Search Result: " + result;

  // Clear previous results
  searchResultsDiv.innerHTML = "";

  // Append the new result
  searchResultsDiv.appendChild(resultHeader);
  searchResultsDiv.appendChild(resultParagraph);
}

function hideSearchResults() {
  // Hide the search results div
  var searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.style.display = "none";
}
=======
//function to display mtop listener
async function displayTopListener(){
  try {
    const response = await fetch(`http://localhost:3000/api/topUser`);
    if (!response.ok) {
      console.log("Error fetching log in status");
    }else{
      const data = await response.json();
      const DIV = document.getElementById('top-listener');
      console.log
      for (user of data){
        const userDIV = document.createElement('div');
        userDIV.classList.add('playlist-card');
        const userIMG = document.createElement('img');
        userIMG.classList.add('playlist-card-img');
        userIMG.src = `images/image6.png`;
        userName = document.createElement('p');
        userName.classList.add('playlist-card-name');
        userName.textContent = user.username;
        userDIV.appendChild(userIMG);
        userDIV.appendChild(userName);
        DIV.appendChild(userDIV);
        n = n+1;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//function to display Recommended Albums section
async function displayRecommendedAlbums(){
  // try {
  //   const response = await fetch(`http://localhost:3000/api/artistsTopGenre`);
  //   if (!response.ok) {
  //     console.log("Error fetching log in status");
  //   }else{
  //     const data = await response.json();
  //     const DIV = document.getElementById('recommended-albums');
  //     console.log
  //     for (user of data){
  //       const userDIV = document.createElement('div');
  //       userDIV.classList.add('playlist-card');
  //       const userIMG = document.createElement('img');
  //       userIMG.classList.add('playlist-card-img');
  //       userIMG.src = `images/image6.png`;
  //       userName = document.createElement('p');
  //       userName.classList.add('playlist-card-name');
  //       userName.textContent = user.username;
  //       userDIV.appendChild(userIMG);
  //       userDIV.appendChild(userName);
  //       DIV.appendChild(userDIV);
  //       n = n+1;
  //     }
  //   }
  // } catch (error) {
  //   console.error('Error:', error);
  // }
}

//function to display what is being listened to today
async function listenedToToday(){
  try {
    const response = await fetch(`http://localhost:3000/api/songsListenedDate`);
    if (!response.ok) {
      console.log("Error fetching log in status");
    }else{
      const data = await response.json();
      const DIV = document.getElementById('recommended-albums');
      console.log
      for (user of data){
        const userDIV = document.createElement('div');
        userDIV.classList.add('playlist-card');
        const userIMG = document.createElement('img');
        userIMG.classList.add('playlist-card-img');
        userIMG.src = `images/image6.png`;
        userName = document.createElement('p');
        userName.classList.add('playlist-card-name');
        userName.textContent = user.username;
        userDIV.appendChild(userIMG);
        userDIV.appendChild(userName);
        DIV.appendChild(userDIV);
        n = n+1;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
>>>>>>> 73d32a3bc182820492059cf17deb689b047fe826
