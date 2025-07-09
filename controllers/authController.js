const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')

const handleLogin = asyncHandler(async (req, res) => {
    const { user, pwd, acitve } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    // console.log(foundUser)
    if (!foundUser || !foundUser.active) return res.sendStatus(401);  
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (!match) res.status(401).json({message: 'Unauthorized'})
    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // create JWTs  
        const accessToken = jwt.sign(
            {
                "UserInfo": {                            
                    "username": foundUser.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
const username = foundUser.username
const id = foundUser. _id
        // Send authorization roles and access token to user
        res.json({ roles, accessToken, username, id });

    }
})


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

            if (!foundUser)res.status(401).json({message: 'Unauthorized'})
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
                { expiresIn: '15m' }
            );
            res.json({accessToken, roles, username, id })
        }
    ));
})

const handleLogout = asyncHandler((req, res)=> {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // no content
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
    res.json({message: 'Cookie Cleared'})
})


module.exports = { handleLogin, handleRefreshToken, handleLogout };