// const sendToken = (user, statusCode, message, res) => {
//     const token = user.getJwtToken();

//     //setting cookies
//     const options = {
//         expires: new Date(Date.now() + process.env.COOKIES_EXPIRES_TIME * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//     }

//     res.status(statusCode)
//         .cookie('token', token, options)
//         .json({
//             success: true,
//             token,
//             message,
//             user
//         })
// }

// module.exports = sendToken;

const jwt = require('jsonwebtoken')

const generateToken = (res, user) => {

    console.log("res, user:", user);

    const jwtToken = jwt.sign({ user: user?._id }, process.env.JWT_SECRET, {
        expiresIn: "10d",
    });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 10 * 24 * 60 * 60 * 1000,
    };

    res.status(201)
        .cookie('token', jwtToken, options)
        .json({
            success: true,
            jwtToken,
            message: "Login Successfully",
            user
        })
};
module.exports = generateToken;