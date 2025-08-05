const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.dbPath = path.join(__dirname, 'bot.db');
        this.db = new sqlite3.Database(this.dbPath);
        this.init();
    }

    init() {
        this.db.serialize(() => {
            // Створюємо таблицю користувачів
            this.db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    telegram_id INTEGER UNIQUE,
                    username TEXT,
                    first_name TEXT,
                    last_name TEXT,
                    language TEXT DEFAULT 'ru',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Створюємо таблицю замовлень
            this.db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    product_name TEXT,
                    price REAL,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `);

            console.log('📊 База даних ініціалізована');
        });
    }

    // Отримати користувача за Telegram ID
    getUser(telegramId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE telegram_id = ?',
                [telegramId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    // Створити або оновити користувача
    createOrUpdateUser(userData) {
        return new Promise((resolve, reject) => {
            const { telegram_id, username, first_name, last_name, language = 'ru' } = userData;
            
            this.db.run(`
                INSERT OR REPLACE INTO users 
                (telegram_id, username, first_name, last_name, language, updated_at) 
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [telegram_id, username, first_name, last_name, language], function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
        });
    }

    // Оновити мову користувача
    updateUserLanguage(telegramId, language) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET language = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
                [language, telegramId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }

    // Отримати замовлення користувача
    getUserOrders(telegramId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT o.* FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE u.telegram_id = ?
                ORDER BY o.created_at DESC
            `, [telegramId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Створити замовлення
    createOrder(userTelegramId, productName, price) {
        return new Promise((resolve, reject) => {
            // Спочатку отримуємо user_id
            this.getUser(userTelegramId).then(user => {
                if (!user) {
                    reject(new Error('Користувач не знайдений'));
                    return;
                }

                this.db.run(`
                    INSERT INTO orders (user_id, product_name, price, status)
                    VALUES (?, ?, ?, 'pending')
                `, [user.id, productName, price], function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                });
            }).catch(reject);
        });
    }

    // Закрити з'єднання з базою даних
    close() {
        this.db.close();
    }
}

module.exports = Database; 