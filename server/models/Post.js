const mongoose = require('mongoose');
const slugify = require('slugify');

// 1. ОПРЕДЕЛЯЕМ СХЕМУ
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'У поста должен быть заголовок'],
        trim: true,
        minlength: [10, 'Заголовок слишком короткий (минимум 10 символов)'],
        maxlength: [150, 'Заголовок не может превышать 150 символов']
    },
    slug: String,
    content: {
        type: String,
        required: [true, 'Контент поста не может быть пустым'],
        minlength: [20, 'Напишите чуть подробнее (минимум 20 символов)']
    },
    excerpt: {
        type: String,
        maxlength: [300, 'Краткое описание не может превышать 300 символов']
    },
    tags: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Добавьте хотя бы один тег'
        }
    },
    category: {
        type: String,
        enum: [
            'development', 
            'security',      // 🚀 Добавлено
            'architecture', 
            'javascript', 
            'database', 
            'design', 
            'backend', 
            'frontend', 
            'devops', 
            'python',        // 🚀 Добавлено
            'networking',    // 🚀 Добавлено
            'ai_ml',         // 🚀 Добавлено
            'marketing',     // Оставил на всякий случай из старой схемы
            'other'
        ],
        lowercase: true,
        default: 'development'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'У поста должен быть автор']
    },
    views: { type: Number, default: 0 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    points: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    isClosed: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    readingTime: Number, 
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

// 2. ИНДЕКСЫ
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ slug: 1 });

// 3. ВИРТУАЛЬНЫЕ ПОЛЯ ДЛЯ КОММЕНТАРИЕВ
postSchema.virtual('commentsCount', {
    ref: 'Comment',       
    foreignField: 'post', 
    localField: '_id',    
    count: true           
});

postSchema.virtual('comments', {
    ref: 'Comment',       
    foreignField: 'post', 
    localField: '_id'     
});

// 4. ОБЪЕДИНЕННЫЙ ХУК ПЕРЕД СОХРАНЕНИЕМ (PRE-SAVE)
// 🔥 ИСПРАВЛЕНО: Добавлен аргумент next и его вызов в конце. 
// Без этого сервер мог "зависать" при создании поста.
postSchema.pre('save', async function() {
    // 1. Генерируем slug
    if (this.isModified('title') && typeof slugify !== 'undefined') {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }

    // 2. Считаем время чтения
    if (this.content) {
        const wordsPerMinute = 200;
        const noOfWords = this.content.split(/\s+/g).length;
        this.readingTime = Math.ceil(noOfWords / wordsPerMinute);
    }

    // 3. Создаем превью текста
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 250).replace(/[#*]/g, '') + '...';
    }

    // ✅ Никаких next()! Так как хук теперь асинхронный (async), 
    // Mongoose автоматически поймет, что код успешно выполнился, 
    // как только функция дойдет до этой фигурной скобки.
});

// 5. МЕТОДЫ СХЕМЫ
postSchema.methods.updatePoints = function() {
    this.points = this.upvotes.length - this.downvotes.length;
    return this.save();
};

// 6. ЭКСПОРТ МОДЕЛИ
const Post = mongoose.model('Post', postSchema);
module.exports = Post;