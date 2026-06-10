import 'dotenv/config';
import { connectToDatabase } from './src/backend/config/db.js';
import { MessageModel } from './src/backend/models/Message.js';

connectToDatabase().then(async () => {
  const msgs = await MessageModel.find().sort({ createdAt: -1 }).limit(5);
  console.log(msgs.map(m => ({
    text: m.text,
    translationStatus: m.translationStatus,
    translatedText: m.translatedText
  })));
  process.exit(0);
});
