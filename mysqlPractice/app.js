// Import the MySQL module
const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const app = express();

// Create a connection object
const connection = mysql.createConnection({
  host: "localhost", // your MySQL host
  user: "myDBuser", // username you created
  password: "123456", // password you created
  database: "myDB", // database name
  
});

// Connect to the MySQL server
connection.connect((err) => {
  if (err) {
    console.error(" Connection failed:", err.message);
  } else {
    console.log(
      'Successfully connected to MySQL database "myDB" as user "myDBuser"'
    );
  }
});
