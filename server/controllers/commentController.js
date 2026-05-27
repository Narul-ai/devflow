const Comment = require('../models/Comment');
const User = require('../models/User');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// 1. ПОЛУЧИТЬ ВСЕ КОММЕНТАРИИ К ПОСТУ
// 1. ПОЛУЧИТЬ ВСЕ КОММЕНТАРИИ К ПОСТУ
exports.getAllComments = catchAsync(async (req, res, next) => {
    let filter = {};
    
    // ВЫВЕДИ В КОНСОЛЬ, ЧТОБЫ УВИДЕТЬ, ЧТО СЮДА ПРИЛЕТАЕТ ПРИ ОБНОВЛЕНИИ СТРАНИЦЫ
    console.log('=== ОТЛАДКА GET_COMMENTS ===');
    console.log('req.params:', req.params);
    
    const postId = req.params.postId || req.params.id;
    console.log('Вычисленный postId:', postId);
    console.log('============================');

    if (postId) {
        filter = { post: postId, parentComment: null };
    } else {
        // Если postId вообще не передали, возвращаем ошибку, чтобы фронт не вис на пустом месте
        return res.status(400).json({ 
            status: 'fail', 
            message: 'Для получения комментариев необходимо указать ID поста' 
        });
    }

    const comments = await Comment.find(filter)
        .populate('author', 'username avatar')
        .populate('repliesCount')
        .sort('-isPinned -createdAt');

    res.status(200).json({ status: 'success', results: comments.length, data: { comments } });
});

// 2. СОЗДАТЬ КОММЕНТАРИЙ
exports.createComment = catchAsync(async (req, res, next) => {
    if (!req.body.post) req.body.post = req.params.postId;
    req.body.author = req.user.id;

    const newComment = await Comment.create(req.body);
    await User.findByIdAndUpdate(req.user.id, { $inc: { reputation: 2 } });

    // Автоматически подтягиваем автора благодаря pre-хуку в модели
    const populatedComment = await Comment.findById(newComment._id);

    res.status(201).json({ status: 'success', data: { comment: populatedComment } });
});

// 3. ОБНОВИТЬ КОММЕНТАРИЙ
exports.updateComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ status: 'fail', message: 'Не найден' });

    // Проверка прав: автор комментария или админ
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Нет прав' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, 
        { content: req.body.content, isEdited: true }, 
        { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.status(200).json({ status: 'success', data: { comment: updatedComment } });
});

// 4. ЛАЙКНУТЬ КОММЕНТАРИЙ (UPVOTE)
exports.upvoteComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ status: 'fail', message: 'Не найден' });

    const isUpvoted = comment.upvotes.includes(req.user.id);
    const modifier = isUpvoted 
        ? { $pull: { upvotes: req.user.id } } 
        : { $addToSet: { upvotes: req.user.id }, $pull: { downvotes: req.user.id } };

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, modifier, { new: true });
    await updatedComment.updatePoints();
    await User.findByIdAndUpdate(comment.author, { $inc: { reputation: isUpvoted ? -3 : 3 } });

    res.status(200).json({ status: 'success', points: updatedComment.points });
});

// 5. УДАЛИТЬ КОММЕНТАРИЙ (Автор + Админ)
exports.deleteComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ status: 'fail', message: 'Не найден' });

    // Проверка прав: удалить может только автор или админ
console.log("=== ОТЛАДКА УДАЛЕНИЯ КОММЕНТАРИЯ ===");
console.log("Тип автора в базе:", typeof comment.author, comment.author);
console.log("ID юзера из токена:", typeof req.user.id, req.user.id);
console.log("Роль юзера:", req.user.role);
console.log("====================================");

    // Проверка прав: удалить может только автор или админ
   // Проверка прав: удалить может только автор или админ
// Добавляем ._id перед toString()
if (comment.author._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'fail', message: 'Нет прав' });
}
    // Проверка прав: удалить может только автор или админ
// Добавляем ._id перед toString()
// Универсальный вариант: проверяет и объект, и обычную строку
const authorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();

if (authorId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ status: 'fail', message: 'Нет прав' });
}

    await Comment.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ status: 'success', message: 'Комментарий успешно удален' });
});