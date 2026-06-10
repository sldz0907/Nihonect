import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      const user = result.user as any;
      return res.status(201).json({
        token: result.token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          provider: user.provider,
          profilePicture: user.profilePicture,
          bio: user.bio,
          livingArea: user.livingArea,
          japaneseLevel: user.japaneseLevel,
          vietnameseLevel: user.vietnameseLevel,
          interests: user.interests,
          nationality: user.nationality,
          location: user.location,
          job: user.job,
          age: user.age,
        },
      });
    } catch (error: any) {
      if (error.message === 'Email already exists.') return res.status(409).json({ message: error.message });
      if (error.message === 'Invalid credentials.') return res.status(401).json({ message: error.message });
      return res.status(400).json({ message: error.message || 'Unexpected server error.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);
      const user = result.user as any;
      return res.status(200).json({
        token: result.token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          provider: user.provider,
          profilePicture: user.profilePicture,
          bio: user.bio,
          livingArea: user.livingArea,
          japaneseLevel: user.japaneseLevel,
          vietnameseLevel: user.vietnameseLevel,
          interests: user.interests,
          nationality: user.nationality,
          location: user.location,
          job: user.job,
          age: user.age,
        },
      });
    } catch (error: any) {
      if (error.message === 'Invalid credentials.') return res.status(401).json({ message: error.message });
      return res.status(400).json({ message: error.message || 'Unexpected server error.' });
    }
  }
}
