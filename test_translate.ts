import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = 'Translate to Japanese: alo bạn có đó ko';
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    console.log('Gemini:', response.text);
  } catch (e: any) {
    console.error('Gemini error:', e.message);
    try {
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=alo%20ban%20co%20do%20ko';
      const res = await fetch(url);
      const json = await res.json();
      console.log('Fallback:', json);
    } catch(err: any) {
      console.error('Fallback error:', err.message);
    }
  }
}
test();
