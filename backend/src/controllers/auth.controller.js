import bcrypt, { genSalt } from 'bcryptjs';
import User from '../models/user.model.js'
import generateToken from '../utils/generateToken.js'
import cloudinary from '../utils/cloudinary.js'

export const signup = async (req, res) => {

    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            throw new Error('All fields must be filled')
        }

        const exists = await User.findOne({ email });
        if (exists) {
            throw new Error('email already exists')
        }
        
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters')
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashPassword,
        })
        
        if (newUser) {

            // generate token
            generateToken(res, newUser._id);
            await newUser.save();

            res.status(200).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            throw new Error('Invalid user data')
        }

    } catch (error) {
        throw new Error('Error in signing up ' + error.message)
    }

}

export const login = async (req, res) => {
 
    const { email, password } = req.body;
    try {
        
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Invalid credentials')
        }

        const matchPassword = await bcrypt.compare(password, user.password)

        if (user && await matchPassword ) {
            
            generateToken(res, user._id)

            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic
            })

        } else {
            throw new Error('Incorrect email or password')
        }

    } catch (error) {
        throw new Error('Error in logging in ' + error.message)
    }

}

export const logout = async (req, res) => {

    res.cookie('jwt', '', {
        maxAge: 0
    })

    res.status(200).json({ message: "logged out user" })

}

export const updateProfile = async (req, res) => {
    
    try {

        const { profilePic } = req.body;
        const user = await req.user._id;

        if (!user) {
            res.status(400).json({ message: "Profile pic is required" })
        }

        const updateResponse = await cloudinary.uploader.upload( profilePic );
        const updatedUser = await User.findByIdAndUpdate(user._id, { profilePic: updateResponse.secure_url }, { new: true });

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log(`Error in: ${error.message}`);
    }
    
}

export const checkAuth = (req, res) => {
    try {
        return res.status(200).json(req.user)
    } catch (error) {
        console.log(`Error in ${error.message}`);
        return res.status(400).json({ message: "Unauthorized no token provided" })
    }
}