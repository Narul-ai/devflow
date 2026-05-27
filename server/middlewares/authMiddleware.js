const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Обертка для асинхронных функций, чтобы забыть про try-catch
const catchAsync = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // 1. Поиск токена
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ status: 'fail', message: 'Вы не вошли в систему' });
    }

    // 2. Верификация
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Проверка существования юзера
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return res.status(401).json({ status: 'fail', message: 'Пользователь удален' });
    }

    // 4. Проверка смены пароля
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({ status: 'fail', message: 'Пароль был изменен. Войдите снова' });
    }

    // Успех: сохраняем юзера в запрос
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: 'fail', message: 'Нет доступа' });
        }
        next();
    };
};