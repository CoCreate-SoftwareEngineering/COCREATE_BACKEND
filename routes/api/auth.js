const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const {check, validationResult} = require('express-validator')

const User = require('../../models/User')

// @route GET api/auth
// @desc Test Route
// @access Public
router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route POST api/auth
// @desc Authenticate user and get token
// @access Public
router.post('/', [
    check('email', 'Please Enter a Valid Email').isEmail(),
    check('password', 'Password is required').exists()
], async (req,res) => {
    const errors = validationResult(req, res)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body

    try {
        let user = await User.findOne({email})

        if(!user){
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(400).json({errors: [{msg: "Invalid Credentials"}]})
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'),
        {expiresIn: 3600000},
        (err, token)=>{
            if(err) throw err
            res.json({ token })
        })

    } catch (err) {
        
    }

    
})

module.exports = router