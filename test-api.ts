import fetch, { FormData } from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserModel from './server/models/User';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const user = await UserModel.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(0);
  }

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  console.log('Testing with user:', user.email);

  const formData = new FormData();
  formData.append('bio', 'test bio');
  
  const response = await fetch('http://localhost:4000/api/users/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Headers:', response.headers.raw());
  console.log('Response text:', text.substring(0, 500));

  process.exit(0);
}

run().catch(console.error);
