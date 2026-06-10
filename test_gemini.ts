import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = 'Translate the following text to Japanese. Only output the translated text, nothing else. Text to translate:\n\nhello';
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    console.log('Gemini success:', response.text);
  } catch (err: any) {
    console.error('Gemini error:', err);
  }
}
test();
