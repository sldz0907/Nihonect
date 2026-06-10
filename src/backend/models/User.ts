import mongoose, { InferSchemaType, Model } from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function requiredPassword(this: { provider: string }) {
        return this.provider === 'local';
      },
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'line'],
      default: 'local',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    profilePicture: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 300, default: null },
    livingArea: { type: String, trim: true, default: null },
    japaneseLevel: { type: String, trim: true, default: null },
    vietnameseLevel: { type: String, trim: true, default: null },
    interests: { type: [String], default: [] },
    nationality: { type: String, trim: true },
    location: { type: String, trim: true },
    job: { type: String, trim: true },
    age: { type: Number, min: 0 },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    previousRecommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel =
  (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>('User', userSchema);
