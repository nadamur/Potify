const express = require('express');
const { createConnection } = require('mysql');

const app = express();
const port = 3000;

// FIRST cd to the DUMP folder
// THEN TO RUN THE SCRIPT RUN: 'node db.js'

// HOW TO USE:
// do 'npm i mysql' to download dependencies
// also do 'npm -y' to initialize package.json
const connection = createConnection({
    host: 'localhost',
    user: 'root',
    // CHANGE WITH YOUR MYSQL PASSWORD
    password: '123!@#QWEasdzxc',
    database: 'Potify',
    port: 3306,
});

connection.connect();

// USE FOR OPTION #2 (Modification #2 aka Creating random playlist with one user's id)
// Modification #2 from assignment 3
const mod2 = `INSERT INTO Playlist (creator, playlistName)
              VALUES ('000cb844', 'Random Playlist');
              INSERT INTO PlaylistSongs (playlistID, songID)
              SELECT LAST_INSERT_ID(), songID
              FROM Song
              WHERE genre = (
              SELECT genrePref
              FROM User
              WHERE username = '000cb844'
              )
              ORDER BY RAND()
              LIMIT 5; 
              `;

// 1) This will match each listener with an album depending on their initial preferred genre
// USES QUERY #1 FROM ASSIGNMENT 3
app.get('/api/listenersPreferredGenre', (req,res) =>{
  connection.query(`WITH PlaylistGenres AS (
      SELECT
          ps.playlistID,
          s.genre AS playlistMostCommonGenre,
          RANK() OVER (PARTITION BY ps.playlistID, s.genre ORDER BY COUNT(*) DESC) AS genreRank
      FROM
          PlaylistSongs ps
      JOIN ArtistAlbum aa ON ps.playlistID = aa.playlistID
      JOIN Song s ON aa.artistID = s.artistID
      GROUP BY ps.playlistID, s.genre
  ),
  UserGenreMatch AS (
      SELECT
          u.username,
          u.userType,
          pg.playlistMostCommonGenre
      FROM
          User u
      JOIN PlaylistGenres pg ON u.genrePref = pg.playlistMostCommonGenre
      WHERE u.userType = 'l'
  )
  SELECT
      playlistMostCommonGenre,
      COUNT(username) AS numberOfUsers
  FROM UserGenreMatch
  GROUP BY playlistMostCommonGenre
  ORDER BY numberOfUsers DESC;`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
  });
});

// 2) This will tell us how long an artist’s songs have been listened to in total. ( top 5)
// USES QUERY #2 FROM ASSIGNMENT 3
app.get('/api/totalSongListenTime', (req,res) =>{
  connection.query(`
  SELECT s.artistID, SUM(l.secondsSum) AS totalSecondsSum
  FROM Song s
  INNER JOIN (
    SELECT songID, SUM(secondsListened) AS secondsSum
    FROM ListenTime
    GROUP BY songID
  ) AS l ON s.songID = l.songID
  GROUP BY s.artistID
  LIMIT 5;
`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
  });
});

// 3) It will group them by username and genre and add up the secondsListened for each song under that username, genre combo. This will tell us how long a user listened to a specific genre.
// USES QUERY #3 FROM ASSIGNMENT 3
  app.get('/api/listenTimeGenre', (req,res) =>{
  connection.query(`SELECT  l.username, s.genre, SUM(l.secondsListened) AS totalTime
  FROM ListenTime l, Song s
  WHERE l.songID = s.songID
  GROUP BY l.username, s.genre;`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
  });
});

// 4) Finds the most listened-to genre for each user by calculating the total listening time for each genre, ranking the genres within each user's partition, and then selecting the users with the top genre ‘possimus’.
// USES QUERY #4 FROM ASSIGNMENT 3
app.get('/api/topListenedGenre', (req,res) =>{
  connection.query(`WITH RankedGenres AS (
      SELECT
          l.username,
          s.genre,
          SUM(l.secondsListened) AS totalTime,
          ROW_NUMBER() OVER (PARTITION BY l.username ORDER BY SUM(l.secondsListened) DESC) AS genreRank
      FROM ListenTime l
      JOIN Song s ON l.songID = s.songID
      GROUP BY l.username, s.genre
  )
  SELECT username, genre
  FROM RankedGenres
  WHERE genreRank = 1 && genre = "possimus";`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
  });
});

// 5) This will return the songs that have been listened to by at least 1 person on a specific date.
// USES QUERY #5 FROM ASSIGNMENT 3
app.get('/api/songsListenedDate', (req,res) =>{
  connection.query(`SELECT * FROM Song
  WHERE EXISTS(
      SELECT 1
      FROM ListenTime
      WHERE Song.songID = ListenTime.songID && ListenTime.listenDate = '1975-10-28');`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
  });
});

// 6) This will give us the #1 Potify user.
// USES QUERY #6 FROM ASSIGNMENT 3
app.get('/api/topUser', (req,res) =>{
  connection.query(`SELECT username, SUM(secondsListened) AS totalListenTime 
  FROM ListenTime 
  GROUP BY username
  ORDER BY totalListenTime DESC
  LIMIT 1;`, (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
    });
});
  
// 7)  Calculates all the artists with a specific top genre based on the count of songs for each genre.
// USES QUERY #7 FROM ASSIGNMENT 3
app.get('/api/artistsTopGenre', (req, res) => {
  connection.query(`
    WITH RankedArtists AS (
      SELECT
        u.artistName,
        s.genre AS mostFrequentGenre,
        RANK() OVER (PARTITION BY u.artistName ORDER BY COUNT(*) DESC) AS artistRank
      FROM
        User u
      JOIN Song s ON u.username = s.artistID
      GROUP BY u.artistName, s.genre
    )
    SELECT artistName, mostFrequentGenre
    FROM RankedArtists
    WHERE artistRank = 1 AND mostFrequentGenre = 'possimus';
  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});


// USES MODIFICATION #2 FROM ASSIGNMENT 3
app.get('/api/createRandomPlaylist', (req, res) => {
  const createRandomPlaylistQuery = `
    INSERT INTO Playlist (creator, playlistName)
    VALUES ('000cb844', 'Random Playlist');
    
    INSERT INTO PlaylistSongs (playlistID, songID)
    SELECT LAST_INSERT_ID(), songID
    FROM Song
    WHERE genre = (
      SELECT genrePref
      FROM User
      WHERE username = '000cb844'
    )
    ORDER BY RAND()
    LIMIT 5;
  `;

  connection.query(createRandomPlaylistQuery, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.status(200).send('Random playlist created successfully');
    }
  });
});

// USE FOR OPTION #5 (USER LOGIN)
// Not really implemented yet, not sure how we will do this one

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});