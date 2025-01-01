import { supabase } from './supabase-config.js';

let currentUser = null;

// Проверка авторизации
async function checkAuth() {
    return true; // Всегда возвращаем true
}

// Инициализация пользователя
export async function initializeUser() {
    try {
        // Получаем ID пользователя из сессии
        const userId = sessionStorage.getItem('userId');
        const username = sessionStorage.getItem('username');

        if (!userId || !username) {
            console.error('No user session found');
            return null;
        }

        // Получаем данные пользователя из базы данных
        const { data: userData, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching user data:', error);
            return null;
        }

        currentUser = userData;
        return userData;
    } catch (error) {
        console.error('Error initializing user:', error);
        return null;
    }
}

// Получение данных игрока
export async function getPlayerData(userId) {
    try {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error getting player data:', error);
        return null;
    }
}

// Обновление данных игрока
export async function updatePlayerData(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('players')
            .update(updates)
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating player data:', error);
        return null;
    }
}

// Получение текущего пользователя
export function getCurrentUser() {
    return currentUser;
}
