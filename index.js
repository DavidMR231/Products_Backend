const { Pool } = require("pg");
const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
require("dotenv").config();
const API_KEY = process.env.API_KEY;
const apiKeyValidation = (req, res, next) => {
  const userApiKey = req.get("x-api-key");
  if (userApiKey && userApiKey === API_KEY) {
    next();
  } else {
    res.status(401).send("Invalid API key");
  }
};
app.use(apiKeyValidation);

const pool = new Pool({
  user: "default",
  host: "ep-quiet-sun-10474282-pooler.us-east-1.postgres.vercel-storage.com",
  database: "verceldb",
  password: "q8hEO7VZtzrl",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

app.get("/products", (req, res) => {
  const traerproducts = `SELECT * FROM products `;
  pool.query(traerproducts).then((data) => {
    console.log("Traemos data", data.rows);
    res.send(data.rows);
  });
});
app.post("/products", (req, res) => {
  const Nameproduct = req.body.Nameproduct;
  const price = req.body.price;
  const quantity = req.body.quantity;

  const insertProduct = `INSERT INTO products (NameProduct, Price, Quantity) VALUES('${Nameproduct}', ${price}, ${quantity})`;

  pool
    .query(insertProduct)
    .then(() => {
      res.status(200).send("Product inserted successfully");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
});
app.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const { Nameproduct, price, quantity } = req.body;

  const updateProductQuery = `
          UPDATE products
          SET nameproduct = '${Nameproduct}', price = ${price}, quantity =${quantity}
          WHERE id = ${productId}`;
  pool
    .query(updateProductQuery)
    .then((data) => {
      console.log(`Product with ID ${productId} updated successfully.`);
      res.send(`Product with ID ${productId} updated successfully.`);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error updating product.");
    });
});

app.delete("/products/:id", (req, res) => {
  const productsId = req.params.id;
  const query = `DELETE FROM products WHERE id = $1;`;

  pool
    .query(query, [productsId])
    .then((data) => {
      if (data.rowCount === 0) {
        res.status(404).send("Producto no encontrado");
      } else {
        console.log(`Producto con ID ${productsId} eliminado exitosamente`);
        res.send(`Producto con ID ${productsId} eliminado exitosamente`);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error en el servidor");
    });
});
app.listen(PORT, (req, res) => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
