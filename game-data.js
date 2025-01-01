import { supabase } from './supabase-config.js';

// Получение данных игрока
export async function getPlayerData(userId) {
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
}

// Создание нового игрока
async function createNewPlayer(userId) {
    const { data, error } = await supabase
        .from('players')
        .insert([
            {
                user_id: userId,
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

// Получение списка всех игроков (для таблицы лидеров)
export async function getLeaderboard() {
    const { data, error } = await supabase
        .from('players')
        .select('user_id, balance')
        .order('balance', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
}
