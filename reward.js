import { getPlayerData, updatePlayerData, getCurrentUser } from './game-data.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Получаем текущего пользователя
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Загружаем данные игрока
    let playerData = await getPlayerData(currentUser.id);
    if (!playerData) {
        window.location.href = 'login.html';
        return;
    }
    
    // Данные для reward items
    const rewardItems = [
        {
            title: 'Разработчики',
            points: 1000,
            image: 'https://i.postimg.cc/HnSVzqGF/image.png',
            isDone: playerData.balance >= 1000
        },
        {
            title: 'Разработчики',
            points: 1000,
            image: 'https://i.postimg.cc/HnSVzqGF/image.png',
            isDone: playerData.balance >= 1000
        }
    ];

    function createRewardItem(item) {
        return `
            <div class="reward-item flex items-center justify-between bg-[#1A1B1A] rounded-xl p-4 cursor-pointer" data-points="${item.points}">
                <div class="flex items-center gap-3">
                    <div class="w-[45px] h-[45px] bg-[#262626] rounded-md">
                        <img src="${item.image}" alt="task" class="w-full h-full object-cover p-1 rounded-lg">
                    </div>
                    <div class="flex flex-col">
                        <span class="text-white">${item.title}</span>
                        <div class="flex items-center gap-1">
                            <img src="https://res.cloudinary.com/dib4woqge/image/upload/v1735053105/leaf_card_vrqmze.png" alt="leaf" class="w-[12px] h-[17px]">
                            <span class="text-white">${item.points}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button class="px-6 py-2 rounded-full bg-white/10 text-white ${item.isDone ? 'completed' : ''}" ${item.isDone ? 'disabled' : ''}>
                        <div class="flex items-center gap-2">
                            ${item.isDone ? 'Completed' : 'Claim'}
                            ${item.isDone ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
                        </div>
                    </button>
                    <img src="https://res.cloudinary.com/dib4woqge/image/upload/v1735053105/right_arrow_vrqmze.png" alt="arrow" class="w-[8px] h-[14px] opacity-40">
                </div>
            </div>
        `;
    }

    // Инициализация reward секции
    function initRewardSection() {
        const rewardSection = document.querySelector('.reward-section');
        if (!rewardSection) return;

        // Обновляем отображение баланса
        const balanceElement = document.querySelector('.balance');
        if (balanceElement) {
            balanceElement.textContent = playerData.balance;
        }

        // Очищаем текущее содержимое
        const rewardList = rewardSection.querySelector('.space-y-3');
        if (rewardList) {
            rewardList.innerHTML = rewardItems.map(item => createRewardItem(item)).join('');
            
            // Добавляем обработчики для reward items
            const items = rewardList.querySelectorAll('.reward-item');
            items.forEach(item => {
                const button = item.querySelector('button');
                if (button && !button.disabled) {
                    item.addEventListener('click', async () => {
                        const points = parseInt(item.dataset.points);
                        if (!isNaN(points)) {
                            await updateBalance(points);
                        }
                    });
                }
            });
        }
    }

    // Добавляем обработчик для обновления баланса
    async function updateBalance(points) {
        const newBalance = playerData.balance + points;
        
        // Обновляем данные в базе
        const updatedData = await updatePlayerData(currentUser.id, {
            balance: newBalance
        });

        if (updatedData) {
            playerData = updatedData;
            // Обновляем отображение
            initRewardSection();
        }
    }

    // Вызываем инициализацию при загрузке страницы
    initRewardSection();

    // Добавляем обработчик для кнопки reward в навигации
    const rewardNavItem = document.querySelector('.nav-item[data-section="reward"]');
    if (rewardNavItem) {
        rewardNavItem.addEventListener('click', () => {
            initRewardSection();
        });
    }

    // Добавляем кнопку выхода
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Выйти';
    logoutButton.className = 'logout-button';
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        window.location.href = 'login.html';
    });
    document.body.appendChild(logoutButton);
});
