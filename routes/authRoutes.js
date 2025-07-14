const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController')
const authController = require('../controllers/authController');
const loginLimiter = require('../middleware/loginLimiter')

router.route('/').post(loginLimiter, authController.handleLogin);
// router.route('/refresh').get(refreshTokenController.handleRefreshToken);
router.route('/logout').post(authController.handleLogout);

module.exports = router;