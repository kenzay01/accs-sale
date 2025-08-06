import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs/promises";

let dbInstance = null;

class DatabaseManager {
  constructor() {
    if (dbInstance) return dbInstance;

    const dbDir = path.join(process.cwd(), "data");
    this.dbPath = path.join(dbDir, "bot.db");

    // Ensure the data directory exists
    this.ensureDataDirectory(dbDir);

    // Initialize SQLite database
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error("❌ Failed to connect to database:", err);
        throw err;
      }
      console.log(`✅ Connected to SQLite at ${this.dbPath}`);
    });

    dbInstance = this;
    this.init();
  }

  async ensureDataDirectory(dbDir) {
    try {
      await fs.mkdir(dbDir, { recursive: true });
    } catch (err) {
      console.error("❌ Failed to create data directory:", err);
      throw err;
    }
  }

  init() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        telegram_id INTEGER UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        language TEXT DEFAULT 'ru',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        label_ru TEXT,
        label_en TEXT,
        img TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS subcategories (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        label_ru TEXT,
        label_en TEXT,
        img TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`,

      `CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        category_id TEXT,
        subcategory_id TEXT,
        name TEXT,
        price REAL,
        description_ru TEXT,
        description_en TEXT,
        img TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id)
      )`,

      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        product_name TEXT,
        price REAL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
    ];

    this.db.serialize(() => {
      queries.forEach((query) => this.db.run(query));
      console.log("📦 SQLite schema initialized");
    });
  }

  // Async wrapper helpers
  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Users
  async getUser(telegramId) {
    return await this.get("SELECT * FROM users WHERE telegram_id = ?", [
      telegramId,
    ]);
  }

  async createOrUpdateUser(user) {
    const {
      telegram_id,
      username,
      first_name,
      last_name,
      language = "ru",
    } = user;
    return await this.run(
      `INSERT INTO users (telegram_id, username, first_name, last_name, language, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(telegram_id) DO UPDATE SET
         username = excluded.username,
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         language = excluded.language,
         updated_at = CURRENT_TIMESTAMP`,
      [telegram_id, username, first_name, last_name, language]
    );
  }

  async updateUserLanguage(telegramId, language) {
    return await this.run(
      "UPDATE users SET language = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?",
      [language, telegramId]
    );
  }

  async getUserOrders(telegramId) {
    return await this.all(
      `SELECT o.* FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE u.telegram_id = ?
       ORDER BY o.created_at DESC`,
      [telegramId]
    );
  }

  async createOrder(userTelegramId, productName, price) {
    const user = await this.getUser(userTelegramId);
    if (!user) throw new Error("User not found");
    return await this.run(
      `INSERT INTO orders (user_id, product_name, price, status)
       VALUES (?, ?, ?, 'pending')`,
      [user.id, productName, price]
    );
  }

  // Categories
  async createCategory(cat) {
    const { id, label_ru, label_en, img } = cat;
    return await this.run(
      `INSERT INTO categories (id, label_ru, label_en, img) VALUES (?, ?, ?, ?)`,
      [id, label_ru, label_en, img]
    );
  }

  async getCategories() {
    return await this.all("SELECT * FROM categories");
  }

  async getCategoryById(id) {
    return await this.get("SELECT * FROM categories WHERE id = ?", [id]);
  }

  async updateCategory(id, { label_ru, label_en, img }) {
    return await this.run(
      `UPDATE categories SET label_ru = ?, label_en = ?, img = ? WHERE id = ?`,
      [label_ru, label_en, img, id]
    );
  }

  async deleteCategory(id) {
    return await this.run(`DELETE FROM categories WHERE id = ?`, [id]);
  }

  // Subcategories
  async createSubcategory(sub) {
    const { id, category_id, label_ru, label_en, img } = sub;
    return await this.run(
      `INSERT INTO subcategories (id, category_id, label_ru, label_en, img)
       VALUES (?, ?, ?, ?, ?)`,
      [id, category_id, label_ru, label_en, img]
    );
  }

  async getSubcategories(categoryId) {
    return await this.all("SELECT * FROM subcategories WHERE category_id = ?", [
      categoryId,
    ]);
  }

  async getSubcategoryById(id) {
    return await this.get("SELECT * FROM subcategories WHERE id = ?", [id]);
  }

  async updateSubcategory(id, { label_ru, label_en, img }) {
    return await this.run(
      `UPDATE subcategories SET label_ru = ?, label_en = ?, img = ? WHERE id = ?`,
      [label_ru, label_en, img, id]
    );
  }

  async deleteSubcategory(id) {
    return await this.run("DELETE FROM subcategories WHERE id = ?", [id]);
  }

  // Items
  async createItem(item) {
    const {
      id,
      category_id,
      subcategory_id,
      name,
      price,
      description_ru,
      description_en,
      img,
    } = item;
    return await this.run(
      `INSERT INTO items (id, category_id, subcategory_id, name, price, description_ru, description_en, img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        category_id,
        subcategory_id,
        name,
        price,
        description_ru,
        description_en,
        img,
      ]
    );
  }

  async getItems() {
    return await this.all("SELECT * FROM items");
  }

  async getItemById(id) {
    return await this.get("SELECT * FROM items WHERE id = ?", [id]);
  }

  async updateItem(id, updatedItem) {
    const {
      category_id,
      subcategory_id,
      name,
      price,
      description_ru,
      description_en,
      img,
    } = updatedItem;
    return await this.run(
      `UPDATE items SET category_id = ?, subcategory_id = ?, name = ?, price = ?, description_ru = ?, description_en = ?, img = ?
       WHERE id = ?`,
      [
        category_id,
        subcategory_id,
        name,
        price,
        description_ru,
        description_en,
        img,
        id,
      ]
    );
  }

  async deleteItem(id) {
    return await this.run("DELETE FROM items WHERE id = ?", [id]);
  }

  close() {
    this.db.close();
    dbInstance = null;
    console.log("🛑 SQLite connection closed.");
  }
}

export default DatabaseManager;
