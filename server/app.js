import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { WebSocket, WebSocketServer } from 'ws';
import ChatMessage from './models/chatMessageModel.js';
import authRouter from "./routes/authRoutes.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

mongoose.connect('mongodb://localhost:27017/chat-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        console.log('Received:', message);

        const parsedMessage = JSON.parse(message);

        const chatMessage = new ChatMessage({
            text: parsedMessage.text,
            timestamp: parsedMessage.timestamp,
            user: parsedMessage.user
        });
        await chatMessage.save();

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.get('/api/getChats', async (req, res) => {
    try {
        const chatMessages = await ChatMessage.find();
        res.send(chatMessages);
    } catch (error) {
        console.log(error);
    }
});

const ipAddress = "192.168.0.104";

app.get('/something', (req, res) => {
    res.send('Something Nothing');
})

const PORT = 3000;
server.listen(PORT, ipAddress, () => console.log(`Server running on port ${PORT}`));
