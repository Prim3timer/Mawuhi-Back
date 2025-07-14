const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')

// const handleRefreshToken = async (req, res) => {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(401);
//     const refreshToken = cookies.jwt;

//     const foundUser = await User.findOne({ refreshToken }).exec();
//     if (!foundUser) return res.sendStatus(403); //Forbidden 
//     // evaluate jwt 
//     jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET,
//         (err, decoded) => {
//             if (err || foundUser.username !== decoded.username) return res.sendStatus(403);
//             const roles = Object.values(foundUser.roles);
//             const accessToken = jwt.sign(
//                 {
//                     "UserInfo": {
//                         "username": decoded.username,
//                         "roles": roles
//                     }
//                 },
//                 process.env.ACCESS_TOKEN_SECRET,
//                 { expiresIn: '10s' }
//             );
//             res.json({ roles, accessToken })
//         }
//     );
// }





const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    // if there is no cookie with name jwt, return 401 unauthorized
    if (!cookies?.jwt) return res.sendStatus(401);
    //else, set the refresh token variable to that cookie
    const refreshToken = cookies.jwt;
    // find by refresh token
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) return res.sendStatus(403); //Forbidden 
    // we will use the jwt dependency to verify the refresh token
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err ) return res.sendStatus(403)

            const foundUser = await User.findOne({username: decoded.username})

            if (!foundUser)return res.status(401).json({message: 'Unauthorized'})
            const roles = Object.values(foundUser.roles);
        const username = foundUser.username
        const id = foundUser._id
    
            // if user is found, we create a new access token with the username and roles
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles,
                        
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15s' }
            );
            res.json({accessToken, roles, username, id})
        }
    ));
})

module.exports = { handleRefreshToken }