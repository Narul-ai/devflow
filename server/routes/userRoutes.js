const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================
router.post('/signup', authController.signup || ((req, res) => res.send('Signup еще не готов')));
router.post('/login', authController.login || ((req, res) => res.send('Login еще не готов')));

router.get('/leaderboard', userController.getLeaderboard);

// Свободный доступ к профилям (теперь не упадет, если токен не передался)
router.get('/profile/:username', userController.getUserProfile); 
router.get('/:username', userController.getUserProfile);         

// ==================== ЗАЩИЩЕННЫЕ РОУТЫ ====================
// (Все роуты ниже требуют обязательный заголовок Authorization: Bearer TOKEN)
router.use(protect); 

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);

// Система подписок (Принимает ID пользователя, на которого подписываемся/отписываемся)
router.patch('/follow/:id', userController.followUser);

// Роут для добавления/удаления постов из закладок
router.post('/save-post/:postId', userController.toggleSavePost);

module.exports = router;