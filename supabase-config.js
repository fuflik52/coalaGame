import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.1/+esm'

const supabaseUrl = 'https://qfjtxccskmzuijxflloi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmanR4Y2Nza216dWlqeGZsbG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3Mjc2NzUsImV4cCI6MjA1MTMwMzY3NX0.UH_LbQq2iPFGpsj7KU6y8ogkrYztINS1ugitWaUHVG0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }
})
