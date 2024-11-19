const router = require('express').Router()


const resultController = require('../controllers/resultController')

router.route('/:candidate').get(resultController.getAResult)
router.route('/')   
.get(resultController.getAllQuestions)
.post(resultController.generateQuestions)

 module.exports = router