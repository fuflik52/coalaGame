import { supabase } from './supabase-config.js';

let currentUser = null;

// Инициализация пользователя
export async function initializeUser() {
    try {
        const tg = window.Telegram?.WebApp;
        console.log('Telegram WebApp:', tg?.initDataUnsafe);
        
        if (tg?.initDataUnsafe?.user) {
            // Если пользователь из Telegram
            const telegramUser = tg.initDataUnsafe.user;
            console.log('Telegram user:', telegramUser);
            
            currentUser = {
                id: `tg-${telegramUser.id}`,
                username: telegramUser.username || telegramUser.first_name || 'Пользователь Telegram',
                avatar: telegramUser.photo_url,
                isTelegram: true
            };
            
            // Сохраняем ID в localStorage
            localStorage.setItem('userId', currentUser.id);
            localStorage.setItem('username', currentUser.username);
        } else {
            // Проверяем сохраненный ID
            const savedUserId = localStorage.getItem('userId');
            const savedUsername = localStorage.getItem('username');
            
            if (savedUserId && savedUserId.startsWith('tg-')) {
                // Если есть сохраненный Telegram ID
                currentUser = {
                    id: savedUserId,
                    username: savedUsername || 'Пользователь Telegram',
                    avatar: null,
                    isTelegram: true
                };
            } else {
                // Создаем гостевой ID
                const guestId = `guest-${Date.now()}`;
                localStorage.setItem('userId', guestId);
                
                currentUser = {
                    id: guestId,
                    username: 'Гость',
                    avatar: null,
                    isTelegram: false
                };
            }
        }
        
        console.log('Current user:', currentUser);
        
        // Получаем или создаем данные игрока
        const playerData = await getPlayerData(currentUser.id);
        if (playerData) {
            // Обновляем баланс в localStorage
            localStorage.setItem('balance', playerData.balance.toString());
            currentUser.balance = playerData.balance;
        }
        
        return currentUser;
    } catch (error) {
        console.error('Error initializing user:', error);
        return null;
    }
}

// Получение данных игрока
export async function getPlayerData(userId) {
    try {
        console.log('Getting player data for:', userId);
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

        console.log('Player data:', data);
        return data;
    } catch (error) {
        console.error('Error getting player data:', error);
        return null;
    }
}

// Создание нового игрока
async function createNewPlayer(userId) {
    try {
        console.log('Creating new player:', userId);
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
            console.error('Error creating player:', error);
            return null;
        }

        console.log('Created player:', data);
        return data;
    } catch (error) {
        console.error('Error in createNewPlayer:', error);
        return null;
    }
}

// Обновление данных игрока
export async function updatePlayerData(userId, updates) {
    try {
        console.log('Updating player data:', userId, updates);
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
            // Обновляем баланс в localStorage
            if (updates.balance !== undefined) {
                localStorage.setItem('balance', updates.balance.toString());
            }
            console.log('Updated player data:', data[0]);
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

// Получение баланса
export function getBalance() {
    const balanceStr = localStorage.getItem('balance');
    return balanceStr ? parseInt(balanceStr) : 0;
}
