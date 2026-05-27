const Post = require('../models/Post');
const User = require('../models/User');

// Обертка для чистого кода без try-catch
const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// 1. ПОЛУЧЕНИЕ ВСЕХ ПОСТОВ (С УЛУЧШЕННЫМ ЖИВЫМ ПОИСКОМ, ТЕГАМИ И ПАГИНАЦИЕЙ)
exports.getAllPosts = catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'tags'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 🌟 ФИЧА: Живой поиск по совпадению подстроки в заголовке ИЛИ контенте
    if (req.query.search) {
        queryObj.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { content: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Фильтрация по тегам
    if (req.query.tags) {
        queryObj.tags = { $in: req.query.tags.split(',') };
    }

    // Показывать в общей ленте только опубликованные посты
    if (!queryObj.status) {
        queryObj.status = 'published';
    }

    const totalPosts = await Post.countDocuments(queryObj);
    let query = Post.find(queryObj);

    // Сортировка
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt'); // По умолчанию сначала новые
    }

    // Пагинация
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // ПОДГРУЗКА СВЯЗАННЫХ ДАННЫХ (POPULATE)
    query = query
        .populate({
            path: 'author',
            select: 'username avatar reputation'
        })
        .populate({
            path: 'comments',
            // 🔥 ИСПРАВЛЕНО: Теперь возвращаем контент, автора и дату, а не только _id
            select: 'content author createdAt upvotes points' 
        });

    const posts = await query;

    res.status(200).json({
        status: 'success',
        results: posts.length,
        total: totalPosts,
        data: { posts }
    });
});

// 2. ПОЛУЧЕНИЕ ЛИЧНЫХ ПОСТОВ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
exports.getMyPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find({ author: req.user.id || req.user._id }).sort('-createdAt');
    
    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: { posts }
    });
});

// 3. ПОЛУЧЕНИЕ ТРЕНДОВЫХ ПОСТОВ (ТОП-5 ПО ПРОСМОТРАМ И ЛАЙКАМ)
exports.getTrendingPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find()
        .sort('-views -upvotes')
        .limit(5)                
        .populate('author', 'username avatar reputation');

    res.status(200).json({
        status: 'success',
        data: { posts }
    });
});

// 4. СОЗДАНИЕ ПОСТА
exports.createPost = async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;
        const authorId = req.user?.id || req.user?._id;

        if (!authorId) {
            return res.status(401).json({ status: 'fail', message: 'Пользователь не авторизован.' });
        }

        const postTags = Array.isArray(tags) ? tags : ['development'];
        const postCategory = req.body.category || postTags[0] || 'development';

        const newPost = await Post.create({
            title,
            content,
            tags: postTags,
            category: postCategory.toLowerCase(),
            author: authorId
        });

        return res.status(201).json({ 
            status: 'success', 
            data: { post: newPost } 
        });

    } catch (err) {
        return res.status(500).json({ 
            status: 'error', 
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// 5. ПОЛУЧЕНИЕ ОДНОГО ПОСТА
exports.getPost = catchAsync(async (req, res, next) => {
    const post = await Post.findByIdAndUpdate(
        req.params.id, 
        { $inc: { views: 1 } }, 
        { new: true }
    ).populate('author', 'username avatar bio reputation')
     // 🔥 УЛУЧШЕНИЕ: Добавил populate для комментариев при просмотре одного поста
     .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar reputation' }
     });

    if (!post) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

    res.status(200).json({ status: 'success', data: { post } });
});

// 6. ОБНОВЛЕНИЕ
exports.updatePost = catchAsync(async (req, res, next) => {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

    const userId = req.user.id || req.user._id;
    if (post.author.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Это не ваш пост' });
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ status: 'success', data: { post: updatedPost } });
});

// 7. ЛАЙКИ И РЕПУТАЦИЯ
exports.upvotePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

    const userId = req.user.id || req.user._id;
    const isUpvoted = post.upvotes.includes(userId);

    const modifier = isUpvoted 
        ? { $pull: { upvotes: userId } } 
        : { $addToSet: { upvotes: userId }, $pull: { downvotes: userId } };

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, modifier, { new: true });
    
    if (typeof updatedPost.updatePoints === 'function') {
        await updatedPost.updatePoints();
    }

    const reputationChange = isUpvoted ? -10 : 10;
    await User.findByIdAndUpdate(post.author, { $inc: { reputation: reputationChange } });

    res.status(200).json({ 
        status: 'success', 
        points: updatedPost.points || updatedPost.upvotes.length, 
        message: isUpvoted ? 'Лайк убран' : 'Лайк поставлен' 
    });
});

// 8. ДОБАВЛЕНИЕ/УДАЛЕНИЕ ЗАКЛАДОК 
exports.toggleBookmark = catchAsync(async (req, res, next) => {
    const postId = req.params.id;
    const userId = req.user.id || req.user._id;

    const postExists = await Post.findById(postId);
    if (!postExists) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: 'fail', message: "Пользователь не найден" });

    if (!user.bookmarks) user.bookmarks = [];

    const wasBookmarked = user.bookmarks.map(id => id.toString()).includes(postId.toString());

    if (wasBookmarked) {
        user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
    } else {
        user.bookmarks.push(postId);
    }

    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(userId).populate({
        path: 'bookmarks',
        populate: { path: 'author', select: 'username avatar' } 
    });

    res.status(200).json({
        status: 'success',
        isBookmarked: !wasBookmarked,
        message: !wasBookmarked ? "Добавлено в закладки" : "Удалено из закладок",
        data: { bookmarks: updatedUser.bookmarks || [] }
    });
});

// 9. УДАЛЕНИЕ ПОСТА
exports.deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

    const userId = req.user.id || req.user._id;
    if (post.author.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ status: 'fail', message: 'Недостаточно прав' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});