import mongoose from 'mongoose';
import { mustGetEnv } from './env.js';

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  const mongoUri = mustGetEnv('MONGODB_URI');
  await mongoose.connect(mongoUri);
  isConnected = true;
  console.log('Connected to MongoDB');
}
