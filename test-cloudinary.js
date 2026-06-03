import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

fs.writeFileSync('test-image.txt', 'dummy content');

async function test() {
  try {
    const res = await cloudinary.uploader.upload('test-image.txt', { resource_type: 'raw' });
    console.log('Upload success:', res);
  } catch (err) {
    console.error('Upload error:', err);
  }
}
test();
