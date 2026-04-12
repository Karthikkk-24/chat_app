import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model('Message', MessageSchema);
