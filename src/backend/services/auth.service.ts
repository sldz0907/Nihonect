import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { getJwtSecret } from '../config/env.js';
import { activeUsers } from '../middlewares/auth.middleware.js';

export class AuthService {
  static async register({ fullName, email, password }: any) {
    if (!fullName || !email || !password) {
      throw new Error('fullName, email, and password are required.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      throw new Error('Email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: passwordHash,
      provider: 'local',
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    activeUsers.set(user.id.toString(), Date.now());

    return { token, user };
  }

  static async login({ email, password }: any) {
    if (!email || !password) {
      throw new Error('email and password are required.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid credentials.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    activeUsers.set(user.id.toString(), Date.now());

    return { token, user };
  }
}
