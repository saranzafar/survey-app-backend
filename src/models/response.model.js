import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
    question: {
        type: Object,
        required: true
    },
    user: {
        type: Object,
        required: true
    }
}, { timestamps: true });

export const Answer = mongoose.model('Answer', responseSchema);
