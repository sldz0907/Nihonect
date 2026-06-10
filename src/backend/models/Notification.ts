import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
