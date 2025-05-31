// Список товаров по категориям (добавьте все товары из интерфейса)
const products = {
  drinks: [
    // Напитки из вашего интерфейса
    "LitEnergy", "Адреналин", "Аскания", "Бёрн", "Вода", "Горилла",
    "Драйв", "Кола 0,3л", "Кола 1л", "Лаймон", "Липтон 0,5л", "Липтон 1л",
    "Морс", "Палпи", "РедБулл", "Сок 0,2л", "Сок 0,3л", "Спрайт", "Торнадо", "Фанта"
  ],
  snacks: [
    // Снеки из вашего интерфейса
    "Сникерс", "Сухарики", "Твикс", "Тук крекер", "Чебупели"
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

// Сохранение отчета в localStorage
function saveReportLocally() {
  const report = [];
  [...document.querySelectorAll('input[type="number"]')].forEach(input => {
    report.push([input.id, input.value]);
  });
  localStorage.setItem('lastReport', JSON.stringify(report));
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

// Отправка отчета
function sendReport() {
  const cash = document.getElementById('cash').value || 0;

  // Сбор данных
  let reportText = "📊 Отчёт:\n\n";

  // Напитки
  const drinkLines = products.drinks
    .map(product => {
      const value = document.getElementById(product).value || 0;
      return value > 0 ? `• ${product}: ${value} шт` : null;
    })
    .filter(Boolean);

  if (drinkLines.length > 0) {
    reportText += "🥤 Напитки:\n" + drinkLines.join('\n') + '\n';
  }

  // Снеки
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

  // Получение Telegram ID
  const telegram = window.Telegram.WebApp;
  const telegram_id = telegram.initDataUnsafe?.user?.id;

  if (!telegram_id) {
    alert("Ошибка: Не удалось получить ID пользователя. Откройте WebApp через Telegram.");
    return;
  }

  // Отправка данных на сервер
  const SERVER_URL = 'https://inventory-report-server.onrender.com '; // ← Укажите ваш URL
  fetch(`${SERVER_URL}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ telegram_id, report_text: reportText })
  })
    .then(response => {
      if (response.ok) {
        console.log('Отчет отправлен');
        alert('Отчет успешно отправлен!');
      } else {
        return response.json().then(data => {
          alert(`Ошибка: ${data.error || 'Неизвестная ошибка'}`);
        });
      }
    })
    .catch(error => {
      console.error('Network error:', error);
      alert('Ошибка сети. Проверьте интернет и попробуйте снова.');
    });

  // Сохранение в localStorage
  saveReportLocally();
}