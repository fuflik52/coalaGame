// Импортируем конфигурацию
// import { TELEGRAM_BOT_TOKEN } from './config.js';

// Импортируем функции для работы с данными пользователя
import { initializeUser, getCurrentUser } from './game-data.js';

// Проверяем, запущено ли приложение в Telegram
const isTelegram = window.Telegram && window.Telegram.WebApp;
const tg = isTelegram ? window.Telegram.WebApp : null;

if (isTelegram) {
    tg.expand();
}

class TelegramAuth {
    constructor() {
        this.username = '';
        this.telegramId = '';
        this.isAuthenticated = false;
        this.purchasedItems = [];
        this.balance = 0;
        this.energy = 100;
        this.hourlyRate = 10;
        this.initTelegramAuth();
    }

    async initTelegramAuth() {
        try {
            // Инициализируем пользователя
            const user = await initializeUser();
            
            // Обновляем UI
            this.updateUserInterface(user);

            if (isTelegram) {
                console.log('[Telegram.WebApp] Initialized with user:', user);
            } else {
                console.log('[Browser] Initialized with user:', user);
            }
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }

    updateUserInterface(user) {
        if (!user) return;
        
        // Обновляем имя пользователя на странице
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = user.username;
        }

        // Обновляем баланс
        const balanceElement = document.querySelector('.balance');
        if (balanceElement) {
            balanceElement.textContent = user.balance || '0';
        }

        // Обновляем аватар, если есть
        const userIcon = document.querySelector('.user-icon');
        if (userIcon) {
            userIcon.src = user.avatar || 'https://i.postimg.cc/vBBWGZjL/image.png';
        }
    }

    handleTelegramAuth(user) {
        if (user && user.id) {
            this.username = user.username || user.first_name;
            this.telegramId = user.id;
            this.isAuthenticated = true;
            
            // Загружаем сохраненные данные
            this.loadUserData();
            
            // Обновляем имя пользователя на странице
            const usernameElement = document.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = this.username;
            }
            
            console.log('[Telegram.WebApp] User authenticated:', this.username);
        }
    }

    async saveUserData() {
        if (!this.isAuthenticated) return;
        
        const userData = {
            telegramId: this.telegramId,
            username: this.username,
            balance: window.clickCount,
            purchasedCards: window.purchasedCards,
            energy: window.energy,
            lastPlayed: new Date().toISOString()
        };

        // Сохраняем данные в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Сохраняем данные в GitHub
        if (window.githubDB) {
            await window.githubDB.saveUser(userData);
        }
    }

    async loadUserData() {
        if (!this.isAuthenticated) return;

        // Пробуем загрузить данные из GitHub
        let userData = null;
        if (window.githubDB) {
            userData = await window.githubDB.getUser(this.telegramId);
        }

        // Если данных нет в GitHub, используем localStorage
        if (!userData) {
            const savedData = localStorage.getItem('userData');
            if (savedData) {
                userData = JSON.parse(savedData);
            }
        }

        if (userData) {
            window.clickCount = userData.balance || 0;
            window.purchasedCards = userData.purchasedCards || [];
            window.energy = userData.energy || 100;
            
            // Обновляем интерфейс
            const balanceElement = document.querySelector('.balance');
            if (balanceElement) {
                balanceElement.textContent = Math.floor(window.clickCount);
            }
            
            // Обновляем энергию
            // updateEnergy();
            
            // Обновляем список купленных карт
            // updatePurchasedCards();
        }
    }

    addPurchasedItem(item) {
        if (!this.isAuthenticated) return;
        
        // Проверяем, нет ли уже такой карточки
        if (!this.purchasedItems.some(card => card.id === item.id)) {
            this.purchasedItems.push(item);
            window.purchasedCards = this.purchasedItems;
            this.saveUserData();
            console.log('[Telegram.WebApp] Item purchased:', item);
        }
    }

    saveBalance(balance) {
        this.balance = Number(balance);
        window.clickCount = this.balance; // Сохраняем в глобальную переменную
        this.saveUserData();
    }

    saveEnergy(energy) {
        this.energy = energy;
        this.saveUserData();
    }

    getTimeAwayEarnings() {
        const currentTime = Date.now();
        const timeAway = (currentTime - this.lastCollectTime) / 1000; // в секундах
        const hourlyRate = window.totalHourlyRate || 0;
        const earnings = (hourlyRate / 3600) * timeAway;
        return earnings;
    }

    // Проверяем, был ли пользователь уже авторизован
    checkExistingAuth() {
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('username');
        return !!(userId && username);
    }

    // Выход из аккаунта
    logout() {
        this.username = '';
        this.telegramId = '';
        this.isAuthenticated = false;
        this.purchasedItems = [];
        this.balance = 0;
        this.energy = 100;
        localStorage.removeItem('userData');
        
        const usernameElement = document.querySelector('.username');
        if (usernameElement) {
            usernameElement.textContent = 'Guest';
        }
    }
}

// Создаем и экспортируем экземпляр класса
window.telegramAuth = new TelegramAuth();

// Функция для вибрации на мобильных устройствах
function vibrate(duration = 20) {
    if (isTelegram) {
        tg.HapticFeedback.impactOccurred('light');
    } else if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

// Добавляем вибрацию на все кликабельные элементы
document.addEventListener('DOMContentLoaded', async () => {
    const isAuth = window.telegramAuth.checkExistingAuth();
    if (!isAuth) return;

    document.querySelectorAll('button, .nav-item, .clickable').forEach(element => {
        element.addEventListener('click', () => vibrate());
    });
});
