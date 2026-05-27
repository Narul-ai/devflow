const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. Генерация JWT токена
const signToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error('КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET не определен в .env');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
};

// 2. Отправка ответа с токеном (ДОБАВЛЕН POPULATE ДЛЯ СИНХРОНИЗАЦИИ ПРИ ВХОДЕ)
const createSendToken = async (user, statusCode, res) => {
    const token = signToken(user._id);

    // Перед отправкой раскрываем закладки, чтобы фронтенд сразу их увидел при логгер/регистрации
    const populatedUser = await User.findById(user._id).populate({
        path: 'bookmarks',
        select: 'title content author createdAt tags upvotes comments views'
    });

    // Скрываем конфиденциальные данные из вывода
    populatedUser.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user: populatedUser }
    });
};

// --- КОНТРОЛЛЕРЫ ---

// РЕГИСТРАЦИЯ
exports.signup = async (req, res, next) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        const newUser = await User.create({
            username,
            email,
            password,
            passwordConfirm
        });

        // Ждем выполнения асинхронного createSendToken
        await createSendToken(newUser, 201, res);
    } catch (err) {
        next(err); 
    }
};

// ВХОД
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Укажите email и пароль');
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password, user.password))) {
            const error = new Error('Неверный email или пароль');
            error.statusCode = 401;
            return next(error);
        }

        // Ждем выполнения асинхронного createSendToken
        await createSendToken(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// ПОЛУЧЕНИЕ ДАННЫХ ОБО МНЕ (ИСПРАВЛЕНО: ТЕПЕРЬ ОДАЕТ ПОЛНЫЕ ЗАКЛАДКИ ДЛЯ ПРОФИЛЯ)
exports.getMe = async (req, res, next) => {
    try {
        // req.user закидывается мидлваром protect, но мы запрашиваем его заново с .populate()
        const currentUser = await User.findById(req.user.id).populate({
            path: 'bookmarks',
            options: { sort: { createdAt: -1 } } // Свежие закладки будут сверху
        });

        res.status(200).json({
            status: 'success',
            data: { user: currentUser }
        });
    } catch (err) {
        next(err);
    }
};

// ОБНОВЛЕНИЕ ПРОФИЛЯ (ПРОКАЧАНО: ТЕПЕРЬ МОЖНО ОБНОВЛЯТЬ И BIO, SKILLS И Т.Д.)
exports.updateMe = async (req, res, next) => {
    try {
        if (req.body.password || req.body.passwordConfirm) {
            const error = new Error('Этот маршрут не для смены пароля');
            error.statusCode = 400;
            return next(error);
        }

        // Фильтруем входящие данные, чтобы юзер не мог хакнуть и выдать себе роль 'admin'
        const filteredBody = {};
        const allowedFields = ['username', 'bio', 'location', 'website', 'github', 'skills', 'avatar'];
        
        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // Обновляем пользователя разрешенными полями
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        }).populate('bookmarks'); // Тоже популейтим закладки на случай рендера

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        next(err);
    }
};