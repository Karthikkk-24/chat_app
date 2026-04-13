import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import authTokenModel from '../models/authTokenModel.js';
import Conversation from '../models/conversationModel.js';
import User from '../models/userModel.js';

const authRouter = express.Router();

async function createUniqueId() {
    const uniqueId = crypto.randomBytes(5).toString('hex');
    const existing = await User.findOne({ uniqueId });
    if (existing) return createUniqueId();
    return uniqueId;
}

async function generateAuthToken(user) {
    const token = crypto.randomBytes(30).toString('hex');
    const existing = await authTokenModel.findOne({ token });
    if (existing) return generateAuthToken(user);
    await new authTokenModel({ token, user: user._id }).save();
    return token;
}

export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const authToken = await authTokenModel.findOne({ token });
        if (!authToken) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = await User.findById(authToken.user).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

authRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const uniqueId = await createUniqueId();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            uniqueId,
        });
        await newUser.save();

        const generalChat = await Conversation.findOne({ name: 'General' });
        if (generalChat) {
            generalChat.participants.push(newUser._id);
            await generalChat.save();
        }

        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = await generateAuthToken(user);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                uniqueId: user.uniqueId,
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

authRouter.get('/me', authMiddleware, async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        uniqueId: req.user.uniqueId,
        avatarColor: req.user.avatarColor,
        avatarUrl: req.user.avatarUrl,
        isOnline: req.user.isOnline,
        lastSeen: req.user.lastSeen,
    });
});

authRouter.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, email, avatarColor, avatarUrl } = req.body;
        const updates = {};
        if (username) updates.username = username;
        if (email) {
            const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (existing) return res.status(400).json({ message: 'Email already taken' });
            updates.email = email;
        }
        if (avatarColor) updates.avatarColor = avatarColor;
        if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            uniqueId: user.uniqueId,
            avatarColor: user.avatarColor,
            avatarUrl: user.avatarUrl,
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default authRouter;