// Функции для работы с базой данных
async function savePlayerData(userId, data) {
    try {
        const response = await fetch('http://localhost:3000/api/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                username: data.username || 'Player',
                balance: data.balance || 0,
                upgrades: data.upgrades || {}
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving player data:', error);
    }
}

async function getPlayerData(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/player/${userId}`);
        if (response.status === 404) {
            // Если игрок не найден, создаем нового
            return savePlayerData(userId, {
                username: 'Player',
                balance: 0,
                upgrades: {}
            });
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting player data:', error);
        return null;
    }
}

async function updatePlayerData(userId, data) {
    try {
        const response = await fetch(`http://localhost:3000/api/player/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating player data:', error);
    }
}
