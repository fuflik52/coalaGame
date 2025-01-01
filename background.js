// Глобальные переменные
let lastActivityTime = Date.now();
let lastVisitTime = parseInt(localStorage.getItem('lastVisitTime')) || Date.now();
let isInactive = false;
let inactivityCheckInterval;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем и начисляем офлайн-прибыль
    updateBalanceWithOfflineEarnings(calculateOfflineEarnings());
    
    // Запускаем периодическое начисление
    setInterval(() => {
        const earnings = calculateOfflineEarnings();
        if (earnings > 0) {
            updateBalanceWithOfflineEarnings(earnings);
        }
    }, 5000); // Каждые 5 секунд
    
    // Запускаем отслеживание активности
    startInactivityCheck();
    
    // Добавляем обработчики активности пользователя
    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('keypress', handleUserActivity);
    document.addEventListener('touchstart', handleUserActivity);
});

// Функция для отслеживания неактивности
function startInactivityCheck() {
    inactivityCheckInterval = setInterval(() => {
        const currentTime = Date.now();
        const inactiveTime = currentTime - lastActivityTime;
        
        // Если прошло больше 15 секунд неактивности
        if (inactiveTime >= 15000 && !isInactive) {
            isInactive = true;
            const earnings = calculateOfflineEarnings();
            if (earnings > 0) {
                showOfflineEarningsNotification(earnings);
            }
        }
    }, 1000); // Проверяем каждую секунду
}

// Обработчик активности пользователя
function handleUserActivity() {
    lastActivityTime = Date.now();
    isInactive = false;
}

// Функция для получения времени последнего визита
function getLastVisitTime() {
    return parseInt(localStorage.getItem('lastVisitTime')) || Date.now();
}

// Функция для получения текущей прибыли в час
function getCurrentPerHour() {
    return parseFloat(localStorage.getItem('hourlyRate')) || 0;
}

// Функция для расчета офлайн прибыли
function calculateOfflineEarnings() {
    const lastVisit = getLastVisitTime();
    const currentTime = Date.now();
    const hoursOffline = (currentTime - lastVisit) / (1000 * 60 * 60); // Конвертируем миллисекунды в часы
    const perHour = getCurrentPerHour();
    
    return Math.floor(hoursOffline * perHour);
}

// Обновляем баланс и показываем уведомление
function updateBalanceWithOfflineEarnings(earnings) {
    const currentBalance = parseFloat(localStorage.getItem('balance')) || 0;
    const newBalance = currentBalance + earnings;
    localStorage.setItem('balance', newBalance.toString());
    
    const balanceElement = document.querySelector('.balance');
    if (balanceElement) {
        balanceElement.textContent = Math.floor(newBalance).toString();
    }
    
    if (earnings > 0) {
        showOfflineEarningsNotification(earnings);
    }
}

// Функция для показа уведомления
function showOfflineEarningsNotification(earnings) {
    const notification = document.createElement('div');
    notification.className = 'offline-earnings-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>Офлайн прибыль!</h3>
            <p>Вы заработали: ${Math.floor(earnings)} монет</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Функция для сохранения времени последнего визита
function saveLastVisitTime() {
    const currentTime = Date.now();
    lastVisitTime = currentTime;
    localStorage.setItem('lastVisitTime', currentTime.toString());
}

// Сохраняем время перед закрытием страницы
window.addEventListener('beforeunload', () => {
    saveLastVisitTime();
});

// Обработчик видимости страницы
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Страница скрыта - сохраняем время
        saveLastVisitTime();
    } else {
        // Страница снова видима - начисляем прибыль
        updateBalanceWithOfflineEarnings(calculateOfflineEarnings());
    }
});

// Добавляем стили для уведомления
const style = document.createElement('style');
style.textContent = `
    .offline-earnings-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
    }

    .notification-content {
        text-align: center;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
window.addEventListener('load', () => {
    updateBalanceWithOfflineEarnings(calculateOfflineEarnings());
    saveLastVisitTime();
});
