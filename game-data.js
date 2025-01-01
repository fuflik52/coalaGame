import { supabase } from './supabase-config.js';

let currentUser = null;

// Проверка авторизации
async function checkAuth() {
    const userId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');

    if (!userId || !username) {
        window.location.href = 'login.html';
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
            sessionStorage.clear();
            window.location.href = 'login.html';
            return false;
        }

        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        sessionStorage.clear();
        window.location.href = 'login.html';
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
            sessionStorage.clear();
            window.location.href = 'login.html';
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
            sessionStorage.clear();
            window.location.href = 'login.html';
            return null;
        }

        // Обновляем время последнего входа
        await supabase
            .from('players')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', userId);

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
        sessionStorage.clear();
        window.location.href = 'login.html';
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
