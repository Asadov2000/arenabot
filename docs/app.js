// Список товаров по категориям
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
  const cash = document.getElementById('cash').value || 0;

  // Сбор данных
  let reportText = "📊 Отчёт:\n\n";

  // Сбор данных по напиткам
  const drinkLines = products.drinks
    .map(product => {
      const value = document.getElementById(product).value || 0;
      return value > 0 ? `• ${product}: ${value} шт` : null;
    })
    .filter(Boolean);

  if (drinkLines.length > 0) {
    reportText += "🥤 Напитки:\n" + drinkLines.join('\n') + '\n';
  }

  // Сбор данных по снекам
  const snackLines = products.snacks
    .map(product => {
      const value = document.getElementById(product).value || 0;
      return value > 0 ? `• ${product}: ${value} шт` : null;
    })
    .filter(Boolean);

  if (snackLines.length > 0) {
    reportText += "\n🍫 Снеки:\n" + snackLines.join('\n') + '\n';
  }

  // Касса
  if (cash > 0) {
    reportText += `\n💰 Касса: ${cash} руб`;
  }

  // Проверка, не пустой ли отчет
  if (reportText.trim() === "📊 Отчёт:") {
    alert("Ошибка: Нет данных для отправки. Заполните хотя бы одно поле.");
    return;
  }

  // Получение данных из Telegram WebApp
  const telegram = window.Telegram.WebApp;
  const telegram_id = telegram.initDataUnsafe?.user?.id;

  // Проверка, доступен ли telegram_id
  if (!telegram_id) {
    alert("Ошибка: Не удалось получить ID пользователя. Откройте WebApp через Telegram.");
    return;
  }

  // Токен бота
  const botToken = '7912173425:AAHBeNkE-SawhZ1PvBqrKuqblUNwBezj8zs';

  // Формирование URL
  const encodedReport = encodeURIComponent(reportText);
  const telegramApiUrl = `https://api.telegram.org/bot ${botToken}/sendMessage?chat_id=${telegram_id}&text=${encodedReport}`;

  // Логирование для проверки
  console.log('Telegram ID:', telegram_id);
  console.log('Сформированная ссылка:', telegramApiUrl);

  // Отправка отчета через Telegram Bot API
  fetch(telegramApiUrl)
    .then(response => {
      if (response.ok) {
        console.log('Отчет отправлен');
        alert('Отчет успешно отправлен!');
      } else {
        return response.json().then(data => {
          console.error('Telegram API ошибка:', data);
          if (data.description === "Not Found") {
            alert("Ошибка: Бот не найден. Проверьте токен или ID пользователя.");
          } else {
            alert(`Ошибка: ${data.description}`);
          }
        });
      }
    })
    .catch(error => {
      console.error('Network error:', error);
      alert('Ошибка сети. Проверьте интернет и попробуйте снова.');
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