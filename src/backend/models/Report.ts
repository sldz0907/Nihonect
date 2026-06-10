import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reportedUser: mongoose.Types.ObjectId;
  type: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
});

export const ReportModel = mongoose.model<IReport>('Report', ReportSchema);
