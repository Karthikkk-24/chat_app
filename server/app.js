import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { WebSocket, WebSocketServer } from 'ws';
import Conversation from './models/conversationModel.js';
import Message from './models/messageModel.js';
import User from './models/userModel.js';
import authRouter from './routes/authRoutes.js';
import chatRouter from './routes/chatRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const connectedUsers = new Map();

mongoose.connect('mongodb://localhost:27017/chatapp')
    .then(async () => {
        console.log('MongoDB connected');
        await seedDefaultConversation();
        await User.updateMany({}, { isOnline: false });
    })
    .catch(err => console.error('MongoDB connection error:', err));

async function seedDefaultConversation() {
    const existing = await Conversation.findOne({ name: 'General' });
    if (!existing) {
        await new Conversation({ name: 'General', participants: [], isGroup: true }).save();
        console.log('Created default General conversation');
    }
}

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const host = req.headers.host;
    const protocol = req.protocol;
    res.json({
        fileUrl: `${protocol}://${host}/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
    });
});

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

function broadcast(data, excludeWs = null) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
            client.send(str);
        }
    });
}

function broadcastToAll(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(str);
        }
    });
}

async function setUserOnline(userId, online) {
    if (!userId) return;
    await User.findByIdAndUpdate(userId, {
        isOnline: online,
        lastSeen: new Date()
    });
    broadcastToAll({ type: 'presence', userId, isOnline: online, lastSeen: new Date() });
}

wss.on('connection', (ws) => {
    ws.userId = null;
    ws.isAlive = true;

    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', async (data) => {
        try {
            const parsed = JSON.parse(data);
            const { type } = parsed;

            if (type === 'auth') {
                ws.userId = parsed.userId;
                connectedUsers.set(parsed.userId, ws);
                await setUserOnline(parsed.userId, true);
                return;
            }

            if (type === 'typing') {
                broadcast({
                    type: 'typing',
                    conversationId: parsed.conversationId,
                    userId: parsed.userId,
                    username: parsed.username,
                    isTyping: parsed.isTyping,
                }, ws);
                return;
            }

            if (type === 'read') {
                const { conversationId, userId } = parsed;
                await Message.updateMany(
                    { conversationId, senderId: { $ne: userId }, readBy: { $nin: [userId] } },
                    { $addToSet: { readBy: userId } }
                );
                broadcastToAll({ type: 'read', conversationId, userId });
                return;
            }

            if (type === 'reaction') {
                const { messageId, userId, emoji } = parsed;
                const msg = await Message.findById(messageId);
                if (!msg) return;
                const existingIdx = msg.reactions.findIndex(
                    r => r.userId.toString() === userId && r.emoji === emoji
                );
                if (existingIdx > -1) {
                    msg.reactions.splice(existingIdx, 1);
                } else {
                    msg.reactions.push({ userId, emoji });
                }
                await msg.save();
                broadcastToAll({
                    type: 'reaction',
                    messageId,
                    reactions: msg.reactions,
                });
                return;
            }

            if (type === 'edit') {
                const { messageId, senderId, text } = parsed;
                const msg = await Message.findOne({ _id: messageId, senderId });
                if (!msg) return;
                msg.text = text;
                msg.edited = true;
                await msg.save();
                broadcastToAll({ type: 'edit', messageId, text, edited: true });
                return;
            }

            if (type === 'delete') {
                const { messageId, senderId } = parsed;
                const msg = await Message.findOne({ _id: messageId, senderId });
                if (!msg) return;
                msg.deleted = true;
                msg.text = '';
                await msg.save();
                broadcastToAll({ type: 'delete', messageId });
                return;
            }

            // Default: new message
            const { conversationId, senderId, senderName, text, replyTo, fileUrl, fileType, fileName } = parsed;
            if (!conversationId || !senderId || (!text && !fileUrl)) {
                ws.send(JSON.stringify({ error: 'Missing required fields' }));
                return;
            }

            const message = new Message({
                conversationId,
                senderId,
                senderName: senderName || 'Unknown',
                text: text || '',
                fileUrl: fileUrl || '',
                fileType: fileType || '',
                fileName: fileName || '',
                replyTo: replyTo || undefined,
                readBy: [senderId],
            });
            await message.save();

            const displayText = fileUrl ? (text || `Sent a file`) : text;
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: displayText,
                updatedAt: new Date()
            });

            broadcastToAll({
                type: 'message',
                _id: message._id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                senderName: message.senderName,
                text: message.text,
                fileUrl: message.fileUrl,
                fileType: message.fileType,
                fileName: message.fileName,
                replyTo: message.replyTo,
                reactions: message.reactions,
                readBy: message.readBy,
                edited: message.edited,
                deleted: message.deleted,
                createdAt: message.createdAt,
            });
        } catch (err) {
            console.error('WebSocket message error:', err);
            ws.send(JSON.stringify({ error: 'Failed to process message' }));
        }
    });

    ws.on('close', async () => {
        if (ws.userId) {
            connectedUsers.delete(ws.userId);
            const stillConnected = [...wss.clients].some(
                c => c !== ws && c.userId === ws.userId && c.readyState === WebSocket.OPEN
            );
            if (!stillConnected) {
                await setUserOnline(ws.userId, false);
            }
        }
    });
});

const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => clearInterval(pingInterval));

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () =>
    console.log(`Server running on http://0.0.0.0:${PORT}`)
);
