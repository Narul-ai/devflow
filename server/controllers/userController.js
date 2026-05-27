const User = require('../models/User');
const Post = require('../models/Post');

// --- 1. ПОЛУЧЕНИЕ ДАННЫХ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ (ME) ---
exports.getMe = async (req, res) => {
    // req.user берется из protect middleware
    res.status(200).json({
        status: 'success',
        data: { user: req.user }
    });
};

// --- 2. ОБНОВЛЕНИЕ СВОИХ ДАННЫХ ---
exports.updateMe = async (req, res) => {
    try {
        // Запрещаем менять пароль через этот роут
        if (req.body.password || req.body.passwordConfirm) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Этот роут не для смены пароля. Используйте /updateMyPassword' 
            });
        }

        // Расширили список разрешенных полей, добавив github и skills
        const allowedFields = ['username', 'email', 'avatar', 'bio', 'location', 'website', 'github', 'skills'];
        const filteredBody = {};
        
        Object.keys(req.body).forEach(el => {
            if (allowedFields.includes(el)) filteredBody[el] = req.body[el];
        });

        // Умная обработка массива навыков (skills)
        if (req.body.skills) {
            if (typeof req.body.skills === 'string') {
                // Если пришла строка "React, Node, MongoDB", превращаем в массив
                filteredBody.skills = req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(req.body.skills)) {
                // Если уже пришел массив, просто чистим пробелы
                filteredBody.skills = req.body.skills.map(s => String(s).trim()).filter(Boolean);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message || 'Ошибка при обновлении профиля' });
    }
};

// --- 3. ПОЛУЧЕНИЕ ПУБЛИЧНОГО ПРОФИЛЯ (БЕЗОПАСНАЯ ВЕРСИЯ БЕЗ КРАША POPULATE) ---
exports.getUserProfile = async (req, res) => {
    try {
        // Убрали принудительный populate, чтобы mongoose не ругался на strictPopulate
        const user = await User.findOne({ username: req.params.username })
            .select('-password -active');

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'Пользователь не найден в базе данных' });
        }

        // Последние 10 постов для отображения в профиле
        const posts = await Post.find({ author: user._id }).sort('-createdAt').limit(10);
        
        // Честный подсчет общего количества постов в базе данных
        const totalPostsCount = await Post.countDocuments({ author: user._id });

        res.status(200).json({
            status: 'success',
            data: {
                user,
                posts,
                stats: {
                    totalPosts: totalPostsCount,
                    followersCount: user.followers ? user.followers.length : 0,
                    followingCount: user.following ? user.following.length : 0,
                    reputation: user.reputation || 0
                }
            }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message || 'Не удалось загрузить профиль пользователя' });
    }
};

// --- 4. СИСТЕМА ПОДПИСОК ---
exports.followUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ status: 'fail', message: 'Нельзя подписаться на себя' });
        }

        const userToFollow = await User.findById(req.params.id);
        if (!userToFollow) return res.status(404).json({ status: 'fail', message: 'Пользователь не найден' });

        const isFollowing = userToFollow.followers?.includes(req.user.id) || false;

        if (isFollowing) {
            await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id }, $inc: { reputation: -1 } });
            await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
        } else {
            await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user.id }, $inc: { reputation: 2 } });
            await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: req.params.id } });
        }

        res.status(200).json({ 
            status: 'success', 
            message: isFollowing ? 'Вы отписались' : 'Вы подписались' 
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message || 'Ошибка обработки подписки' });
    }
};

// --- 5. ЛИДЕРБОРД ---
exports.getLeaderboard = async (req, res) => {
    try {
        const users = await User.find()
            .sort('-reputation')
            .limit(20)
            .select('username avatar reputation bio skills');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message || 'Ошибка загрузки лидерборда' });
    }
};

// --- 6. ДОБАВЛЕНИЕ / УДАЛЕНИЕ ИЗ ЗАКЛАДОК (TOGGLE SAVE POST) ---
exports.toggleSavePost = async (req, res) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ status: 'fail', message: 'Пост не найден' });

        const currentUser = await User.findById(req.user.id);
        
        // СИНХРОНИЗИРОВАНО: изменено с savedPosts на bookmarks, в соответствии с вашей моделью User.js
        const isSaved = currentUser.bookmarks?.includes(postId) || false;

        if (isSaved) {
            await User.findByIdAndUpdate(req.user.id, { $pull: { bookmarks: postId } });
        } else {
            await User.findByIdAndUpdate(req.user.id, { $addToSet: { bookmarks: postId } });
        }

        res.status(200).json({
            status: 'success',
            message: isSaved ? 'Пост удален из закладок' : 'Пост добавлен в закладки'
        });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message || 'Ошибка при изменении закладок' });
    }
};