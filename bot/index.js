require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const Database = require("./database");
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

// Функція для екранування спецсимволів MarkdownV2
function escapeMarkdownV2(text) {
  if (!text) return "";
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

// Клас для управління ботом
class AccsSaleBot {
  constructor() {
    this.db = new Database();
    this.setupEventHandlers();
    console.log("🤖 Bot started!");
  }

  setupEventHandlers() {
    bot.onText(/\/start/, (msg) => {
      this.handleStart(msg);
    });

    bot.on("callback_query", (query) => {
      this.handleCallbackQuery(query);
    });

    bot.on("message", (msg) => {
      if (msg.text && !msg.text.startsWith("/")) {
        this.handleTextMessage(msg);
      }
    });

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
      const existingUser = await this.db.getUser(msg.from.id);

      if (existingUser && existingUser.language) {
        this.showMainMenu(chatId, existingUser.language);
      } else {
        await this.db.createOrUpdateUser(userData);
        this.showLanguageSelection(chatId, "ru"); // Для нових користувачів за замовчуванням російська
      }
    } catch (error) {
      console.error("Error processing /start:", error);
      bot.sendMessage(chatId, "❌ Error starting bot");
    }
  }

  showLanguageSelection(chatId, language = "ru") {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🇷🇺 Русский", callback_data: "lang_ru" },
          { text: "🇺🇸 English", callback_data: "lang_en" },
        ],
      ],
    };

    const t = translations[language];
    bot.sendMessage(chatId, t.welcome, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  }

  async showMainMenu(chatId, language = "ru") {
    const t = translations[language];
    const catalogUrl =
      language === "en"
        ? `https://diabet8.com/en?userId=${chatId}`
        : `https://diabet8.com/ru?userId=${chatId}`;

    const keyboard = {
      keyboard: [
        [
          {
            text: t.open_catalog,
            web_app: { url: catalogUrl },
          },
          t.my_orders,
        ],
        [t.information, t.support],
        [t.change_language],
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
        case t.change_language:
          this.showLanguageSelection(chatId, language);
          break;
        default:
          if (msg.web_app_data) {
            this.handleWebAppData(msg);
          } else {
            bot.sendMessage(chatId, t.unknown_option);
          }
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
        bot.sendMessage(chatId, t.orders_empty, { parse_mode: "Markdown" });
        return;
      }

      let message = `📦 *${escapeMarkdownV2(t.orders_list)}*\n`;

      orders.forEach((order, index) => {
        // Створюємо об'єкт Date з created_at
        const dateObj = new Date(order.created_at);

        // Форматуємо дату для України
        const date = dateObj.toLocaleDateString("uk-UA");

        // Форматуємо час з явним часовим поясом для України (EEST, UTC+3)
        const time = dateObj.toLocaleTimeString("uk-UA", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Kiev", // Явно вказуємо часовий пояс України
        });

        // Визначаємо статус замовлення
        let statusText = "";
        let statusEmoji = "";
        
        switch (order.status) {
          case "pending":
            statusText = language === "ru" ? "Ожидает" : "Pending";
            statusEmoji = "⏳";
            break;
          case "processing":
            statusText = language === "ru" ? "В обработке" : "In Progress";
            statusEmoji = "🔄";
            break;
          case "completed":
            statusText = language === "ru" ? "Завершено" : "Completed";
            statusEmoji = "✅";
            break;
          case "cancelled":
            statusText = language === "ru" ? "Отменено" : "Cancelled";
            statusEmoji = "❌";
            break;
          default:
            statusText = order.status;
            statusEmoji = "❓";
        }

        message += `${index + 1}\\. *${escapeMarkdownV2(
          order.product_name
        )}*\n`;
        message += `💰 $${escapeMarkdownV2(order.price.toString())}\n`;
        message += `${statusEmoji} *${escapeMarkdownV2(statusText)}*\n`;
        message += `📅 ${escapeMarkdownV2(date)} ${escapeMarkdownV2(time)}\n\n`;
      });

      bot.sendMessage(chatId, message, {
        parse_mode: "MarkdownV2",
      });
    } catch (error) {
      console.error("Error getting orders:", error);
      bot.sendMessage(chatId, "❌ Ошибка при получении заказов");
    }
  }

  showInformation(chatId, language) {
    const t = translations[language];

    const keyboard = {
      inline_keyboard: [
        [
          { text: t.channel_button, url: "t.me/+RThwE2g85517Lukw" },
          { text: t.chat_button, url: "t.me/Diabet8chat" },
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
        [{ text: t.contact_manager, url: "https://t.me/DrValuev" }],
      ],
    };

    console.log("Support keyboard:", keyboard);
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
