import mongoose from 'mongoose';

const AuthTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('AuthTokenCollection', AuthTokenSchema);
