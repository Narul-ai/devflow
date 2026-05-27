const express = require('express');
const postController = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Публичный просмотр всех постов и защищенное создание
router.route('/')
  .get(postController.getAllPosts)
  .post(protect, postController.createPost);

// 2. Статические защищенные и публичные маршруты (Выше, чем /:id)
router.route('/my-posts')
  .get(protect, postController.getMyPosts);

router.get('/trending', postController.getTrendingPosts);

// 3. Работа с конкретным постом по его ID (Динамический роут)
router.route('/:id')
  .get(postController.getPost)
  .patch(protect, postController.updatePost)
  .delete(protect, postController.deletePost);

// 4. Экшены с постами (Лайки и Закладки)
router.post('/:id/upvote', protect, postController.upvotePost);
router.post('/:id/bookmark', protect, postController.toggleBookmark); // 🌟 ДОБАВИЛИ РОУТ ДЛЯ ЗАКЛАДОК

module.exports = router;