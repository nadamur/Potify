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
async function mostListenedToArtists() {
  try {
    const response = await fetch(`/totalSongListenTime`);
    if (!response.ok) {
      console.log("Error fetching log in status");
    } else {
      const data = await response.json();
      console.log(data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

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
