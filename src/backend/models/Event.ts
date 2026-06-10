import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    capacity: { type: Number, default: 0 },
    price: { type: String, default: '無料' },
    format: { type: String, enum: ['オンライン', 'オフライン'], default: 'オフライン' },
    languageRequirement: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
