import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { WebSocketServer } from 'ws';
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

    ws.on('message', (message) => {
        console.log('Received:', message);
        // Broadcast the message to all clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.get('/something', (req, res) => {
    res.send('Something Nothing');
})

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
