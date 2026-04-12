import express from 'express';
import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import { authMiddleware } from './authRoutes.js';

const chatRouter = express.Router();

chatRouter.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        }).sort({ updatedAt: -1 }).populate('participants', 'username uniqueId');
        res.json(conversations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

chatRouter.post('/conversations', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        const conversation = new Conversation({
            name: name || 'New Chat',
            participants: [req.user._id],
            updatedAt: new Date()
        });
        await conversation.save();
        res.status(201).json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

chatRouter.get('/messages/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const before = req.query.before;

        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json(messages.reverse());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

chatRouter.post('/join/:conversationId', authMiddleware, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (!conversation.participants.includes(req.user._id)) {
            conversation.participants.push(req.user._id);
            await conversation.save();
        }
        res.json(conversation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default chatRouter;
