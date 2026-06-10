import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    categories: [{ type: String }],
    text: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

export const ReviewModel = mongoose.models.Review || mongoose.model('Review', reviewSchema);
