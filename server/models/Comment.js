const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // --- ТЕКСТОВОЕ СОДЕРЖИМОЕ ---
    content: {
        type: String,
        required: [true, 'Комментарий не может быть пустым'],
        trim: true,
        minlength: [1, 'Комментарий слишком короткий'],
        maxlength: [2000, 'Комментарий не может превышать 2000 символов']
    },

    // --- СВЯЗИ (RELATIONS) ---
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Комментарий должен быть привязан к посту']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'У комментария должен быть автор']
    },

    // --- ВЛОЖЕННОСТЬ (ОТВЕТЫ НА КОММЕНТАРИИ) ---
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null // Если это ответ, здесь будет ID родительского коммента
    },

    // --- РЕЙТИНГ И РЕАКЦИИ ---
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    points: {
        type: Number,
        default: 0
    },

    // --- СОСТОЯНИЕ ---
    isEdited: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false // Автор поста может закрепить лучший ответ
    },
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true, // Автоматически создает createdAt и updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ ---
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

// --- ВИРТУАЛЬНЫЕ ПОЛЯ ---

// 1. Получение самих ответов (replies)
commentSchema.virtual('replies', {
    ref: 'Comment',
    foreignField: 'parentComment',
    localField: '_id'
});

// 2. Получение КОЛИЧЕСТВА ответов
commentSchema.virtual('repliesCount', {
    ref: 'Comment',
    foreignField: 'parentComment',
    localField: '_id',
    count: true
});

// --- МЕТОДЫ ЭКЗЕМПЛЯРА ---
commentSchema.methods.updatePoints = function() {
    this.points = this.upvotes.length - this.downvotes.length;
    return this.save();
};

// --- МИДЛВАРЫ (MIDDLEWARE) ---

// 1. Авто-популяция автора при поиске 
commentSchema.pre(/^find/, function() {
    this.populate({
        path: 'author',
        select: 'username avatar reputation'
    });
});

// 2. Каскадное удаление ответов при удалении родительского комментария
commentSchema.pre('deleteOne', { document: true, query: false }, async function() {
    await this.model('Comment').deleteMany({ parentComment: this._id });
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;