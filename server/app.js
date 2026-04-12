import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { WebSocket, WebSocketServer } from 'ws';
import Conversation from './models/conversationModel.js';
import Message from './models/messageModel.js';
import authRouter from './routes/authRoutes.js';
import chatRouter from './routes/chatRoutes.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

mongoose.connect('mongodb://localhost:27017/chatapp')
    .then(async () => {
        console.log('MongoDB connected');
        await seedDefaultConversation();
    })
    .catch(err => console.error('MongoDB connection error:', err));

async function seedDefaultConversation() {
    const existing = await Conversation.findOne({ name: 'General' });
    if (!existing) {
        await new Conversation({ name: 'General', participants: [] }).save();
        console.log('Created default General conversation');
    }
}

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (data) => {
        try {
            const parsed = JSON.parse(data);
            const { conversationId, senderId, senderName, text } = parsed;

            if (!conversationId || !senderId || !text) {
                ws.send(JSON.stringify({ error: 'Missing required fields' }));
                return;
            }

            const message = new Message({
                conversationId,
                senderId,
                senderName: senderName || 'Unknown',
                text,
            });
            await message.save();

            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: text,
                updatedAt: new Date()
            });

            const broadcastData = JSON.stringify({
                _id: message._id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                senderName: message.senderName,
                text: message.text,
                createdAt: message.createdAt,
            });

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastData);
                }
            });
        } catch (err) {
            console.error('WebSocket message error:', err);
            ws.send(JSON.stringify({ error: 'Failed to process message' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, 'localhost', () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
