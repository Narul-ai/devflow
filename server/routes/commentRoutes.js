const express = require('express');
const commentController = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// 1. Получить все комменты (универсальный роут)
router.get('/', commentController.getAllComments);

// 2. Получить комменты конкретного поста (если нужно через /post/:postId)
router.get('/post/:postId', commentController.getAllComments);

/**
 * ЗАЩИЩЕННЫЕ РОУТЫ
 */
router.use(protect); 

router.post('/', commentController.createComment);
router.patch('/:id', commentController.updateComment); // Перенесли логику в контроллер
router.patch('/:id/upvote', commentController.upvoteComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;