import bcrypt from 'bcryptjs';
import express from 'express';
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

        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default authRouter;