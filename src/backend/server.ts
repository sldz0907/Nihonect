import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { upload } from '../../lib/cloudinary.js';
import mongoose, { InferSchemaType, Model } from 'mongoose';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

/**
 * Backend single-file entry.
 *
 * - Edit API routes here: Auth, protected routes, etc.
 * - Edit DB schema/model here: User schema.
 * - Run: npm run server
 */

// -------------------------
// Config helpers
// -------------------------
function mustGetEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set in environment variables.`);
  }
  return value;
}

function getJwtSecret(): string {
  return mustGetEnv('JWT_SECRET');
}

// -------------------------
// Database connection
// -------------------------
let isConnected = false;
async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  const mongoUri = mustGetEnv('MONGODB_URI');
  await mongoose.connect(mongoUri);
  isConnected = true;
}

// -------------------------
// User model (Mongoose)
// -------------------------
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function requiredPassword(this: { provider: string }) {
        return this.provider === 'local';
      },
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook', 'line'],
      default: 'local',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    profilePicture: { type: String, default: null },
    bio: { type: String, trim: true, maxlength: 300, default: null },
    livingArea: { type: String, trim: true, default: null },
    japaneseLevel: { type: String, trim: true, default: null },
    vietnameseLevel: { type: String, trim: true, default: null },
    interests: { type: [String], default: [] },
    nationality: { type: String, trim: true },
    location: { type: String, trim: true },
    job: { type: String, trim: true },
    age: { type: Number, min: 0 },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    previousRecommendations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

type UserDocument = InferSchemaType<typeof userSchema>;
const UserModel =
  (mongoose.models.User as Model<UserDocument>) || mongoose.model<UserDocument>('User', userSchema);

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    translatedText: { type: String },
  },
  { timestamps: true }
);

const MessageModel = mongoose.model('Message', messageSchema);

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    categories: [{ type: String }],
    text: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model('Review', reviewSchema);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

const EventModel = mongoose.model('Event', eventSchema);

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model('Notification', notificationSchema);

// -------------------------
// Auth middleware
// -------------------------
type JwtPayload = { sub: string; email: string; role: 'user' | 'admin' };

const activeUsers = new Map<string, number>();

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    req.auth = payload;
    if (payload && payload.sub) {
      activeUsers.set(payload.sub, Date.now());
    }
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
}

// -------------------------
// Express app + routes
// -------------------------
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
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
      role: 'user',
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '7d' },
    );

    activeUsers.set(user.id.toString(), Date.now());

    return res.status(201).json({
      token,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ message });
  }
});

app.post('/api/auth/login', async (req, res) => {
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

    activeUsers.set(user.id.toString(), Date.now());

    return res.status(200).json({
      token,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    return res.status(500).json({ message });
  }
});

// Extend Request for multer inside server.ts
interface MulterRequest extends Request {
  file?: {
    path: string;
    [key: string]: any;
  };
}

app.put('/api/users/profile', requireAuth, (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, async (req: MulterRequest, res: Response) => {
  try {
    const userId = req.auth!.sub;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile update req.body:', req.body);

    const updateData: any = {};
    if (req.file) {
      updateData.profilePicture = req.file.path;
    } else if (req.body.removeProfilePicture === 'true') {
      updateData.profilePicture = null;
    }

    const { fullName, bio, livingArea, japaneseLevel, vietnameseLevel, interests, nationality, location, job, age } = req.body;
    if (typeof fullName === 'string' && fullName.trim() !== '') updateData.fullName = fullName.trim();
    if (typeof bio === 'string') updateData.bio = bio.trim();
    if (typeof livingArea === 'string') updateData.livingArea = livingArea.trim();
    if (typeof japaneseLevel === 'string') updateData.japaneseLevel = japaneseLevel.trim();
    if (typeof vietnameseLevel === 'string') updateData.vietnameseLevel = vietnameseLevel.trim();

    if (interests !== undefined) {
      try {
        const parsedInterests = JSON.parse(interests);
        if (Array.isArray(parsedInterests)) {
          updateData.interests = parsedInterests;
        } else {
          return res.status(400).json({ message: 'Interests must be an array.' });
        }
      } catch (error) {
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
      id: user.id,
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
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/dashboard', requireAuth, (req, res) => {
  res.status(200).json({ message: 'Dashboard data allowed.', auth: req.auth });
});

async function getRecommendationsList(currentUser: any, limit: number = 20) {
  const currentNationality = currentUser.nationality || '';
  const targetNationality = currentNationality === 'Vietnamese' ? 'Japanese' : (currentNationality === 'Japanese' ? 'Vietnamese' : '');
  const friendsIds = currentUser.friends || [];

  return await UserModel.aggregate([
    {
      $match: {
        _id: { $ne: currentUser._id, $nin: friendsIds },
        role: 'user'
      }
    },
    {
      $addFields: {
        nationalityScore: {
          $cond: [
            { $eq: ["$nationality", targetNationality] },
            30,
            0
          ]
        },
        locationScore: {
          $cond: [
            {
              $and: [
                { $ne: ["$livingArea", null] },
                { $eq: ["$livingArea", currentUser.livingArea] }
              ]
            },
            20,
            0
          ]
        },
        sharedInterestsScore: {
          $multiply: [
            { $size: { $setIntersection: [{ $ifNull: ["$interests", []] }, { $ifNull: [currentUser.interests, []] }] } },
            10
          ]
        },
        mutualFriendsScore: {
          $multiply: [
            { $size: { $setIntersection: [{ $ifNull: ["$friends", []] }, friendsIds] } },
            15
          ]
        }
      }
    },
    {
      $addFields: {
        matchScore: {
          $add: ["$nationalityScore", "$locationScore", "$sharedInterestsScore", "$mutualFriendsScore"]
        }
      }
    },
    {
      $sort: { matchScore: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        password: 0
      }
    }
  ]);
}

app.get('/api/users/recommendations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const currentUser = await UserModel.findById(userId).lean();

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recommendations = await getRecommendationsList(currentUser, 20);

    const buddies = recommendations.map(rec => {
      const matchPercentage = Math.min(98, Math.max(40, 40 + rec.matchScore));

      let roleLabel = 'MEMBER';
      if (rec.nationality === 'Japanese') roleLabel = 'JAPANESE NATIVE';
      else if (rec.nationality === 'Vietnamese') roleLabel = 'VIETNAMESE NATIVE';

      return {
        id: rec._id,
        name: rec.fullName,
        avatar: rec.profilePicture,
        location: rec.livingArea || rec.location || 'Hanoi',
        matchPercentage,
        tags: rec.interests || [],
        bio: rec.bio || 'よろしくお願いします！',
        role: roleLabel,
        nationality: rec.nationality
      };
    });

    res.json({ buddies });
  } catch (error: any) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch recommendations' });
  }
});

// --- TSUNAGU APIs ---

app.post('/api/users/request/:targetUserId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    const [user, targetUser] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetUserId)
    ]);

    if (!user || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(targetUserId as any)) {
      return res.status(400).json({ message: 'Already friends' });
    }
    if (user.sentRequests.includes(targetUserId as any)) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    user.sentRequests.push(targetUserId as any);
    targetUser.pendingRequests.push(userId as any);

    await Promise.all([user.save(), targetUser.save()]);

    res.json({ message: 'Request sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/accept/:requesterId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { requesterId } = req.params;

    const [user, requester] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(requesterId)
    ]);

    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    if (!user.friends.includes(requesterId as any)) user.friends.push(requesterId as any);
    if (!requester.friends.includes(userId as any)) requester.friends.push(userId as any);

    await Promise.all([user.save(), requester.save()]);

    res.json({ message: 'Request accepted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/decline/:requesterId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { requesterId } = req.params;

    const [user, requester] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(requesterId)
    ]);

    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), requester.save()]);

    res.json({ message: 'Request declined' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/dashboard-stats', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeCommunityCount = await UserModel.countDocuments({ role: 'user' });
    const friendsCount = (user.friends || []).length;

    // Calculate new recommended users in the top 20
    const recommendations = await getRecommendationsList(user, 20);
    const currentIds = recommendations.map(rec => rec._id.toString());
    const previousIds = ((user as any).previousRecommendations || []).map((id: any) => id.toString());
    const newMatchesCount = currentIds.filter(id => !previousIds.includes(id)).length;

    // Update previousRecommendations list in DB
    await UserModel.updateOne({ _id: userId }, { previousRecommendations: currentIds });

    let nearbyUsersCount = 0;
    if (user.livingArea) {
      nearbyUsersCount = await UserModel.countDocuments({
        livingArea: user.livingArea,
        _id: { $ne: user._id },
        role: 'user'
      });
    }

    res.json({ activeCommunityCount, newMatchesCount, nearbyUsersCount, friendsCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/friends', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const user = await UserModel.findById(userId).populate('friends', '_id fullName profilePicture nationality japaneseLevel vietnameseLevel');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const friends = (user.friends as any[]).map(friend => ({
      id: friend._id,
      fullName: friend.fullName,
      profilePicture: friend.profilePicture,
      nationality: friend.nationality,
      japaneseLevel: friend.japaneseLevel,
      vietnameseLevel: friend.vietnameseLevel,
      isOnline: activeUsers.has(friend._id.toString()) && (Date.now() - (activeUsers.get(friend._id.toString()) || 0) < 300000)
    }));

    res.json({ friends });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/notifications', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const user = await UserModel.findById(userId).populate('pendingRequests', 'fullName profilePicture');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requests = (user.pendingRequests as any[]).map(r => ({
      id: r._id,
      name: r.fullName,
      avatar: r.profilePicture,
      type: 'friend_request'
    }));

    const eventNotifs = await NotificationModel.find({
      type: 'new_event',
      readBy: { $ne: userId }
    }).sort({ createdAt: -1 });

    const notifications = eventNotifs.map(n => ({
      id: n._id,
      name: n.title,
      avatar: null, // we can handle this in UI
      type: 'new_event',
      message: n.message,
      relatedId: n.relatedId
    }));

    res.json({ requests: [...requests, ...notifications] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await NotificationModel.findByIdAndUpdate(id, { $addToSet: { readBy: userId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin', requireAuth, requireAdmin, (_req, res) => {
  res.status(200).json({ message: 'Admin route allowed.' });
});

// Admin Dashboard Stats
app.get('/api/admin/stats', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalUsers = await UserModel.countDocuments({ role: 'user' });
    const activeEvents = await EventModel.countDocuments({});

    const usersWithFriends = await UserModel.aggregate([
      { $project: { friendsCount: { $size: { $ifNull: ["$friends", []] } } } },
      { $group: { _id: null, total: { $sum: "$friendsCount" } } }
    ]);
    const newMatches = usersWithFriends.length > 0 ? Math.floor(usersWithFriends[0].total / 2) : 0;

    const reports = 0; // Default to 0 for now as requested

    const recentUsers = await UserModel.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName createdAt');

    const recentLogs = recentUsers.map(u => ({
      time: (u as any).createdAt,
      text: `新規ユーザー(${u.fullName})が登録しました。`
    }));

    // User growth analytics (registrations by month for the current year)
    const currentYear = new Date().getFullYear();
    const monthlyRegistrations = await UserModel.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]);

    const usersBeforeThisYear = await UserModel.countDocuments({
      role: 'user',
      createdAt: { $lt: new Date(`${currentYear}-01-01`) }
    });

    const growthData = Array(12).fill(0);
    let runningTotal = usersBeforeThisYear;
    for (let month = 0; month < 12; month++) {
      const monthData = monthlyRegistrations.find(item => item._id === month + 1);
      if (monthData) {
        runningTotal += monthData.count;
      }
      growthData[month] = runningTotal;
    }

    res.json({
      stats: { totalUsers, activeEvents, newMatches, reports },
      recentLogs,
      growthData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin User Management
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role, nationality, status } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (nationality) filter.nationality = nationality;
    if (status) filter.status = status;

    const users = await UserModel.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/users/:userId/status', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User status updated', user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:userId', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also cleanup reviews and messages involving this user
    await ReviewModel.deleteMany({ $or: [{ reviewerId: userId }, { targetId: userId }] });
    await MessageModel.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Event Orchestration
app.post('/api/admin/events', requireAuth, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, async (req: MulterRequest, res: Response) => {
  try {
    const { title, description, date, location, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Event image is required' });
    }

    const newEvent = new EventModel({
      title,
      description,
      date,
      location,
      category,
      image: req.file.path,
      createdBy: req.auth!.sub,
      attendees: []
    });

    await newEvent.save();

    const notif = new NotificationModel({
      type: 'new_event',
      title: '新しいイベントが作成されました',
      message: title,
      relatedId: newEvent._id
    });
    await notif.save();

    res.status(201).json({ message: 'Event created successfully', event: newEvent });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find().sort({ date: 1 }).populate('createdBy', 'fullName profilePicture');
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/join', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const event = await EventModel.findById(id);

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.attendees.includes(userId as any)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    event.attendees.push(userId as any);
    await event.save();

    res.json({ message: 'Successfully joined the event', event });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/:buddyId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { buddyId } = req.params;

    const messages = await MessageModel.find({
      $or: [
        { senderId: userId, receiverId: buddyId },
        { senderId: buddyId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/profile/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;

    const [user, targetUser, reviews] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(id),
      ReviewModel.find({ targetId: id }).populate('reviewerId', 'fullName profilePicture').sort({ createdAt: -1 })
    ]);

    if (!targetUser || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate match percentage based on shared interests
    let matchPercentage = 50; // base score
    if (user.interests && targetUser.interests) {
      const sharedInterests = user.interests.filter(i => targetUser.interests.includes(i));
      matchPercentage += sharedInterests.length * 10;
      if (matchPercentage > 99) matchPercentage = 99;
    }

    // Calculate average rating
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r as any).rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    res.json({
      profile: {
        id: targetUser._id,
        fullName: targetUser.fullName,
        profilePicture: targetUser.profilePicture,
        bio: targetUser.bio,
        livingArea: targetUser.livingArea,
        japaneseLevel: targetUser.japaneseLevel,
        vietnameseLevel: targetUser.vietnameseLevel,
        interests: targetUser.interests || [],
        nationality: targetUser.nationality,
        matchPercentage,
        avgRating,
        reviewCount: reviews.length,
      },
      reviews: reviews.map(r => ({
        id: r._id,
        reviewerName: (r.reviewerId as any)?.fullName || 'Unknown',
        reviewerAvatar: (r.reviewerId as any)?.profilePicture,
        rating: r.rating,
        text: r.text,
        date: r.createdAt
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews/:targetId', requireAuth, async (req: Request, res: Response) => {
  try {
    const reviewerId = req.auth!.sub;
    const { targetId } = req.params;
    const { rating, categories, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }

    const review = new ReviewModel({
      reviewerId,
      targetId,
      rating,
      categories: categories || [],
      text: text || ''
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------
// Bootstrap
// -------------------------
async function bootstrap() {
  const PORT = process.env.PORT || 4000;
  connectToDatabase().catch(err => {
    console.error('MongoDB connection error:', err);
  });

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // allow all origins for dev
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_chat', ({ userId, buddyId }) => {
      const room = [userId, buddyId].sort().join('_');
      socket.join(room);
    });

    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, text } = data;
        const room = [senderId, receiverId].sort().join('_');

        let translatedText = '';
        try {
          // Check if the message contains Japanese characters (Hiragana, Katakana, Kanji)
          const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
          // If Japanese, translate to Vietnamese. Otherwise, translate to Japanese.
          const targetLang = isJapanese ? 'vi' : 'ja';

          try {
            const url = `https://translate.googleapis.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLang}&q=${encodeURIComponent(text)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json && json[0] && typeof json[0][0] === 'string') {
              translatedText = json[0][0];
            }
          } catch (googleError: any) {
            console.error('Google Translate dict-chrome-ex failed, falling back to gtx...', googleError.message);
            const fallbackUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const fbRes = await fetch(fallbackUrl);
            const fbJson = await fbRes.json();
            if (fbJson && fbJson[0]) {
              translatedText = fbJson[0].map((item: any) => item[0]).join('');
            }
          }
        } catch (translateError) {
          console.error('Translation failed:', translateError);
        }

        const message = new MessageModel({ senderId, receiverId, text, translatedText });
        await message.save();
        io.to(room).emit('receive_message', message);
      } catch (e) {
        console.error('Socket send_message error:', e);
      }
    });

    socket.on('delete_message', async (data) => {
      try {
        const { messageId, senderId, receiverId } = data;
        const msg = await MessageModel.findById(messageId);
        if (msg && msg.senderId.toString() === senderId) {
          await MessageModel.findByIdAndDelete(messageId);
          const room = [senderId, receiverId].sort().join('_');
          io.to(room).emit('message_deleted', messageId);
        }
      } catch (e) {
        console.error('Socket delete_message error:', e);
      }
    });
  });

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
});
