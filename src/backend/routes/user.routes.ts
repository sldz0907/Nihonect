import { Router, Request, Response } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { UserModel } from '../models/User.js';
import { upload } from '../../../lib/cloudinary.js';

interface MulterRequest extends Request {
  file?: {
    path: string;
    [key: string]: any;
  };
}

const router = Router();

router.use(requireAuth);

router.get('/recommendations', UserController.getRecommendations);
router.post('/request/:targetUserId', UserController.sendRequest);
router.post('/accept/:requesterId', UserController.acceptRequest);
router.post('/decline/:requesterId', UserController.declineRequest);
router.get('/dashboard-stats', UserController.getDashboardStats);
router.get('/friends', UserController.getFriends);
router.get('/notifications', UserController.getNotifications);
router.get('/profile/:id', UserController.getProfile);

router.put('/profile', (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    next();
  });
}, async (req: MulterRequest, res: Response): Promise<any> => {
  try {
    const userId = req.auth!.sub;
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData: any = {};
    if (req.file) updateData.profilePicture = req.file.path;
    else if (req.body.removeProfilePicture === 'true') updateData.profilePicture = null;

    const { fullName, bio, livingArea, japaneseLevel, vietnameseLevel, interests, nationality, location, job, age } = req.body;
    if (typeof fullName === 'string' && fullName.trim() !== '') updateData.fullName = fullName.trim();
    if (typeof bio === 'string') updateData.bio = bio.trim();
    if (typeof livingArea === 'string') updateData.livingArea = livingArea.trim();
    if (typeof japaneseLevel === 'string') updateData.japaneseLevel = japaneseLevel.trim();
    if (typeof vietnameseLevel === 'string') updateData.vietnameseLevel = vietnameseLevel.trim();

    if (interests !== undefined) {
      try {
        const parsedInterests = JSON.parse(interests);
        if (Array.isArray(parsedInterests)) updateData.interests = parsedInterests;
        else return res.status(400).json({ message: 'Interests must be an array.' });
      } catch {
        return res.status(400).json({ message: 'Invalid interests format. Expected JSON array string.' });
      }
    }
    if (typeof nationality === 'string') updateData.nationality = nationality.trim();
    if (typeof location === 'string') updateData.location = location.trim();
    if (typeof job === 'string') updateData.job = job.trim();
    if (age !== undefined) updateData.age = Number(age);

    user.set(updateData);
    await user.save();
    
    const updatedUser = {
      id: user.id, fullName: user.fullName, email: user.email, provider: user.provider,
      role: user.role, profilePicture: user.profilePicture, bio: user.bio,
      livingArea: user.livingArea, japaneseLevel: user.japaneseLevel, vietnameseLevel: user.vietnameseLevel,
      interests: user.interests, nationality: user.nationality, location: user.location,
      job: user.job, age: user.age
    };
    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
