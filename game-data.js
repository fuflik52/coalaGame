import { supabase } from './supabase-config.js';

let currentUser = null;

// Проверка авторизации
async function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');

    if (!userId || !username) {
        console.error('No user session found');
        return false;
    }

    try {
        const { data: userData, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !userData) {
            console.error('Auth check error:', error);
            if (error && (error.message.includes('network') || error.message.includes('connection'))) {
                throw new Error('Network error');
            }
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        if (error.message === 'Network error') {
            throw error;
        }
        return false;
    }
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

        // Получаем данные пользователя
        const { data: userData, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !userData) {
            console.error('Error getting user data:', error);
            // Проверяем, является ли ошибка сетевой
            if (error && (error.message.includes('network') || error.message.includes('connection'))) {
                throw new Error('Network error');
            }
            return null;
        }

        // Пробуем обновить время последнего входа
        try {
            await supabase
                .from('players')
                .update({ last_login: new Date().toISOString() })
                .eq('user_id', userId);
        } catch (updateError) {
            console.warn('Failed to update last login time:', updateError);
            // Продолжаем работу даже если не удалось обновить время
        }

        currentUser = {
            id: userData.user_id,
            username: userData.username,
            balance: userData.balance,
            upgrades: userData.upgrades || {}
        };

        // Отмечаем, что игра загружена
        if (!sessionStorage.getItem('gameLoaded')) {
            sessionStorage.setItem('gameLoaded', 'true');
        }

        return currentUser;
    } catch (error) {
        console.error('Error initializing user:', error);
        if (error.message === 'Network error') {
            throw error; // Пробрасываем ошибку сети выше
        }
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

        if (error) {
            console.error('Error getting player data:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getPlayerData:', error);
        return null;
    }
}

// Обновление данных игрока
export async function updatePlayerData(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('players')
            .update({
                ...updates,
                last_login: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();

        if (error) {
            console.error('Error updating player data:', error);
            return null;
        }

        if (data && data[0]) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Error in updatePlayerData:', error);
        return null;
    }
}

// Получение текущего пользователя
export function getCurrentUser() {
    return currentUser;
}

// Выход из системы
export function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}
