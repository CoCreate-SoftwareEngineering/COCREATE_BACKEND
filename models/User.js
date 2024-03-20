const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        requried: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        requried: true,
        unique: true
    },
    password:{
        type: String,
        requried: true
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

module.exports = User = mongoose.model('user', UserSchema)