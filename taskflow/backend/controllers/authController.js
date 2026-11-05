const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const checkUserExist = await User.findOne({ email })

        if (checkUserExist) {
            return res.status(400).json({ message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10)

        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({ name, email, password: hashPassword })

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        });

        res.status(201).json({ message: "Đăng ký thành công", user: { id: newUser._id, name: newUser.name } })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        const findUser = await User.findOne({ email })

        if (!findUser) {
            return res.status(400).json({ message: "User not found" })
        }

        const isPasswordValid = await bcrypt.compare(password, findUser.password)

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" })
        }

        const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Đăng nhập thành công",
            user: {
                _id: findUser._id,
                name: findUser.name,
                email: findUser.email
            }
        })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
}