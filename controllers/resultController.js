const Rez = require('../models/Rez')
const asyncHandler = require('express-async-handler')
const {format, yearsToDays} = require('date-fns');


const getAllQuestions = async (req, res)=> {
    const questions = await Rez.find()
    if (!questions) res.status(204).json({'message': 'no questions found'})
    res.status(201).json({questions})
} 

const generateQuestions = async (req, res)=> {
  const {format, yearsToDays} = require('date-fns');
    try {
        const result = await Rez.create({
            uni: req.body.id,
            candidate: req.body.candidate,
            q_no: req.body.q_no,
            questions: req.body.questions,
            attempt: req.body.attempt,
            answer: req.body.answer,
            date: req.body.date
        })
        console.log(result)
    
        res.status(201).send(`Question Added`)
    } catch (error) {
        res.status(400).json({'message': error})
    }
}
const getAResult = async(req, res)=> {
    
    const response = await Rez.findOne({candidate: req.body.candidate})
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
      const logItem = `date:  ${dateTime}
      id: ${uuid()} 
       method: ${req.method} 
       origin: ${req.headers.origin} 
       address: ${req.url}`;
      MongoReq.create({
          log: logItem
      })
    res.json(response)
}


module.exports = {
    getAllQuestions,
    generateQuestions,
    getAResult
}