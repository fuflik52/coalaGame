import { supabase } from './supabase-config.js';

// Функция для входа
async function login(username, password) {
    try {
        // Получаем пользователя по имени
        const { data: user, error } = await supabase
            .from('players')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Login error:', error);
            throw new Error('Неверное имя пользователя или пароль');
        }

        if (!user || user.password !== password) {
            throw new Error('Неверное имя пользователя или пароль');
        }

        // Сохраняем данные пользователя в сессии
        sessionStorage.setItem('userId', user.user_id);
        sessionStorage.setItem('username', user.username);

        // Обновляем время последнего входа
        await supabase
            .from('players')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', user.user_id);

        // Перенаправляем на главную страницу
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
}

// Функция для регистрации
async function register(username, password) {
    if (!username || !password) {
        showError('Пожалуйста, заполните все поля');
        return;
    }

    if (username.length < 3) {
        showError('Имя пользователя должно содержать минимум 3 символа');
        return;
    }

    if (password.length < 4) {
        showError('Пароль должен содержать минимум 4 символа');
        return;
    }

    try {
        // Проверяем, существует ли пользователь
        const { data: existingUser } = await supabase
            .from('players')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        // Создаем нового пользователя
        const { error: createError } = await supabase
            .from('players')
            .insert([{
                user_id: `user_${Date.now()}`,
                username: username,
                password: password,
                balance: 0,
                upgrades: {}
            }]);

        if (createError) {
            console.error('Registration error:', createError);
            throw new Error('Ошибка при создании пользователя');
        }

        // Выполняем вход
        await login(username, password);
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

// Функция для отображения ошибки
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Обработчики событий
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    await login(username, password);
});

document.getElementById('registerButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    await register(username, password);
});
