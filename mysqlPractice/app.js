// ✅ Import required modules
const mysql = require("mysql");
const express = require("express");
const cors = require("cors");

// ✅ Initialize Express app
const app = express();

// ✅ Middleware for CORS and parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Create MySQL connection
const db = mysql.createConnection({
  host: "127.0.0.1", // localhost or your DB host
  user: "myDBuser", // database user
  password: "123456", // database password
  database: "myDB", // your database name
  port: 3306, // MySQL default port
});

// ✅ Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error(" Database connection failed:", err);
  } else {
    console.log(" Connected to MySQL database: myDB");
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
    ) ENGINE=InnoDB;
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
    ) ENGINE=InnoDB;
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
    ) ENGINE=InnoDB;
  `;

  // --- Create User table ---
  const createUser = `
    CREATE TABLE IF NOT EXISTS UserTable (
      user_id INT AUTO_INCREMENT,
      user_name VARCHAR(255) NOT NULL,
      user_password VARCHAR(255) NOT NULL,
      PRIMARY KEY (user_id)
    ) ENGINE=InnoDB;
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
    ) ENGINE=InnoDB;
  `;

  // Execute all table creation queries sequentially
  db.query(createProducts, (err) => {
    if (err) console.error(" ProductTable error:", err);
  });

  db.query(createProDescription, (err) => {
    if (err) console.error(" ProDescription error:", err);
  });

  db.query(createProPrice, (err) => {
    if (err) console.error(" ProductPrice error:", err);
  });

  db.query(createUser, (err) => {
    if (err) console.error(" UserTable error:", err);
  });

  db.query(createOrder, (err) => {
    if (err) console.error(" OrderTable error:", err);
  });

  res.send("✅ All tables created successfully!");
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
  db.query(insertProduct, [product_url, product_name], (err, productResult) => {
    if (err) {
      console.error(" Product insert error:", err);
      return res.status(500).send("Error inserting product");
    }

    const productId = productResult.insertId; // get product_id

    // --- Step 2: Insert product details ---
    const insertDescription = `
      INSERT INTO ProDescription (product_id, product_brif_description, product_description, product_img, product_link)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
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
    db.query(insertPrice, [productId, starting_price, price_range], (err) => {
      if (err) console.error(" Price insert error:", err);
    });

    // --- Step 4: Insert user ---
    const insertUser = `
      INSERT INTO UserTable (user_name, user_password)
      VALUES (?, ?)
    `;
    db.query(insertUser, [user_name, user_password], (err, userResult) => {
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
      db.query(insertOrder, [productId, userId], (err) => {
        if (err) {
          console.error(" Order insert error:", err);
          return res.status(500).send("Error inserting order");
        }

        //  Success response
        res.send(
          " Product, Description, Price, User, and Order added successfully!"
        );
      });
    });
  });
});

// ------------------------------------------------------
//  Start the Express server
// ------------------------------------------------------
const PORT = 3001;
app.listen(PORT, () =>
  console.log(` Server running on http://localhost:${PORT}`)
);
