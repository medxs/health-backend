const router = require('express').Router();
// const User = require('../models/model')
// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken');
// const { login, getUser } = require('../controller/AuthController');
// const { isAuthenticatedUser } = require('../middlewares/authenticate');

// router.post('/register', async (req, res) => {

//     try {
//         const emailExist = await User.findOne({ email: req.body.email });
//         if (emailExist) {
//             return res.status(400).json({ message: "Already Exist." });
//         }

//         const hash = await bcrypt.hash(req.body.password, 10);
//         var user = new User({
//             name: req.body.name,
//             email: req.body.email,
//             role: req.body.role,
//             password: hash,
//         })
//         const data = await user.save();
//         console.log("Store:", data);
//         res.json({ message: "Successfully Created..!!!" });

//     }
//     catch (err) {
//         res.status(400).json({ message: err?.message })
//     }
// })


// // middleware authentication

// const authenticateToken = (req, res, next) => {

//     console.log("REQ : ", req)
//     console.log("RES : ", res)
//     console.log("Next: ", next)

//     const authHeader = req.headers['authorization'];
//     console.log("Auth H->: ", authHeader);
//     const token = authHeader && authHeader.split(' ')[1];
//     console.log("Token ->: ", token);
//     if (!token) {
//         return res.status(403).json("Unauthorization Token")
//     }

//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
//         if (err) {
//             res.status(403).json("Mis match token")
//         }
//         req.email = data;
//         next();
//     });

// }
// router.route('/login').post(login);
// router.route('/get-user').get(isAuthenticatedUser, getUser)


// module.exports = router;


const { createUser, login, getUser } = require('../controller/AuthController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
// const checkToken = require('../middlewares/authenticate');

router.post('/register',  createUser);


const authenticateToken = (req, res, next) => {

    console.log("REQ : ", req)
    console.log("RES : ", res)
    console.log("Next: ", next)

    const authHeader = req.headers['authorization'];
    console.log("Auth H->: ", authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log("Token ->: ", token);
    if (!token) {
        return res.status(403).json("Unauthorization Token")
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, data) => {
        if (err) {
            res.status(403).json("Mis match token")
        }
        req.email = data;
        next();
    });
}

router.post('/login', login);



router.route('/get-user').get(isAuthenticatedUser, getUser);

// router.get('/profile', checkToken, getProfile)
// router.put('/profile', checkToken, updateProfile)
// router.post('/logout', logout)


module.exports = router;









