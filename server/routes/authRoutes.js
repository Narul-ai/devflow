const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Всё, что ниже — только для авторизованных
router.use(protect); 

router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);

module.exports = router;