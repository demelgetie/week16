// Import the MySQL module
const mysql = require("mysql");
const express = require("express");
const cors = require("cors");
const app = express();

// Middleware (runs for all routes)
app.use(express.json()); // parse JSON request bodies

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

app.get("/install", (req, res) => {
  // 1. Create Users table first
  const users = `
    CREATE TABLE IF NOT EXISTS Users (
      user_id INT(11) AUTO_INCREMENT,
      User_name VARCHAR(50) NOT NULL,
      User_password VARCHAR(100) NOT NULL,
      PRIMARY KEY (user_id)
    ) ENGINE=InnoDB;
  `;

  // 2. Create Products table
  const products = `
    CREATE TABLE IF NOT EXISTS Products (
      Product_id INT(11) AUTO_INCREMENT,
      product_url VARCHAR(255) NOT NULL,
      product_name VARCHAR(100) NOT NULL,
      PRIMARY KEY (Product_id)
    ) ENGINE=InnoDB;
  `;

  // 3. Create Product_Description table
  const description = `
    CREATE TABLE IF NOT EXISTS Product_Description (
      Description_id INT AUTO_INCREMENT,
      Product_id INT(11) NOT NULL,
      Product_brief_description VARCHAR(255) NOT NULL,
      Product_img VARCHAR(255) NOT NULL,
      Product_link VARCHAR(255) NOT NULL,
      PRIMARY KEY (Description_id),
      FOREIGN KEY (Product_id) REFERENCES Products(Product_id)
    ) ENGINE=InnoDB;
  `;

  // 4. Create Product_Price table
  const price = `
    CREATE TABLE IF NOT EXISTS Product_Price (
      Price_id INT AUTO_INCREMENT PRIMARY KEY,
      Product_id INT(11),
      Starting_price VARCHAR(50) NOT NULL,
      Price_range VARCHAR(100) NOT NULL,
      FOREIGN KEY (Product_id) REFERENCES Products(Product_id)
    ) ENGINE=InnoDB;
  `;

  // 5. Create Orders table
  const orders = `
    CREATE TABLE IF NOT EXISTS Orders (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      Product_id INT,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id),
      FOREIGN KEY (Product_id) REFERENCES Products(Product_id)
    ) ENGINE=InnoDB;
  `;

  // Execute queries in proper order
  connection.query(users, (err) => {
    if (err) console.log("Users table error:", err);
  });

  connection.query(products, (err) => {
    if (err) console.log("Products table error:", err);
  });

  connection.query(description, (err) => {
    if (err) console.log("Description table error:", err);
  });

  connection.query(price, (err) => {
    if (err) console.log("Price table error:", err);
  });

  connection.query(orders, (err) => {
    if (err) console.log("Orders table error:", err);
  });

  res.send("✅ All tables created successfully!");
});


const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
