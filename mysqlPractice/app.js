// Import required modules
const mysql = require("mysql");
const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware for CORS and parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create MySQL connection
const connection = mysql.createConnection({
  host: "127.0.0.1", // localhost or your connection host
  user: "myDBuser", // database user
  password: "123456", // database password
  database: "myDB", // your database name
  port: 3306, // MySQL default port
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log(" Connected to MySQL database: myconnection");
  }
});

// ------------------------------------------------------
//  ROUTE 1: Create all tables (/install)
// ------------------------------------------------------
app.get("/install", (req, res) => {
  // --- Create Products table ---
  const createProducts = `
    CREATE TABLE IF NOT EXISTS ProductTable (
      product_id INT AUTO_INCREMENT,
      product_url VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      PRIMARY KEY (product_id)
    )
  `;

  // --- Create Product Description table ---
  const createProDescription = `
    CREATE TABLE IF NOT EXISTS ProDescription (
      description_id INT AUTO_INCREMENT,
      product_id INT NOT NULL,
      product_brif_description TEXT NOT NULL,
      product_description TEXT NOT NULL,
      product_img VARCHAR(255) NOT NULL,
      product_link VARCHAR(255) NOT NULL,
      PRIMARY KEY (description_id),
      FOREIGN KEY (product_id) REFERENCES ProductTable(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `;

  // --- Create Product Price table ---
  const createProPrice = `
    CREATE TABLE IF NOT EXISTS ProductPrice (
      price_id INT AUTO_INCREMENT,
      product_id INT NOT NULL,
      starting_price VARCHAR(255) NOT NULL,
      price_range VARCHAR(255) NOT NULL,
      PRIMARY KEY (price_id),
      FOREIGN KEY (product_id) REFERENCES ProductTable(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `;

  // --- Create User table ---
  const createUser = `
    CREATE TABLE IF NOT EXISTS UserTable (
      user_id INT AUTO_INCREMENT,
      user_name VARCHAR(255) NOT NULL,
      user_password VARCHAR(255) NOT NULL,
      PRIMARY KEY (user_id)
    )
  `;

  // --- Create Orders table ---
  const createOrder = `
    CREATE TABLE IF NOT EXISTS OrderTable (
      order_id INT AUTO_INCREMENT,
      product_id INT NOT NULL,
      user_id INT NOT NULL,
      PRIMARY KEY (order_id),
      FOREIGN KEY (product_id) REFERENCES ProductTable(product_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (user_id) REFERENCES UserTable(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `;

  // Execute all table creation queries sequentially
  connection.query(createProducts, (err) => {
    if (err) console.error(" ProductTable error:", err);
  });

  connection.query(createProDescription, (err) => {
    if (err) console.error(" ProDescription error:", err);
  });

  connection.query(createProPrice, (err) => {
    if (err) console.error(" ProductPrice error:", err);
  });

  connection.query(createUser, (err) => {
    if (err) console.error(" UserTable error:", err);
  });

  connection.query(createOrder, (err) => {
    if (err) console.error(" OrderTable error:", err);
  });

  res.send(" All tables created successfully!");
});

// ------------------------------------------------------
//  ROUTE 2: Insert a new product and related data
// ------------------------------------------------------
app.post("/add-product", (req, res) => {
  const {
    product_name,
    product_url,
    product_brif_description,
    product_description,
    product_img,
    product_link,
    starting_price,
    price_range,
    user_name,
    user_password,
  } = req.body;

  // --- Step 1: Insert product into ProductTable ---
  const insertProduct = `
    INSERT INTO ProductTable (product_url, product_name)
    VALUES (?, ?)
  `;
  connection.query(
    insertProduct,
    [product_url, product_name],
    (err, productResult) => {
      if (err) {
        console.error(" Product insert error:", err);
        return res.status(500).send("Error inserting product");
      }

      const productId = productResult.insertId; // get product_id 1 , 2 , 3 
      // console.log(productId);

      // --- Step 2: Insert product details ---
      const insertDescription = `
      INSERT INTO ProDescription (product_id, product_brif_description, product_description, product_img,
  product_link)
      VALUES (?, ?, ?, ?, ?)
    `;

      connection.query(
        insertDescription,
        [
          productId,
          product_brif_description,
          product_description,
          product_img,
          product_link,
        ],
        (err) => {
          if (err) console.error(" Description insert error:", err);
        }
      );

      // --- Step 3: Insert price info ---
      const insertPrice = `
      INSERT INTO ProductPrice (product_id, starting_price, price_range)
      VALUES (?, ?, ?)
    `;
      connection.query(
        insertPrice,
        [productId, starting_price, price_range],
        (err) => {
          if (err) console.error(" Price insert error:", err);
        }
      );

      // --- Step 4: Insert user ---
      const insertUser = `
      INSERT INTO UserTable (user_name, user_password)
      VALUES (?, ?)
    `;
      connection.query(
        insertUser,
        [user_name, user_password],
        (err, userResult) => {
          if (err) {
            console.error(" User insert error:", err);
            return res.status(500).send("Error inserting user");
          }

          const userId = userResult.insertId; // get user_id

          // --- Step 5: Insert into Order table ---
          const insertOrder = `
        INSERT INTO OrderTable (product_id, user_id)
        VALUES (?, ?)
      `;
          connection.query(insertOrder, [productId, userId], (err) => {
            if (err) {
              console.error(" Order insert error:", err);
              return res.status(500).send("Error inserting order");
            }

            //  Success response
            res.send(
              " Product, Description, Price, User, and Order added successfully!"
            );
          });
        }
      );
    }
  );
});

// Route to get all iPhones with their descriptions and prices
app.get("/iphones", (req, res) => {
  // SQL query to join Products, ProductDescriptions, and ProductPrices tables
  connection.query(
    `SELECT * FROM Producttable
     INNER JOIN Prodescription ON Producttable.product_id = ProDescription.product_id
     INNER JOIN ProductPrice ON Producttable.product_id = ProductPrice.product_id`,
    (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).send("Database error");
        return;
      }
      // Send the joined data as JSON response
      res.json(rows);
    }
  );
});

// ------------------------------------------------------
//  Start the Express server
// ------------------------------------------------------
const PORT = 3001;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
