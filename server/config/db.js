const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Подключаемся к локальной базе 127.0.0.1 (твоя новая настройка)
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4, // Принудительный IPv4 для стабильности на Windows 11
        });

        console.log('✅ MongoDB подключена успешно');
        // Выводит хост, к которому реально подключились (должен быть 127.0.0.1)
        console.log(`💻 Хост базы данных: ${conn.connection.host}`);
        
    } catch (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
        // Выход из процесса с ошибкой, если база не зацепилась
        process.exit(1);
    }
};

module.exports = connectDB;