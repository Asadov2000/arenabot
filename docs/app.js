// Список товаров по категориям
// ← Редактируйте здесь, чтобы изменить товары (добавляйте/удаляйте в списке)
const products = {
  drinks: [
    "LitEnergy", "Адреналин", "Аскания", "Бёрн", "Вода", "Горилла",
    "Драйв", "Кола 0,3л", "Кола 1л", "Лаймон", "Липтон 0,5л", "Липтон 1л",
    "Морс", "Палпи", "РедБулл", "Сок 0,2л", "Сок 0,3л", "Спрайт", "Торнадо", "Фанта"
  ],
  snacks: [
    "KitKat", "M&Ms", "Батон", "Баунти", "Марс", "Пикник", "Сендвич 200",
    "Сендвич 300", "Сникерс", "Сухарики", "Твикс", "Тук крекер", "Чебупели"
  ]
};

// Генерация полей ввода
function generateInputFields() {
  const drinksContainer = document.getElementById('drinks');
  const snacksContainer = document.getElementById('snacks');

  products.drinks.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `<label>${product}:</label><input type="number" id="${product}" min="0">`;
    drinksContainer.appendChild(div);
  });

  products.snacks.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `<label>${product}:</label><input type="number" id="${product}" min="0">`;
    snacksContainer.appendChild(div);
  });
}

// Отправка отчета через Telegram Bot API
function sendReport() {
  const cash = document.getElementById('cash').value;
  let reportText = "📊 Отчёт:\n\n";

  // Сбор данных по напиткам
  reportText += "🥤 Напитки:\n";
  products.drinks.forEach(product => {
    const value = document.getElementById(product).value || 0;
    reportText += `• ${product}: ${value} шт\n`;
  });

  // Сбор данных по снекам
  reportText += "\n🍫 Снеки:\n";
  products.snacks.forEach(product => {
    const value = document.getElementById(product).value || 0;
    reportText += `• ${product}: ${value} шт\n`;
  });

  // Касса
  reportText += `\n💰 Касса: ${cash} руб`;

  // Получение данных из Telegram WebApp
  const telegram = window.Telegram.WebApp;
  const telegram_id = telegram.initDataUnsafe.user.id;

  // ← Замените на ваш токен бота (указан ниже)
  const botToken = '7912173425:AAHBeNkE-SawhZ1PvBqrKuqblUNwBezj8zs'; // ← Ваш токен

  // Формирование URL для Telegram Bot API
  const encodedReport = encodeURIComponent(reportText);
  const telegramApiUrl = `https://api.telegram.org/bot ${botToken}/sendMessage?chat_id=${telegram_id}&text=${encodedReport}`;

  // Отправка отчета через Telegram Bot API
  fetch(telegramApiUrl)
    .then(response => {
      if (response.ok) {
        console.log('Отчет успешно отправлен');
      } else {
        console.error('Ошибка отправки:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Network error:', error);
    });

  // Сохранение отчета в localStorage
  saveReportLocally();
}

// Загрузка последнего отчета из localStorage
function loadLastReport() {
  const lastReport = localStorage.getItem('lastReport');
  if (lastReport) {
    const lines = JSON.parse(lastReport);
    lines.forEach(([product, value]) => {
      const input = document.getElementById(product);
      if (input) input.value = value;
    });
  }
}

// Сохранение отчета в localStorage
function saveReportLocally() {
  const report = [];
  [...document.querySelectorAll('input[type="number"]')].forEach(input => {
    report.push([input.id, input.value]);
  });
  localStorage.setItem('lastReport', JSON.stringify(report));
}

// Инициализация
generateInputFields();