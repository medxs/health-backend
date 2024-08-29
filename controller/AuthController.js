// const User = require('../models/model');
// const sendToken = require('../utils/jwt');

// exports.login = async (req, res) => {

//     const { email, password } = req.body
//     if (!email || !password) {
//         return res.status(400).json('Please enter email & password')
//     }

//     const user = await User.findOne({ email }).select('+password');

//     console.log("Login user select:", user);

//     if (!user) {
//         return res.status(401).json('Invalid email or password');
//     }
//     sendToken(user, 201, 'Login Successfull', res)
// }

// // Get User Profile - /api/v1/profile/get
// exports.getUser = async (req, res, next) => {
//     const user_data = await User.findById(req.user.id);

//     res.status(200).json({
//         success: true,
//         user: user_data,
//     });
// };

// ******************************************************************************

const { UserModel } = require('../models/userModel');
const generateToken = require('../utils/jwt');

const createUser = async (req, res, next) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400).json({ message: "Please fill all fields" })
    }

    try {

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            res.status(200).json({ message: "Email is Already Exists..!!" })
            return;
        }

        console.log("userExists:", userExists);
        console.log("userExists:", req.body);



        // if (userExists) {
        //     res.status(400)
        //     const err = new Error('Email already registered...!!');
        //     return next(err);
        // }

        const newUser = await UserModel.create({
            name,
            email,
            password,
            role
        })

        if (newUser) {
            res.status(200).json({ message: "Register Successfully..!!" })
            return;
        }
        res.status(400).json({ message: "Something is went Wrong..!!" })

        // if (newUser) {
        //     generateToken(res, newUser._id)
        //     res.status(201).json({
        //         _id: newUser._id,
        //         name: newUser.name,
        //         email: newUser.email,
        //     })
        // }

    } catch (error) {
        // if (error.code === 11000) {
        //     res.status(400).json({ message: `Email is Already Exists` });
        //     return;
        // }
        res.status(500).json({ error: error.message } || "Internal Server Error")
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    const userCheck = await UserModel.findOne({ email });
    const user = await UserModel.findOne({ email }).select('-password');
    if (userCheck && (await userCheck.checkPassword(password))) {
        generateToken(res, user);
    } else {
        res.status(400).json({ message: "Invalid Email or Password" });
    }
};


const getUser = async (req, res, next) => {
    const user_data = req.user;
    res.status(200).json({
        success: true,
        user: user_data,
    });
};


module.exports = {
    createUser, login, getUser
}