// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Расширяем на весь экран
tg.expand();

// Устанавливаем цвета темы
tg.setHeaderColor('#7a9bc4');
tg.setBackgroundColor('#7a9bc4');

// Элементы DOM
const direInput = document.getElementById('direInput');
const radiantInput = document.getElementById('radiantInput');
const predictBtn = document.getElementById('predictBtn');
const resultContainer = document.getElementById('result');

// Функция предсказания
function predictWinner() {
    const direTeam = direInput.value.trim();
    const radiantTeam = radiantInput.value.trim();
    
    // Проверяем заполненность полей
    if (!direTeam || !radiantTeam) {
        tg.showAlert('Пожалуйста, введите названия обеих команд!');
        return;
    }
    
    // Показываем индикатор загрузки
    predictBtn.disabled = true;
    predictBtn.textContent = 'Анализ...';
    
    // Имитация анализа (замените на реальную логику)
    setTimeout(() => {
        // Простая логика предсказания (случайный выбор)
        const winner = Math.random() > 0.5 ? 'dire' : 'radiant';
        const winnerName = winner === 'dire' ? direTeam : radiantTeam;
        const winnerColor = winner === 'dire' ? '#8b0000' : '#006400';
        
        // Показываем результат
        resultContainer.innerHTML = `
            <div style="color: ${winnerColor}; font-size: 24px; margin-bottom: 10px;">
                🏆 Победитель
            </div>
            <div style="color: #2e1a7a; font-size: 20px;">
                ${winnerName}
            </div>
            <div style="color: #666; font-size: 14px; margin-top: 10px;">
                Шанс победы: ${Math.floor(Math.random() * 30 + 55)}%
            </div>
        `;
        
        resultContainer.classList.add('show');
        
        // Возвращаем кнопку
        predictBtn.disabled = false;
        predictBtn.textContent = 'Предсказать';
        
        // Показываем уведомление Telegram
        tg.showPopup({
            title: 'Предсказание готово!',
            message: `Победитель: ${winnerName}`,
            buttons: [{type: 'ok'}]
        });
        
    }, 1500);
}

// Обработчик кнопки
predictBtn.addEventListener('click', predictWinner);

// Обработка нажатия Enter
direInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') radiantInput.focus();
});

radiantInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') predictWinner();
});

// Готовность приложения
tg.ready();