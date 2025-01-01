import { supabase } from './supabase-config.js'

export class PlayerDB {
    static async createPlayer(userId) {
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
        
        if (error) throw error
        return data[0]
    }

    static async getPlayer(userId) {
        const { data, error } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', userId)
            .single()
        
        if (error) {
            if (error.code === 'PGRST116') {
                return await this.createPlayer(userId)
            }
            throw error
        }
        return data
    }

    static async updateBalance(userId, newBalance) {
        const { data, error } = await supabase
            .from('players')
            .update({ balance: newBalance })
            .eq('user_id', userId)
            .select()
        
        if (error) throw error
        return data[0]
    }

    static async updateUpgrades(userId, upgrades) {
        const { data, error } = await supabase
            .from('players')
            .update({ upgrades: upgrades })
            .eq('user_id', userId)
            .select()
        
        if (error) throw error
        return data[0]
    }
}
