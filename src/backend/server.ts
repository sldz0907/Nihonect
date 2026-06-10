import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { GoogleGenAI } from '@google/genai';
import app from './app.js';
import { connectToDatabase } from './config/db.js';
import { MessageModel } from './models/Message.js';

async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  connectToDatabase().catch(err => {
    console.error('MongoDB connection error:', err);
  });

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_chat', ({ userId, buddyId }) => {
      const room = [userId, buddyId].sort().join('_');
      socket.join(room);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, text } = data;
        const room = [senderId, receiverId].sort().join('_');

        let translatedText = '';
        try {
          const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
          const targetLang = isJapanese ? 'Vietnamese' : 'Japanese';

          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const prompt = `Translate the following text to ${targetLang}. Only output the translated text, nothing else. Text to translate:\n\n${text}`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            if (response.text) {
              translatedText = response.text.trim();
            }
          } catch (geminiError: any) {
            console.error('Gemini translation failed:', geminiError.message);
            try {
              const fbLang = isJapanese ? 'vi' : 'ja';
              const fallbackUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${fbLang}&dt=t&q=${encodeURIComponent(text)}`;
              const fbRes = await fetch(fallbackUrl);
              const fbJson = await fbRes.json();
              if (fbJson && fbJson[0]) {
                translatedText = fbJson[0].map((item: any) => item[0]).join('');
              }
            } catch (fallbackErr: any) {
              console.error('Fallback translation also failed:', fallbackErr.message);
            }
          }
        } catch (translateError) {
          console.error('Translation failed:', translateError);
        }

        const message = new MessageModel({ senderId, receiverId, text, translatedText });
        await message.save();
        io.to(room).emit('receive_message', message);
      } catch (e) {
        console.error('Socket send_message error:', e);
      }
    });

    socket.on('delete_message', async (data) => {
      try {
        const { messageId, senderId, receiverId } = data;
        const msg = await MessageModel.findById(messageId);
        if (msg && msg.senderId.toString() === senderId) {
          await MessageModel.findByIdAndDelete(messageId);
          const room = [senderId, receiverId].sort().join('_');
          io.to(room).emit('message_deleted', messageId);
        }
      } catch (e) {
        console.error('Socket delete_message error:', e);
      }
    });
  });

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
});
