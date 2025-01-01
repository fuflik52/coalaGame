import { supabase } from './supabase-config.js';

let currentUser = null;

// Инициализация пользователя
export async function initializeUser() {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
        // Если пользователь из Telegram
        const telegramUser = tg.initDataUnsafe.user;
        currentUser = {
            id: `tg-${telegramUser.id}`,
            username: telegramUser.username || telegramUser.first_name || 'Гость',
            avatar: telegramUser.photo_url
        };
    } else {
        // Если обычный пользователь
        const guestId = localStorage.getItem('guestId') || `guest-${Date.now()}`;
        localStorage.setItem('guestId', guestId);
        currentUser = {
            id: guestId,
            username: 'Гость',
            avatar: null
        };
    }
    
    // Получаем или создаем данные игрока
    await getPlayerData(currentUser.id);
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
                username: currentUser?.username || 'Гость',
                balance: 0,
                upgrades: {},
                last_login: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (error) throw error;
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

    if (error) throw error;
    return data[0];
}

// Получение текущего пользователя
export function getCurrentUser() {
    return currentUser;
}
