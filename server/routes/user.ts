import { Router, Request } from 'express';
import UserModel from '../models/User';
import { requireAuth } from '../middleware/auth';
import { upload } from '../../lib/cloudinary';

// Extend Request type for multer
interface MulterRequest extends Request {
  file?: {
    path: string;
    [key: string]: any;
  };
}

const router = Router();

// PUT /api/users/profile - Update user profile
router.put('/profile', requireAuth, (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, async (req: MulterRequest, res) => {
  try {
    const userId = req.auth!.sub;

    console.log('=== Profile update request START ===');
    console.log('userId:', userId);
    console.log('auth:', req.auth);
    console.log('file:', req.file ? { filename: req.file.filename, path: req.file.path, size: req.file.size } : 'NO FILE');
    console.log('body:', req.body);

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      console.warn('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user._id, user.email);

    // Prepare update data
    const updateData: any = {};

    // Handle image upload
    if (req.file) {
      console.log('Uploading profilePicture:', req.file.path);
      updateData.profilePicture = req.file.path;
    }

    // Handle text fields from req.body
    // Handle text fields from req.body
    const { bio, livingArea, japaneseLevel, vietnameseLevel, interests, nationality, location, job, age } = req.body;
    if (typeof bio === 'string') {
      console.log('Updating bio:', bio);
      updateData.bio = bio.trim();
    }
    if (typeof livingArea === 'string') {
      console.log('Updating livingArea:', livingArea);
      updateData.livingArea = livingArea.trim();
    }
    if (typeof japaneseLevel === 'string') {
      console.log('Updating japaneseLevel:', japaneseLevel);
      updateData.japaneseLevel = japaneseLevel.trim();
    }
    if (typeof vietnameseLevel === 'string') {
      console.log('Updating vietnameseLevel:', vietnameseLevel);
      updateData.vietnameseLevel = vietnameseLevel.trim();
    }
    if (interests !== undefined) {
      try {
        console.log('Parsing interests:', interests);
        const parsedInterests = JSON.parse(interests);
        if (Array.isArray(parsedInterests)) {
          console.log('Interests parsed:', parsedInterests);
          updateData.interests = parsedInterests;
        } else {
          console.error('Interests is not an array:', parsedInterests);
          return res.status(400).json({ message: 'Interests must be an array.' });
        }
      } catch (error) {
        console.error('Failed to parse interests:', error);
        return res.status(400).json({ message: 'Invalid interests format. Expected JSON array string.' });
      }
    }
    if (nationality !== undefined && nationality.trim() !== '') updateData.nationality = nationality.trim();
    if (location !== undefined && location.trim() !== '') updateData.location = location.trim();
    if (job !== undefined && job.trim() !== '') updateData.job = job.trim();
    if (age !== undefined) updateData.age = Number(age);

    console.log('Update data to apply:', updateData);

    // Update and save the user
    user.set(updateData);
    console.log('Before save, user data:', {
      bio: user.bio,
      livingArea: user.livingArea,
      japaneseLevel: user.japaneseLevel,
      vietnameseLevel: user.vietnameseLevel,
      interests: user.interests,
      profilePicture: user.profilePicture,
    });

    await user.save();
    console.log('User saved successfully');

    // Return updated user (exclude password)
    const updatedUser = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      provider: user.provider,
      role: user.role,
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('=== Profile update request END - SUCCESS ===');
    console.log('Response user:', updatedUser);
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;