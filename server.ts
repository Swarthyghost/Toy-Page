import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pleasuretoys.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT
  )
`);

// Seed initial data if empty
const count = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (count.count === 0) {
  const initialProducts = JSON.parse(fs.readFileSync(path.join(__dirname, "src/data/products.json"), "utf8"));
  const insert = db.prepare("INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)");
  for (const p of initialProducts) {
    insert.run(p.name, p.price, p.image, p.category, p.description);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.get("/api/products/:id", (req, res) => {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.post("/api/products", (req, res) => {
    const { name, price, image, category, description } = req.body;
    const result = db.prepare("INSERT INTO products (name, price, image, category, description) VALUES (?, ?, ?, ?, ?)")
      .run(name, price, image, category, description);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/products/:id", (req, res) => {
    const { name, price, image, category, description } = req.body;
    db.prepare("UPDATE products SET name = ?, price = ?, image = ?, category = ?, description = ? WHERE id = ?")
      .run(name, price, image, category, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
