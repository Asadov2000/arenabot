const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
require('dotenv').config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

app.use(express.json());
app.use(cors());

// Получение данных от WebApp и отправка через Telegram Bot API
app.post('/send', (req, res) => {
  const { telegram_id, report_text } = req.body;
  
  if (!telegram_id || !report_text) {
    return res.status(400).json({ error: 'Missing telegram_id or report_text' });
  }

  bot.sendMessage(telegram_id, report_text)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error('Telegram error:', err);
      res.status(500).json({ error: 'Failed to send message via Telegram' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));