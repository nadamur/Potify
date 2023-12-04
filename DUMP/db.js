const { createConnection } = require('mysql');


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

connection.query('SELECT * FROM Song', (err, rows) => {
    if (err) throw err;

    console.log('Data received from Db:');
    console.log(rows);
});