require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const Database = require("../database").default;
const translations = require("./translations");

// Отримуємо токен з змінних середовища
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("Error: BOT_TOKEN not found in environment variables");
  console.error("Create a .env file and add BOT_TOKEN=your_token_here");
  process.exit(1);
}

// Створюємо екземпляр бота
const bot = new TelegramBot(token, { polling: true });

// Клас для управління ботом
class AccsSaleBot {
  constructor() {
    this.db = new Database();
    this.setupEventHandlers();
    console.log("🤖 Bot started!");
  }

  setupEventHandlers() {
    // Обробка команди /start
    bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    // Обробка callback_query (натискання кнопок)
    bot.on("callback_query", (query) => {
      this.handleCallbackQuery(query);
    });

    // Обробка текстових повідомлень
    bot.on("message", (msg) => {
      if (msg.text && !msg.text.startsWith("/")) {
        this.handleTextMessage(msg);
      }
    });

    // Обробка помилок
    bot.on("error", (error) => {
      console.error("Помилка бота:", error);
    });
  }

  async handleStart(msg) {
    const chatId = msg.chat.id;
    const userData = {
      telegram_id: msg.from.id,
      username: msg.from.username,
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
    };

    try {
      // Check if user already exists and has a language set
      const existingUser = await this.db.getUser(msg.from.id);

      if (existingUser && existingUser.language) {
        // User already has a language set, show main menu directly
        this.showMainMenu(chatId, existingUser.language);
      } else {
        // New user or user without language, show language selection
        await this.db.createOrUpdateUser(userData);
        this.showLanguageSelection(chatId);
      }
    } catch (error) {
      console.error("Error processing /start:", error);
      bot.sendMessage(chatId, "❌ Error starting bot");
    }
  }

  showLanguageSelection(chatId) {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🇷🇺 Русский", callback_data: "lang_ru" },
          { text: "🇺🇸 English", callback_data: "lang_en" },
        ],
      ],
    };

    // Using Russian welcome message since it now contains both languages
    bot.sendMessage(chatId, translations.ru.welcome, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  }

  async showMainMenu(chatId, language = "ru") {
    const t = translations[language];
    const catalogUrl =
      language === "en"
        ? "https://accs-sale.vercel.app/en"
        : "https://accs-sale.vercel.app/ru";

    const keyboard = {
      keyboard: [
        [{ text: t.open_catalog, web_app: { url: catalogUrl } }, t.my_orders],
        [t.information, t.support],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    };

    bot.sendMessage(chatId, t.main_menu, {
      reply_markup: keyboard,
    });
  }

  async handleCallbackQuery(query) {
    const chatId = query.message.chat.id;
    const data = query.data;

    // Відповідаємо на callback query
    bot.answerCallbackQuery(query.id);

    try {
      if (data.startsWith("lang_")) {
        const language = data.split("_")[1];
        await this.db.updateUserLanguage(query.from.id, language);

        const t = translations[language];
        const languageName = language === "ru" ? "Русский" : "English";
        const emoji = language === "ru" ? "🇷🇺" : "🇺🇸";

        bot.sendMessage(
          chatId,
          `${emoji} *${languageName}* ${t.language_selected}`,
          {
            parse_mode: "Markdown",
          }
        );
        this.showMainMenu(chatId, language);
      } else if (data === "back_to_menu") {
        const user = await this.db.getUser(query.from.id);
        const language = user ? user.language : "ru";
        this.showMainMenu(chatId, language);
      } else {
        bot.sendMessage(chatId, translations.ru.unknown_option);
      }
    } catch (error) {
      console.error("Error processing callback query:", error);
      bot.sendMessage(chatId, "❌ Error processing request");
    }
  }

  async handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    try {
      const user = await this.db.getUser(msg.from.id);
      const language = user ? user.language : "ru";
      const t = translations[language];

      switch (text) {
        case t.my_orders:
          this.showMyOrders(chatId, msg.from.id, language);
          break;
        case t.information:
          this.showInformation(chatId, language);
          break;
        case t.support:
          this.showSupport(chatId, language);
          break;
        default:
          bot.sendMessage(chatId, t.unknown_option);
      }
    } catch (error) {
      console.error("Error processing text message:", error);
      bot.sendMessage(chatId, "❌ Error processing message");
    }
  }

  async showMyOrders(chatId, telegramId, language) {
    try {
      const orders = await this.db.getUserOrders(telegramId);
      const t = translations[language];

      if (orders.length === 0) {
        bot.sendMessage(chatId, t.orders_empty);
        return;
      }

      let message = t.orders_list;
      orders.forEach((order, index) => {
        const date = new Date(order.created_at).toLocaleDateString();
        message += `${index + 1}. ${order.product_name} - $${order.price} (${
          order.status
        })\nДата: ${date}\n\n`;
      });

      bot.sendMessage(chatId, message);
    } catch (error) {
      console.error("Error getting orders:", error);
      bot.sendMessage(chatId, "❌ Error getting orders");
    }
  }

  showInformation(chatId, language) {
    const t = translations[language];

    const keyboard = {
      inline_keyboard: [
        [
          { text: "🌐 Канал", url: "t.me/+RThwE2g85517Lukw" },
          { text: "💬 Чат", url: "t.me/Diabet8chat" },
        ],
      ],
    };

    bot.sendMessage(chatId, t.about_us, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  }

  showSupport(chatId, language) {
    const t = translations[language];

    const keyboard = {
      inline_keyboard: [
        [{ text: "📩 Написать менеджеру", url: "https://t.me/DrValuev" }],
      ],
    };

    bot.sendMessage(chatId, t.support_message, {
      reply_markup: keyboard,
    });
  }
}

// Запускаємо бота
const botInstance = new AccsSaleBot();

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping bot...");
  bot.stopPolling();
  botInstance.db.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Stopping bot...");
  bot.stopPolling();
  botInstance.db.close();
  process.exit(0);
});
