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
        label_ru TEXT,
        label_en TEXT,
        img TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

      `CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        title_ru TEXT,
        title_en TEXT,
        content_ru TEXT,
        content_en TEXT,
        content_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS db_init (
        id INTEGER PRIMARY KEY,
        initialized_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    this.db.serialize(() => {
      // Create tables
      queries.forEach((query) => this.db.run(query));

      // Check if database has been initialized
      this.db.get("SELECT * FROM db_init WHERE id = 1", [], (err, row) => {
        if (err) {
          console.error("❌ Error checking db_init:", err);
          return;
        }

        if (!row) {
          // Database not initialized, insert default data
          this.db.run(`
            INSERT OR IGNORE INTO pages (id, title_ru, title_en, content_ru, content_en, content_type) VALUES
            (
              'about',
              'О нас',
              'About Us',
              'Наша команда обладает многолетним опытом в сфере букмекерских решений, включая работу внутри самих компаний. Мы знаем внутренние процессы, риски и требования — и предлагаем только то, что прошло практическую проверку.\n📍 Предлагаем проверенные аккаунты из ключевых регионов: 🇳🇱 🇸🇪 🇪🇸 🇵🇱 🇮🇩 🇨🇦 — с гарантией качества и полной готовностью к использованию.\n✅ Все аккаунты и банковские реквизиты оформлены на реальных людей.\n🔐 Безопасность, конфиденциальность и стабильность — в приоритете.\n🧾 Большая база проверенных людей, выстроенная за годы практики.\n📞 Поддержка всегда на связи: поможем, подскажем, настроим.\n💥 Присоединяйтесь и делайте ставки с уверенностью!\n📩 Пишите нашему менеджеру: @DrValuev\n🌐 Канал: t.me/+RThwE2g85517Lukw\n🌐 Чат: t.me/Diabet8chat',
              'Our team has many years of experience in bookmaker-related solutions, including firsthand work within betting companies. We understand internal processes, risks, and requirements — and offer only what’s been proven to work in practice.\n📍 We provide verified accounts from key regions: 🇳🇱 🇸🇪 🇪🇸 🇵🇱 🇮🇩 🇨🇦 — fully tested and ready to use.\n✅ All accounts and banking details are registered to real individuals.\n🔐 Security, confidentiality, and stability are our top priorities.\n🧾 Over the years, we’ve built a large network of trusted and proven people.\n💸 We actively operate in these regions ourselves — bookmakers pay reliably.\n📞 Support is always available: we’ll help, advise, and guide you through every step.\n💥 Ready to join and bet with confidence?\n📩 Contact our manager: @DrValuev\n🌐 Channel: t.me/+RThwE2g85517Lukw\n🌐 Chat: t.me/Diabet8chat',
              'text'
            ),
            (
              'faq',
              'Часто задаваемые вопросы',
              'FAQ',
              '[
                {"question": "Могу ли я получить доступ к почте, привязанной к аккаунту?", "answer": "Нет. Доступ к электронной почте не предоставляется ни при каких условиях."},
                {"question": "Можно ли получить фото документов или личные данные владельца аккаунта?", "answer": "Нет. Мы не передаём личную информацию или документы."},
                {"question": "Вы продаёте удостоверения личности, паспорта или водительские права?", "answer": "Нет. Мы не продаём и не распространяем документы, связанные с идентификацией личности."},
                {"question": "Можно ли купить аккаунт без депозитов или выводов с вашей стороны?", "answer": "Нет. Мы передаём только полностью подготовленные аккаунты — с проверенными действиями, включая пополнение и/или вывод. Это гарантирует их работоспособность и снижает риски для клиента."},
                {"question": "Можете ли вы посоветовать букмекеров, прокомментировать скриншоты или сказать, какие букмекеры покупаются чаще всего?", "answer": "Нет. Любая информация о букмекерах и предпочтениях клиентов является конфиденциальной."},
                {"question": "Как происходит процесс депозита?", "answer": "Вы переводите нам сумму в криптовалюте — мы делаем депозит с нашей стороны."},
                {"question": "Как происходит процесс вывода средств?", "answer": "Вы предоставляете аккаунт и сумму для вывода. Мы либо объясняем, как подать заявку, либо делаем всё за вас."},
                {"question": "Можно ли вернуть или обменять аккаунт после покупки?", "answer": "Нет. Все продажи окончательны — возвраты и обмены не предусмотрены."},
                {"question": "Что делать, если букмекер блокирует или лимитирует аккаунт?", "answer": "Мы не несем ответственности за блокировки или лимиты после передачи аккаунта. Использование — на ваш риск."},
                {"question": "Можно оплатить после получения аккаунта?", "answer": "Нет. Работаем только по предоплате — без отсрочек и «доверительных» схем."}
              ]',
              '[
                {"question": "Can I get access to the email linked to the account?", "answer": "No. Access to the email is not provided under any circumstances."},
                {"question": "Can I receive photos of documents or personal data of the account owner?", "answer": "No. We do not share any personal information or identification materials."},
                {"question": "Do you sell IDs, passports, or driver’s licenses?", "answer": "No. We do not sell or distribute any identity-related documents."},
                {"question": "Can I buy an account without deposits or withdrawals made on your side?", "answer": "No. We only deliver fully prepared accounts — with verified activity, including deposits and/or withdrawals. This ensures functionality and reduces risk for the client."},
                {"question": "Can you recommend bookmakers, comment on screenshots, or tell which bookmakers are most purchased?", "answer": "No. All information about bookmakers and client preferences is strictly confidential."},
                {"question": "How does the deposit process work?", "answer": "You send us the agreed amount in cryptocurrency — we handle the deposit from our side."},
                {"question": "How does the withdrawal process work?", "answer": "You provide the account and the amount to withdraw. We either guide you through the request process or handle it ourselves."},
                {"question": "Can I return or exchange an account after purchase?", "answer": "No. All sales are final — we do not offer refunds or exchanges."},
                {"question": "What if the bookmaker blocks or limits the account?", "answer": "We are not responsible for any blocks or limits after the account is delivered. You use the account at your own risk."},
                {"question": "Can I pay after receiving the account?", "answer": "No. We work strictly on a prepayment basis — no exceptions."}
              ]',
              'faq'
            ),
            (
              'promotions',
              'Акции',
              'Promotions',
              '',
              '',
              'text'
            ),
            (
              'terms',
              'Условия использования',
              'Terms & Conditions',
              '🔹 Мы несем полную ответственность за каждого человека, на которого оформлен аккаунт. Все лица находятся на связи и готовы к взаимодействию при необходимости.\n🔹 Мы не отвечаем за средства на счёте в случае блокировки аккаунта со стороны букмекера. Однако, если это возможно, мы постараемся помочь через владельца аккаунта.\n🔹 Все переводы осуществляются только в криптовалюте. Мы не используем банковские системы или другие платёжные сервисы.\n\n💳 Условия:\n✅ Первый депозит — 0%\n✅ Вывод средств — 10% от суммы вывода\n* Комиссия включает расходы на перевод и конвертацию по локальному курсу (не Google).\n\n🏦 Возможна сделка через гаранта\n🧳 Постоянным клиентам — индивидуальные условия\n✅ Приобретая наши услуги, вы соглашаетесь с этими правилами',
              '🔹 We take full responsibility for every person under whose name an account is registered. All individuals are available and ready to cooperate if needed.\n🔹 We are not responsible for funds in the account if the bookmaker blocks it for any reason. However, if possible, we will try to help resolve the issue through the account holder.\n🔹 All transactions are processed exclusively in cryptocurrency. We do not accept or send funds via banking systems or third-party payment services.\n\n💳 Financial Terms:\n✅ First deposit — 0% fee\n✅ Withdrawals — 10% of the withdrawal amount\n* The fee includes conversion and transfer costs. Currency is converted at the actual local exchange rate (not Google rate).\n\n🏦 Escrow deal available upon request\n🧳 Custom terms for regular clients\n✅ By using our services, you agree to these rules and conditions',
              'text'
            ),
            (
              'partner',
              'Сотрудничество',
              'Partner with Us',
              'Мы предлагаем прозрачные условия, быстрые выплаты и надёжную команду. Присоединяйтесь к нам и развивайтесь с партнёром, которому можно доверять — напишите нашему менеджеру, чтобы узнать все детали.',
              'We offer transparent terms, fast payouts, and a reliable team. Join us and grow with a partner you can trust — message our manager for full details.',
              'text'
            );
          `);

          // Mark database as initialized
          this.db.run("INSERT INTO db_init (id) VALUES (1)", [], (err) => {
            if (err) {
              console.error("❌ Error marking db_init:", err);
            } else {
              console.log("📦 SQLite schema and initial data initialized");
            }
          });
        } else {
          console.log("📦 SQLite schema initialized (data already present)");
        }
      });
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
    const { id, label_ru, label_en, img } = sub;
    return await this.run(
      `INSERT INTO subcategories (id, label_ru, label_en, img)
       VALUES (?, ?, ?, ?)`,
      [id, label_ru, label_en, img]
    );
  }

  async getSubcategories() {
    return await this.all("SELECT * FROM subcategories");
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

  // Pages
  async createPage(page) {
    const { id, title_ru, title_en, content_ru, content_en, content_type } =
      page;
    return await this.run(
      `INSERT INTO pages (id, title_ru, title_en, content_ru, content_en, content_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, title_ru, title_en, content_ru, content_en, content_type]
    );
  }

  async getPages() {
    return await this.all("SELECT * FROM pages");
  }

  async getPageById(id) {
    return await this.get("SELECT * FROM pages WHERE id = ?", [id]);
  }

  async updatePage(
    id,
    { title_ru, title_en, content_ru, content_en, content_type }
  ) {
    return await this.run(
      `UPDATE pages SET title_ru = ?, title_en = ?, content_ru = ?, content_en = ?, content_type = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title_ru, title_en, content_ru, content_en, content_type, id]
    );
  }

  async deletePage(id) {
    return await this.run("DELETE FROM pages WHERE id = ?", [id]);
  }

  close() {
    this.db.close();
    dbInstance = null;
    console.log("🛑 SQLite connection closed.");
  }
}

export default DatabaseManager;
