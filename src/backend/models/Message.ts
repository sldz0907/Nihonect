import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    translatedText: { type: String },
  },
  { timestamps: true }
);

export const MessageModel = mongoose.models.Message || mongoose.model('Message', messageSchema);
