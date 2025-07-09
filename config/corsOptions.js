
const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
    //    the first part of the conditional statement is
    //     checking if the origin is not in the allowedOrigins array
    // second part is allowing for tools like postman to access our rest api.
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}


module.exports = corsOptions 
