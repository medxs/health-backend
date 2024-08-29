const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/userModel');

const checkToken = async (req, res, next) => {
    let token;
    token = req.cookies.token;

    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
            req.user = await UserModel.findById(decodedToken.userId).select('-password');
            next()
        } catch (error) {
            res.status(401);
            throw new Error("Invalid Token !");
        }
    } else {
        res.status(401);
        throw new Error("Unauthorized !");
    }
};

const isAuthenticatedUser = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "Authorization token not found!" });
        
    }

    console.log("authorization: ", authorization);
    const token = authorization;
    if (!token) {
        return res.status(401).json({ message: "Token is missing!" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch the user from the database
        req.user = await UserModel.findOne({ _id: decoded?.user });
        if (!req.user) {
            return res.status(404).json({ message: "User not found!" });
        }

        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        return res.status(401).json({ message: "Invalid token!" });
    }
};


const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return console.log(`Role ${req.user.role} is not allowed`);
        }
        next();
    }
}


module.exports = { checkToken, isAuthenticatedUser, authorizeRoles };










