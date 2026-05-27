const express = require('express');
const dotenv = require('dotenv');

// 1. ИНИЦИАЛИЗАЦИЯ НАСТРОЕК (СТРОГО НА ВЕРШИНЕ)
dotenv.config(); 
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Внешние библиотеки
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Импорт внутренних модулей (теперь они увидят и .env, и настройки DNS)
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes'); 
const userRoutes = require('./routes/userRoutes');

const app = express();

// Подключаемся к базе (теперь MONGO_URI точно считан)
connectDB();

// Дальше весь твой код без изменений...

// 2. MIDDLEWARES
app.use(helmet()); 
app.use(cors()); // CORS вызываем один раз вверху

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Ограничение запросов
const limiter = rateLimit({
    max: 500,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests, try again later.'
});
app.use('/api', limiter);

// Парсинг данных
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Статика
app.use(express.static('public'));

// 3. МАРШРУТЫ
app.get('/', (req, res) => {
    res.status(200).json({ status: 'success', message: '🚀 DevFlow API Online' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/users', userRoutes);

/**
 * СВЯЗКА ДЛЯ REST API КОММЕНТАРИЕВ
 * Перенаправляет путь /api/v1/posts/:postId/comments в commentRoutes.
 * Благодаря { mergeParams: true } в commentRoutes.js, контроллер увидит :postId
 */
app.use('/api/v1/posts/:postId/comments', commentRoutes);

// Оставляем плоский путь (на случай удаления/апдейта конкретного коммента по его собственному ID)
app.use('/api/v1/comments', commentRoutes);


// 4. ОБРАБОТКА ОШИБОК
app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Путь ${req.originalUrl} не найден`
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: err.status || 'error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 5. ЗАПУСК
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер летит на порту ${PORT}`);
});