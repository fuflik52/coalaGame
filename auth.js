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

        // Перенаправляем на страницу загрузки
        window.location.href = 'loading.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
        throw error; // Прокидываем ошибку дальше
    }
}

// Функция для регистрации
async function register(username, password) {
    try {
        if (!username || !password) {
            throw new Error('Пожалуйста, заполните все поля');
        }

        if (username.length < 3) {
            throw new Error('Имя пользователя должно содержать минимум 3 символа');
        }

        if (password.length < 4) {
            throw new Error('Пароль должен содержать минимум 4 символа');
        }

        // Проверяем, существует ли пользователь
        const { data: existingUser } = await supabase
            .from('players')
            .select('username')
            .eq('username', username)
            .maybeSingle();

        if (existingUser) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        // Создаем нового пользователя
        const newUser = {
            user_id: `user_${Date.now()}`,
            username: username,
            password: password,
            balance: 0,
            upgrades: {}
        };

        const { error: createError } = await supabase
            .from('players')
            .insert([newUser]);

        if (createError) {
            console.error('Registration error:', createError);
            throw new Error('Ошибка при создании пользователя');
        }

        // Выполняем вход с новыми данными
        await login(username, password);
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
        throw error; // Прокидываем ошибку дальше
    }
}

// Функция для отображения ошибки
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Обработчики событий
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
        await login(username, password);
    } catch (error) {
        // Ошибка уже обработана в функции login
        console.error('Login form error:', error);
    }
});

document.getElementById('registerButton').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
        await register(username, password);
    } catch (error) {
        // Ошибка уже обработана в функции register
        console.error('Register button error:', error);
    }
});
