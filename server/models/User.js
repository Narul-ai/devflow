const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Укажите никнейм'],
        unique: true,
        trim: true,
        minlength: [3, 'Никнейм должен быть не короче 3 символов']
    },
    email: {
        type: String,
        required: [true, 'Укажите email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Некорректный email']
    },
    password: {
        type: String,
        required: [true, 'Придумайте пароль'],
        minlength: [8, 'Пароль должен быть не короче 8 символов'],
        select: false 
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Подтвердите пароль'],
        validate: {
            // Работает только при .save() и .create()!
            validator: function(el) { return el === this.password; },
            message: 'Пароли не совпадают'
        }
    },
    role: { 
        type: String, 
        enum: ['user', 'moderator', 'admin'], 
        default: 'user' 
    },
    reputation: { 
        type: Number, 
        default: 0 
    },
    
    // ==========================================
    // НОВЫЕ ПОЛЯ ДЛЯ КРУТОГО ПРОФИЛЯ РАЗРАБОТЧИКА
    // ==========================================
    avatar: {
        type: String,
        default: 'default-avatar.png' // Имя дефолтной картинки или URL
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [160, 'Описание профиля не должно превышать 160 символов'],
        default: 'Разработчик на DevFlow'
    },
    location: {
        type: String,
        trim: true,
        default: '' // Например: "Казахстан, Алматы"
    },
    website: {
        type: String,
        trim: true,
        default: '' // Личный сайт или портфолио
    },
    github: {
        type: String,
        trim: true,
        default: '' // Ссылка на профиль GitHub
    },
    skills: {
        type: [String],
        default: [] // Массив строк, например: ["React", "Node.js", "MongoDB"]
    },
    // Было savedPosts, меняем на bookmarks:
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post' // Ссылка на сохраненные посты
        }
    ],
    
    // ==========================================
    // СВЯЗИ ДЛЯ ФУНКЦИИ ПОДПИСОК (FOLLOWERS / FOLLOWING)
    // ==========================================
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // На кого этот юзер подписан
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Кто подписан на этого юзера
        }
    ],
    // ==========================================

    passwordChangedAt: Date,
    active: { type: Boolean, default: true, select: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Хеширование пароля перед сохранением (Обновлено: убран next(), чтобы избежать TypeError)
userSchema.pre('save', async function() {
    // 1. Если пароль не менялся — идем дальше
    if (!this.isModified('password')) return;

    // 2. Хешируем пароль
    this.password = await bcrypt.hash(this.password, 12);

    // 3. Удаляем passwordConfirm (оно не нужно в базе)
    this.passwordConfirm = undefined;

    // 4. Устанавливаем время изменения пароля для проверки старых токенов
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
});

// Метод проверки пароля
userSchema.methods.comparePassword = async function(candidate, hashed) {
    return await bcrypt.compare(candidate, hashed);
};

// Проверка: менялся ли пароль после выдачи токена
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

module.exports = mongoose.model('User', userSchema);