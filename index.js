const { Pool } = require("pg");
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const API_KEY = process.env.API_KEY;

// Configuración de la piscina de PostgreSQL
const pool = new Pool({
  user: "default",
  host: "ep-quiet-sun-10474282-pooler.us-east-1.postgres.vercel-storage.com",
  database: "verceldb",
  password: "q8hEO7VZtzrl",
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Middleware para validar la API key
const apiKeyValidation = (req, res, next) => {
  const userApiKey = req.get("x-api-key");
  if (userApiKey && userApiKey === API_KEY) {
    next();
  } else {
    res.status(401).send("Invalid API key");
  }
};
app.use(apiKeyValidation);

// Middleware para manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Consulta SQL para insertar un producto
const insertProductQuery = `INSERT INTO products (NameProduct, Price, Quantity) VALUES($1, $2, $3)`;

// Ruta para obtener todos los productos
app.get("/products", async (req, res) => {
  try {
    const traerproducts = `SELECT * FROM products`;
    const data = await pool.query(traerproducts);
    console.log("Traemos data", data.rows);
    res.send(data.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// Ruta para agregar un nuevo producto
app.post("/products", async (req, res, next) => {
  try {
    const { Nameproduct, price, quantity } = req.body;

    // Validación de entrada
    if (!Nameproduct || typeof price !== 'number' || typeof quantity !== 'number') {
      return res.status(400).send("Invalid input data");
    }

    await pool.query(insertProductQuery, [Nameproduct, price, quantity]);
    res.status(200).send("Product inserted successfully");
  } catch (error) {
    next(error);
  }
});

// Ruta para actualizar un producto
app.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const { Nameproduct, price, quantity } = req.body;

  const updateProductQuery = `
    UPDATE products
    SET nameproduct = $1, price = $2, quantity = $3
    WHERE id = $4`;

  try {
    const data = await pool.query(updateProductQuery, [Nameproduct, price, quantity, productId]);
    console.log(`Product with ID ${productId} updated successfully.`);
    res.send(`Product with ID ${productId} updated successfully.`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating product.");
  }
});

// Ruta para eliminar un producto
app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;
  const deleteProductQuery = `DELETE FROM products WHERE id = $1`;

  try {
    const data = await pool.query(deleteProductQuery, [productId]);
    if (data.rowCount === 0) {
      res.status(404).send("Product not found");
    } else {
      console.log(`Product with ID ${productId} deleted successfully`);
      res.send(`Product with ID ${productId} deleted successfully`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting product.");
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Manejar eventos de cierre
process.on('beforeExit', () => pool.end());
process.on('SIGINT', () => {
  pool.end();
  process.exit(0);
});
