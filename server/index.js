const express = require('express');
const { createConnection } = require('mysql');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());

// FIRST cd to the DUMP folder
// THEN TO RUN THE SCRIPT RUN: 'node db.js'

// HOW TO USE:
// do 'npm i mysql' to download dependencies
// also do 'npm -y' to initialize package.json
const connection = createConnection({
  host: 'localhost',
  user: 'root',
  // CHANGE WITH YOUR MYSQL PASSWORD
  password: '!Spider99',
  database: 'Potify',
  port: 3306,
});

connection.connect();

// USE FOR OPTION #1 (Most commonly listened to genre)
// This is query #1 from assignment 3
const query1 = `
                WITH PlaylistGenres AS (
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
                ORDER BY numberOfUsers DESC;
                `;

connection.query(query1, (err, rows) => {
  if (err) throw err;

  console.log('\n*************** Data for QUERY 1 ****************:\n');
  console.log(rows);
});

// // USE FOR OPTION #2 (Modification #2 aka Creating random playlist with one user's id)
// const query2_1 = `INSERT INTO Playlist (creator, playlistName)
//                 VALUES ('000cb844', 'Random Playlist')`;

// connection.query(query2_1, (err, rows) => {
//     if (err) throw err;

//     console.log('Data received from Db (Query 1):');
//     console.log(rows);

//     // After the first query is executed, proceed with the second query
//     const query2_2 = `
//         INSERT INTO PlaylistSongs (playlistID, songID)
//         SELECT LAST_INSERT_ID(), songID
//         FROM Song
//         WHERE genre = (
//             SELECT genrePref
//             FROM User
//             WHERE username = '000cb844'
//         )
//         ORDER BY RAND()
//         LIMIT 5
//     `;

//     connection.query(query2_2, (err, rows) => {
//         if (err) throw err;

//         console.log('\n*************** Data for Query 2 ****************:\n');
//         console.log(rows);

//         // Close the connection after the second query is executed
//         connection.end();
//     });
// });


// USE FOR OPTION #3 (Top 5 most listened to artists)
// This is query #2 from assignment 3
const query3 = `SELECT s.artistID, SUM(l.secondsSum) AS totalSecondsSum
                FROM Song s
                INNER JOIN (
                SELECT songID, SUM(secondsListened) AS secondsSum
                        FROM ListenTime
                        GROUP BY songID)
                AS l ON s.songID = l.songID
                GROUP BY s.artistID
                LIMIT 5;`

connection.query(query3, (err, rows) => {
  if (err) throw err;

  console.log('\n*************** Data for QUERY 3 ****************:\n');
  console.log(rows);
});

// USE FOR OPTION #4 (Songs listened to by one person on a specific day)
// Uses query #5 from assignment 3
const query4_1 = `SELECT * FROM Song
                WHERE EXISTS(
                    SELECT 1
                    FROM ListenTime
                    WHERE Song.songID = ListenTime.songID && ListenTime.listenDate = '1975-10-28')`; // THIS DATE WILL BE TAKEN FROM DATE INPUT

// 1) This will match each listener with an album depending on their initial preferred genre
app.get('/api/listenersPreferredGenre', (req, res) => {
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

//make this return artist Name rather than artist ID
// 2) This will tell us how long an artist’s songs have been listened to in total. ( top 5)
app.get('/api/totalSongListenTime', (req, res) => {
  connection.query(`
    SELECT s.artistID, SUM(l.secondsSum) AS totalSecondsSum
    FROM Song s
    INNER JOIN (
      SELECT songID, SUM(secondsListened) AS secondsSum
      FROM ListenTime
      GROUP BY songID
    ) AS l ON s.songID = l.songID
    GROUP BY s.artistID
    LIMIT 4;`
    , (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
    });
});

// 3) It will group them by username and genre and add up the secondsListened for each song under that username, genre combo. This will tell us how long a user listened to a specific genre.
app.get('/api/listenTimeGenre', (req, res) => {
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
app.get('/api/topListenedGenre', (req, res) => {
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
  WHERE genreRank = 1 && genre = "possimus"
  LIMIT 4;`, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

// 5) This will return the songs that have been listened to by at least 1 person on a specific date.
app.get('/api/songsListenedDate', (req, res) => {
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
app.get('/api/topUser', (req, res) => {
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
app.get('/api/artistsTopGenre', (req, res) => {
  connection.query(`WITH RankedArtists AS (
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
  WHERE artistRank = 1 && mostFrequentGenre = 'possimus'
  LIMIT 5;
  
  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// USE FOR OPTION #5 (USER LOGIN)
// Not really implemented yet, not sure how we will do this one