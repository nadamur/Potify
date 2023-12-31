const { createConnection } = require('mysql');

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

connection.query(query4_1, (err, rows) => {
    if (err) throw err;

    console.log('\n*************** Data for QUERY 4_1 ****************:\n');
    console.log(rows);

    const query4_2 = `SELECT username, SUM(secondsListened) AS totalListenTime 
                    FROM ListenTime 
                    GROUP BY username
                    ORDER BY totalListenTime DESC
                    LIMIT 1`;

    connection.query(query4_2, (err, rows) => {
        if (err) throw err;

        console.log('\n*************** Data for QUERY 4_2 ****************:\n');
        console.log(rows);

        // Close the connection after both queries are executed
        connection.end();
    });
});


// USE FOR OPTION #5 (USER LOGIN)
// Not really implemented yet, not sure how we will do this one