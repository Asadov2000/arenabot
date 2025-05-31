const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
require('dotenv').config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }); // ← Включаем polling

app.use(express.json());
app.use(cors());

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Привет! Откройте WebApp для учёта товаров.');
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'ℹ️ Используйте WebApp для заполнения данных.\nОтчеты будут отправлены автоматически.');
});

// API для WebApp
app.post('/send', (req, res) => {
  const { telegram_id, report_text } = req.body;

  if (!telegram_id || !report_text) {
    return res.status(400).json({ error: 'Missing telegram_id or report_text' });
  }

  bot.getChat(telegram_id)
    .then(chat => {
      if (chat.type === 'private') {
        return bot.sendMessage(telegram_id, report_text)
          .then(() => res.sendStatus(200))
          .catch(sendError => {
            console.error('Ошибка отправки:', sendError.response?.body || sendError);
            if (sendError.response?.body?.description === 'Forbidden: bot was blocked by the user') {
              res.status(403).json({ error: 'Бот заблокирован. Напишите /start в боте.' });
            } else {
              res.status(500).json({ error: 'Не удалось отправить отчет' });
            }
          });
      } else {
        res.status(403).json({ error: 'Неверный тип чата' });
      }
    })
    .catch(chatError => {
      console.error('Ошибка проверки чата:', chatError.response?.body || chatError);
      if (chatError.response?.body?.description === 'Forbidden: bot was blocked by the user') {
        res.status(403).json({ error: 'Бот заблокирован. Напишите /start в боте.' });
      } else {
        res.status(500).json({ error: 'Не удалось проверить статус чата' });
      }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));