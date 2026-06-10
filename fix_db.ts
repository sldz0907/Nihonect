import 'dotenv/config';
import { connectToDatabase } from './src/backend/config/db.js';
import { MessageModel } from './src/backend/models/Message.js';

connectToDatabase().then(async () => {
  const result = await MessageModel.updateMany(
    { translatedText: { $regex: /MYMEMORY WARNING/, $options: 'i' } },
    { $set: { translatedText: '', translationStatus: 'failed' } }
  );
  console.log('Fixed messages:', result.modifiedCount);
  process.exit(0);
});
