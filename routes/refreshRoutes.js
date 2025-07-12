const express = require('express')
const router = express.Router()
// const verifyJWT = require('../middleware/verifyJwT')
const refreshTokenController = require('../controllers/refreshTokenController')


router.route('/').get(refreshTokenController.handleRefreshToken)


module.exports = router