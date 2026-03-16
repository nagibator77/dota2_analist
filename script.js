// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#7a9bc4');
tg.setBackgroundColor('#7a9bc4');

// Глобальные переменные
let teamsData = [];
let currentTeam = null;
let currentPlayers = [];

// DOM элементы
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const teamInput = document.getElementById('teamInput');
const findTeamBtn = document.getElementById('findTeamBtn');
const teamError = document.getElementById('teamError');
const selectedTeamName = document.getElementById('selectedTeamName');
const playersContainer = document.getElementById('playersContainer');
const predictBtn = document.getElementById('predictBtn');
const resultContainer = document.getElementById('result');
const backBtn = document.getElementById('backBtn');

// Загрузка датасета
async function loadTeamsData() {
    try {
        tg.showProgress();
        const response = await fetch('teams.json');
        if (!response.ok) throw new Error('Не удалось загрузить teams.json');
        teamsData = await response.json();
        console.log(`✅ Загружено ${teamsData.length} команд`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        tg.showAlert('Ошибка загрузки данных команд. Попробуйте позже.');
        return false;
    } finally {
        tg.hideProgress();
    }
}

// Поиск команды (без учёта регистра)
function findTeamByName(name) {
    if (!name || !name.trim()) return null;
    
    const searchQuery = name.trim().toLowerCase();
    
    return teamsData.find(team => {
        const teamName = (team.team_name || '').toLowerCase();
        const teamTag = (team.team_tag || '').toLowerCase();
        
        // Проверяем по полному названию И по тегу
        return teamName.includes(searchQuery) || teamTag.toLowerCase() === searchQuery;
    });
}

// Создание полей для игроков
function renderPlayerInputs(players) {
    playersContainer.innerHTML = '';
    
    players.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'player-row';
        
        row.innerHTML = `
            <span class="player-name" title="${escapeHtml(player.name)}">
                ${index + 1}. ${escapeHtml(player.name)}
            </span>
            <input 
                type="text" 
                class="player-hero-input" 
                data-account-id="${player.account_id}"
                placeholder="Герой..."
                maxlength="30"
            >
        `;
        
        playersContainer.appendChild(row);
    });
}

// Экранирование HTML (защита от XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обработчик: поиск команды
async function handleFindTeam() {
    const teamName = teamInput.value.trim();
    
    if (!teamName) {
        showError('Введите название команды');
        return;
    }
    
    // Ищем команду
    const team = findTeamByName(teamName);
    
    if (!team) {
        showError(`Команда "${teamName}" не найдена ❌`);
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }
    
    // Команда найдена!
    hideError();
    currentTeam = team;
    currentPlayers = team.current_players || [];
    
    // Показываем шаг 2
    selectedTeamName.textContent = `${team.team_name} ${team.team_tag ? '[' + team.team_tag + ']' : ''}`;
    renderPlayerInputs(currentPlayers);
    
    // Переключаем шаги
    step1.classList.remove('active');
    step2.classList.add('active');
    resultContainer.classList.remove('show');
    
    tg.HapticFeedback.impactOccurred('light');
}

// Обработчик: предсказание
function handlePredict() {
    // Собираем данные о героях
    const heroInputs = playersContainer.querySelectorAll('.player-hero-input');
    const playersWithHeroes = [];
    
    heroInputs.forEach(input => {
        playersWithHeroes.push({
            account_id: input.dataset.accountId,
            name: input.previousElementSibling.textContent.replace(/^\d+\.\s*/, ''),
            hero: input.value.trim()
        });
    });
    
    // Валидация: хотя бы один герой должен быть введён
    const filledHeroes = playersWithHeroes.filter(p => p.hero);
    if (filledHeroes.length === 0) {
        tg.showAlert('Введите хотя бы одного героя для предсказания!');
        return;
    }
    
    // Показываем "загрузку"
    predictBtn.disabled = true;
    predictBtn.textContent = 'Анализ...';
    
    // Имитация анализа (замените на реальную логику)
    setTimeout(() => {
        // Простая логика предсказания
        const winChance = Math.floor(Math.random() * 30 + 55);
        const opponentWinChance = 100 - winChance;
        
        // Формируем результат
        let resultHTML = `
            <div style="font-size: 20px; margin-bottom: 15px; color: #2e1a7a;">
                🎯 Предсказание для ${currentTeam.team_name}
            </div>
            <div style="background: #f0f4ff; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
                <strong>Состав:</strong><br>
                ${playersWithHeroes.map(p => 
                    `• ${p.name}: ${p.hero || '—'}`
                ).join('<br>')}
            </div>
            <div style="font-size: 24px; color: #006400; margin: 10px 0;">
                🏆 Шанс победы: ${winChance}%
            </div>
            <div style="font-size: 14px; color: #666;">
                Противник: ${opponentWinChance}%
            </div>
        `;
        
        resultContainer.innerHTML = resultHTML;
        resultContainer.classList.add('show');
        
        // Возвращаем кнопку
        predictBtn.disabled = false;
        predictBtn.textContent = 'Предсказать';
        
        // Уведомление
        tg.showPopup({
            title: 'Готово!',
            message: `Шанс победы: ${winChance}%`,
            buttons: [{type: 'ok'}]
        });
        
        tg.HapticFeedback.notificationOccurred('success');
        
    }, 1200);
}

// Показать/скрыть ошибку
function showError(message) {
    teamError.textContent = message;
    teamError.style.display = 'block';
}

function hideError() {
    teamError.textContent = '';
    teamError.style.display = 'none';
}

// Обработчик: кнопка "Назад"
function handleBack() {
    step2.classList.remove('active');
    step1.classList.add('active');
    resultContainer.classList.remove('show');
    teamInput.value = '';
    hideError();
    currentTeam = null;
    currentPlayers = [];
    tg.HapticFeedback.impactOccurred('light');
}

// Навешиваем обработчики событий
function setupEventListeners() {
    findTeamBtn.addEventListener('click', handleFindTeam);
    
    teamInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleFindTeam();
    });
    
    predictBtn.addEventListener('click', handlePredict);
    
    backBtn.addEventListener('click', handleBack);
    
    // Авто-фокус на первое поле героя после рендера
    playersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('player-hero-input')) {
            e.target.select();
        }
    });
}

// Инициализация
async function init() {
    console.log('🎮 Dota Predictor Mini App starting...');
    
    // Загружаем данные
    const dataLoaded = await loadTeamsData();
    if (!dataLoaded) return;
    
    // Настраиваем события
    setupEventListeners();
    
    // Готовность
    tg.ready();
    console.log('✅ App ready');
}

// Запускаем
init();
