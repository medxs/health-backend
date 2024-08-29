// const mongoose = require('mongoose')
// const validator = require('validator');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');


// const registerSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         require: true
//     },
//     email: {
//         type: String,
//         require: true
//     },
//     role: {
//         type: String,
//         require: true
//     },
//     password: {
//         type: String,
//         require: true
//     }
// })


// registerSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     this.password = await bcrypt.hash(this.password, 10);
// })

// registerSchema.methods.getJwtToken = function () {
//     return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_TIME
//     })
// }

// registerSchema.methods.isValidPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password)
// }

// registerSchema.methods.getResetToken = function () {
//     // generate token
//     const token = crypto.randomBytes(20).toString('hex');

//     this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

//     //set token expire time
//     this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

//     return token;
// }


// const UserModel = mongoose.model("user", registerSchema);
// module.exports = {
//     UserModel
// }

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const takeHomeAutoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    role: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // hash 
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
})


userSchema.methods.checkPassword = async function (givenPassword) {
    return await bcrypt.compare(givenPassword, this.password);
}


const UserModel = mongoose.model("user", userSchema)

module.exports = { UserModel };