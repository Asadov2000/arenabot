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

  if (!telegram_id || !report_text) {
    return res.status(400).json({ error: 'Missing telegram_id or report_text' });
  }

  // Проверка, не заблокирован ли бот
  bot.getChat(telegram_id)
    .then(chat => {
      if (chat.type === 'private' && chat.id === telegram_id) {
        return bot.sendMessage(telegram_id, report_text)
          .then(() => res.sendStatus(200))
          .catch(sendError => {
            console.error('Ошибка отправки:', sendError.response?.body || sendError);
            if (sendError.response?.body?.description === 'Forbidden: bot was blocked by the user') {
              res.status(403).json({ error: 'Бот заблокирован пользователем. Напишите /start в боте.' });
            } else {
              res.status(500).json({ error: 'Не удалось отправить отчет' });
            }
          });
      } else {
        res.status(403).json({ error: 'Неверный тип чата. Ожидается private.' });
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