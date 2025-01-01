import { supabase } from './supabase-config.js';

// Функция для входа
async function login(username, password) {
    try {
        // Получаем пользователя по имени и паролю
        const { data: users, error: userError } = await supabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        if (userError || !users) {
            throw new Error('Неверное имя пользователя или пароль');
        }

        // Проверяем пароль
        if (users.password !== password) {
            throw new Error('Неверное имя пользователя или пароль');
        }

        // Сохраняем ID пользователя в сессии
        sessionStorage.setItem('userId', users.user_id);
        sessionStorage.setItem('username', users.username);

        // Перенаправляем на главную страницу
        window.location.href = 'index.html';
    } catch (error) {
        showError(error.message);
    }
}

// Функция для регистрации
async function register(username, password) {
    try {
        // Проверяем, существует ли пользователь
        const { data: existingUser, error: checkError } = await supabase
            .from('players')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        // Создаем ID пользователя
        const userId = `user_${Date.now()}`;

        // Создаем нового пользователя
        const { data: newUser, error: createError } = await supabase
            .from('players')
            .insert({
                user_id: userId,
                username: username,
                password: password,
                balance: 0,
                upgrades: {},
                last_login: new Date().toISOString()
            });

        if (createError) {
            console.error('Registration error:', createError);
            throw new Error('Ошибка при создании пользователя');
        }

        // Если регистрация успешна, выполняем вход
        await login(username, password);
    } catch (error) {
        showError(error.message);
    }
}

// Функция для отображения ошибки
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Обработчики событий
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    await login(username, password);
});

document.getElementById('registerButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showError('Пожалуйста, заполните все поля');
        return;
    }
    
    await register(username, password);
});