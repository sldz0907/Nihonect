import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { AppRole } from '../types/auth';

const authRouter = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in environment variables.');
  }
  return secret;
}

authRouter.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: AppRole;
    };

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'fullName, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: passwordHash,
      provider: 'local',
      role: role === 'admin' ? 'admin' : 'user',
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ message });
  }
});

export default authRouter;

