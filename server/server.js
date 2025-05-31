const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
require('dotenv').config();

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);

app.use(express.json());
app.use(cors());

app.post('/send', (req, res) => {
  const { telegram_id, report_text } = req.body;
  bot.sendMessage(telegram_id, report_text)
    .catch(err => console.error('Telegram error:', err));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));