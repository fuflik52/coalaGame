import { supabase } from './supabase-config.js';

let currentUser = null;

// Инициализация пользователя
export async function initializeUser() {
    const tg = window.Telegram?.WebApp;
    
    // Проверяем, есть ли сохраненный ID пользователя
    const savedUserId = localStorage.getItem('userId');
    
    if (tg?.initDataUnsafe?.user) {
        // Если пользователь из Telegram
        const telegramUser = tg.initDataUnsafe.user;
        const telegramId = `tg-${telegramUser.id}`;
        
        // Если ID изменился или его нет, обновляем
        if (savedUserId !== telegramId) {
            localStorage.setItem('userId', telegramId);
        }
        
        currentUser = {
            id: telegramId,
            username: telegramUser.username || telegramUser.first_name || 'Пользователь Telegram',
            avatar: telegramUser.photo_url,
            isTelegram: true
        };
    } else {
        // Если обычный пользователь
        if (!savedUserId || !savedUserId.startsWith('guest-')) {
            const guestId = `guest-${Date.now()}`;
            localStorage.setItem('userId', guestId);
            currentUser = {
                id: guestId,
                username: 'Гость',
                avatar: null,
                isTelegram: false
            };
        } else {
            currentUser = {
                id: savedUserId,
                username: 'Гость',
                avatar: null,
                isTelegram: false
            };
        }
    }
    
    // Получаем или создаем данные игрока
    const playerData = await getPlayerData(currentUser.id);
    if (playerData) {
        currentUser.username = playerData.username || currentUser.username;
    }
    
    return currentUser;
}

// Получение данных игрока
export async function getPlayerData(userId) {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Если игрок не найден, создаем нового
                return createNewPlayer(userId);
            }
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Ошибка при получении данных игрока:', error);
        return null;
    }
}

// Создание нового игрока
async function createNewPlayer(userId) {
    const { data, error } = await supabase
        .from('players')
        .insert([
            {
                user_id: userId,
                username: currentUser.username,
                balance: 0,
                upgrades: {},
                last_login: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Ошибка при создании игрока:', error);
        return null;
    }
    return data;
}

// Обновление данных игрока
export async function updatePlayerData(userId, updates) {
    const { data, error } = await supabase
        .from('players')
        .update({
            ...updates,
            last_login: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

    if (error) {
        console.error('Ошибка при обновлении данных игрока:', error);
        return null;
    }
    return data[0];
}

// Получение текущего пользователя
export function getCurrentUser() {
    return currentUser;
}
