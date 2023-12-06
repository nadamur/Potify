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
  password: 'Wmlldn2003',
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
  SELECT u.artistName, SUM(l.secondsSum) AS totalSecondsSum
  FROM Song s
  INNER JOIN User u ON s.artistID = u.username
  INNER JOIN (
      SELECT songID, SUM(secondsListened) AS secondsSum
      FROM ListenTime
      GROUP BY songID
  ) AS l ON s.songID = l.songID
  GROUP BY u.artistName
  LIMIT 4;`
    , (error, results) => {
      if (error) {
        res.status(500).send(error.message);
      } else {
        res.json(results);
      }
    });
});

// 3) It will group them by username and genre and add up the secondsListened for each song under that username, 
// genre combo. This will tell us how long a user listened to a specific genre.
//how long each user listened to each genre
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

// 4) Finds the most listened-to genre for each user by calculating the total listening time for each genre, 
// ranking the genres within each user's partition, and then selecting the users with the top genre ‘possimus’.
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
  WHERE genreRank = 1 && genre = "hiphop"
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
  WHERE artistRank = 1 && mostFrequentGenre = 'hiphop'
  LIMIT 4;
  
  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

// Recommends album to user based on initial genre 
app.get('/api/recommendedAlbum', (req, res) => {
  connection.query(`WITH PlaylistGenres AS (
    SELECT
        ps.playlistID,
        p.playlistName,
        s.genre AS playlistMostCommonGenre,
        RANK() OVER (PARTITION BY ps.playlistID, s.genre ORDER BY COUNT(*) DESC) AS genreRank
    FROM
        PlaylistSongs ps
    JOIN ArtistAlbum aa ON ps.playlistID = aa.playlistID
    JOIN Song s ON aa.artistID = s.artistID
    JOIN Playlist p ON ps.playlistID = p.playlistID
    GROUP BY ps.playlistID, p.playlistName, s.genre
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
SELECT DISTINCT
    ugm.username,
    ugm.userType,
    ugm.playlistMostCommonGenre,
    pg.playlistID,
    pg.playlistName
FROM
    UserGenreMatch ugm
JOIN PlaylistGenres pg ON ugm.playlistMostCommonGenre = pg.playlistMostCommonGenre
WHERE pg.genreRank = 1 AND ugm.username = 'bob420'; 
  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

// returns all the playlists of a user
app.get('/api/userPlaylists', (req, res) => {
  connection.query(`SELECT * FROM Playlist WHERE creator = 'bob420' LIMIT 4;
  `, (error, results) => {
    if (error) {
      console.error("SQL error:", error);
      res.status(500).send(error.message);
    } else {
      console.log("Displaying results:");
      console.log(results);
      console.log("END displaying results:");
      res.json(results);
    }
  });
});

// returns all songs in a playlist
app.get('/api/playlistSongs/:playlistName', (req, res) => {
  const playlistName = req.params.playlistName;
  connection.query(`SELECT
  s.songID,
  s.artistID,
  s.songName,
  s.genre,
  s.length,
  s.songURL,
  s.dateAdded
FROM
  Playlist AS p
JOIN
  PlaylistSongs AS ps ON p.playlistID = ps.playlistID
JOIN
  Song AS s ON ps.songID = s.songID
WHERE
  p.playlistName = '${playlistName}';
  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});
app.post('/api/createPlaylist/:n', (req, res) => {
  const n = req.params.n;
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    // Insert a playlist with the creator being bob420 into Playlist table
    connection.query('INSERT INTO Playlist (creator, playlistName) VALUES (?, ?)', ['bob420', `Random Playlist ${n}`], (error, playlistResult) => {
      if (error) {
        return connection.rollback(() => {
          res.status(500).send(error.message);
        });
      }

      const playlistID = playlistResult.insertId;

      // Select 5 random songs from the user's preferred genre and add them to the playlist
      connection.query('INSERT INTO PlaylistSongs (playlistID, songID) SELECT ?, songID FROM Song WHERE genre = (SELECT genrePref FROM User WHERE username = ?) ORDER BY RAND() LIMIT 5', [playlistID, 'bob420'], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            res.status(500).send(err.message);
          });
        }

        const songIDs = [results.insertId]; // Use the insertId directly

        connection.commit((err) => {
          if (err) {
            return connection.rollback(() => {
              res.status(500).send(err.message);
            });
          }

          // Retrieve the playlist name
          connection.query('SELECT playlistName FROM Playlist WHERE playlistID = ?', [playlistID], (err, nameResult) => {
            if (err) {
              return res.status(500).send(err.message);
            }

            const playlistName = nameResult[0].playlistName;

            // Return the playlistName along with the songIDs
            res.json({ playlistName, songIDs, playlistID });
          });
        });
      });
    });
  });
});

//returns the collaborators of a playlist
app.get('/api/collaborators/:playlistName', (req, res) => {
  const playlistName = req.params.playlistName;
  connection.query(`SELECT
  c.collaborator,
  u.username AS collaboratorUsername
FROM
  Collaborators c
JOIN
  Playlist p ON c.playlistID = p.playlistID
JOIN
  User u ON c.collaborator = u.username
WHERE
  p.playlistName = '${playlistName}';

  `, (error, results) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.json(results);
    }
  });
});

//add collaborator to playlist
app.post('/api/addCollaborator/:usernameAndPlaylistID', (req, res) => {
  const username = req.params.usernameAndPlaylistID;
  //assuming we are receiving the URL in the format: /api/addCollaborator/username?playlistID=1
  const playlistID = req.query.playlistID;
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }

    // insert into collab table
    connection.query('INSERT INTO Collaborators (collaborator, playlistID) VALUES (?, ?)', [username, playlistID], (error, result) => {
      if (error) {
        return connection.rollback(() => {
          res.status(500).send(error.message);
        });
      }
      connection.commit((commitErr)=>{
        if (commitErr){
          return connection.rollback(()=>{
            res.status(500).send(commitErr.message);
          });
        }
        res.json({success:true, message: 'Successfully added collaborator'});
      })
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// USE FOR OPTION #5 (USER LOGIN)
// Not really implemented yet, not sure how we will do this one