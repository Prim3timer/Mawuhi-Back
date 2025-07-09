const rateLimit = require('express-rate-limit')
const {logEvents} = require('./logger')
const { options } = require('../routes/authRoutes')

const loginLimiter = rateLimit({
    windowMs: 60 *1000, // 1 minute
    max: 5, // Limit each IP to 5 login requests per 'window' per minute
    messate:
    {messsaage: 'Too many login attampts from this IP. Please try again again a 60 second pause'},
    // handler: (req, res, next, ptions)=> {
    //     logEvents(`Too Many Requests: ${options.messsaage.message}\t${req.method}\t${req.url}\t
    //         ${req.headers.origin}`, 'errLog.log')
    //         res.status(options.statusCode).send(options.message)
    // },
    standardHeaders: true, // Return rate limit info in the `RateLimit-* headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
})

module.exports = loginLimiter