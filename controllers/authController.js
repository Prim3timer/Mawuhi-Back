const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler')
require('dotenv').config()
const handleLogin = asyncHandler(async (req, res) => {
    const { user, pwd, acitve } = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' });

    const foundUser = await User.findOne({ username: user }).exec();
    if (!foundUser || !foundUser.active) return res.sendStatus(401);  
    // evaluate password 
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (!match) return res.status(401).json({message: 'Unauthorized'})
        if (match) {
        console.log('logged in')
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
            { expiresIn: '3h' }
        );
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '3h' }
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
const username = foundUser.username
const id = foundUser._id
        // Send authorization roles and access token to user
        res.json({ roles, accessToken, username, id});

    }
})




const handleLogout = asyncHandler(async(req, res)=> {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // no content
    const refreshToken = cookies.jwt

    const foundUser = await User.findOne({refreshToken}).exec()
    if (foundUser) {
        
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
    }
    foundUser.refreshToken = ''
    const result = foundUser.save()
    console.log(result)
    res.json({message: 'Cookie Cleared'})

})


module.exports = { handleLogin, handleLogout };