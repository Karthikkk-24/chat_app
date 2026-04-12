import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

ConversationSchema.index({ updatedAt: -1 });

export default mongoose.model('Conversation', ConversationSchema);
