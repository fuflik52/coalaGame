import { supabase } from './supabase-config.js';

// Функция для входа
async function login(username, password) {
    try {
        if (!username || !password) {
            throw new Error('Пожалуйста, заполните все поля');
        }

        // Получаем пользователя по имени
        const { data: users, error } = await supabase
            .from('players')
            .select('*')
            .eq('username', username);

        if (error) {
            console.error('Login error:', error);
            if (error.message.includes('network') || error.message.includes('connection')) {
                throw new Error('Ошибка подключения к серверу. Пожалуйста, проверьте интернет-соединение');
            }
            throw new Error('Ошибка при входе в систему');
        }

        const user = users && users.length > 0 ? users[0] : null;

        if (!user || user.password !== password) {
            throw new Error('Неверное имя пользователя или пароль');
        }

        // Сохраняем данные пользователя в сессии
        sessionStorage.setItem('userId', user.user_id);
        sessionStorage.setItem('username', user.username);

        try {
            // Обновляем время последнего входа
            await supabase
                .from('players')
                .update({ last_login: new Date().toISOString() })
                .eq('user_id', user.user_id);
        } catch (updateError) {
            console.warn('Failed to update last login time:', updateError);
            // Продолжаем работу даже если не удалось обновить время
        }

        // Перенаправляем на страницу загрузки
        window.location.href = 'loading.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
        throw error;
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
        const { data: existingUsers, error: checkError } = await supabase
            .from('players')
            .select('username')
            .eq('username', username);

        if (checkError) {
            if (checkError.message.includes('network') || checkError.message.includes('connection')) {
                throw new Error('Ошибка подключения к серверу. Пожалуйста, проверьте интернет-соединение');
            }
            throw new Error('Ошибка при проверке пользователя');
        }

        if (existingUsers && existingUsers.length > 0) {
            throw new Error('Пользователь с таким именем уже существует');
        }

        // Создаем нового пользователя
        const newUser = {
            user_id: `user_${Date.now()}`,
            username: username,
            password: password,
            balance: 0,
            upgrades: {},
            last_login: new Date().toISOString()
        };

        const { error: createError } = await supabase
            .from('players')
            .insert([newUser]);

        if (createError) {
            console.error('Registration error:', createError);
            if (createError.message.includes('network') || createError.message.includes('connection')) {
                throw new Error('Ошибка подключения к серверу. Пожалуйста, проверьте интернет-соединение');
            }
            throw new Error('Ошибка при создании пользователя');
        }

        // Сохраняем данные пользователя в сессии
        sessionStorage.setItem('userId', newUser.user_id);
        sessionStorage.setItem('username', newUser.username);

        // Перенаправляем на страницу загрузки
        window.location.href = 'loading.html';
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
        throw error;
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
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            try {
                await login(username, password);
            } catch (error) {
                // Ошибка уже обработана в login()
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            try {
                await register(username, password);
            } catch (error) {
                // Ошибка уже обработана в register()
            }
        });
    }
});
