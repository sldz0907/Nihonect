import dotenv from 'dotenv';
dotenv.config();
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Length:', process.env.CLOUDINARY_CLOUD_NAME?.length);
