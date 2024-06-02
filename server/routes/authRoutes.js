import bcrypt from 'bcryptjs';
import express from 'express';
import authTokenModel from '../models/authTokenModel.js';
import User from '../models/userModel.js';

const authRouter = express.Router();

async function createUniqueId () {
    let uniqueId = Math.random().toString(36).substr(2, 9);
    const existingUser = await User.findOne({ uniqueId });
    if (existingUser) {
        return createUniqueId();
    }
    return uniqueId;
}

async function createUserAuthToken (user) {
    const token = generateAuthToken(user);
    return token;
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

async function generateAuthToken(user) {
    const authToken = generateRandomString(30);

    const checkAuthToken = async () => {
        const existingToken = await authTokenModel.findOne({ token: authToken });
        if (existingToken) {
            return generateAuthToken();
        } else {
            const newAuthToken = new authTokenModel({ token: authToken, user: user._id });
            await newAuthToken.save();
            return authToken;
        }
    };

    return checkAuthToken();
}

function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

authRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        console.log('req.body', req.body);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const uniqueId = await createUniqueId();
        console.log('uniqueId', uniqueId);

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            uniqueId,
            createdAt: getFormattedDate()
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = await createUserAuthToken(user);
        console.log('token', token);

        res.status(200).json({ message: 'Login successful', user, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default authRouter;