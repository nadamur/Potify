const { createConnection } = require('mysql');

const connection = createConnection({
    host: 'localhost',
    user: 'root',
    password: '123!@#QWEasdzxc',
    database: 'Potify',
    port: 3306,
});

connection.query('SELECT * FROM songs', (err, rows) => {
    if (err) throw err;

    console.log('Data received from Db:');
    console.log(rows);
});