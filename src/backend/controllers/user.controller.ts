import { Request, Response } from 'express';
import { UserService } from '../services/user.service.js';
import { UserModel } from '../models/User.js';
import { NotificationModel } from '../models/Notification.js';
import { activeUsers } from '../middlewares/auth.middleware.js';

export class UserController {
  static async getRecommendations(req: Request, res: Response) {
    try {
      const recommendations = await UserService.getRecommendations(req.auth!.sub);
      const buddies = recommendations.map((rec: any) => {
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
      res.status(error.message === 'User not found' ? 404 : 500).json({ error: error.message });
    }
  }

  static async sendRequest(req: Request, res: Response) {
    try {
      await UserService.sendRequest(req.auth!.sub, req.params.targetUserId);
      res.json({ message: 'Request sent successfully' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  static async acceptRequest(req: Request, res: Response) {
    try {
      await UserService.acceptRequest(req.auth!.sub, req.params.requesterId);
      res.json({ message: 'Request accepted' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  static async declineRequest(req: Request, res: Response) {
    try {
      await UserService.declineRequest(req.auth!.sub, req.params.requesterId);
      res.json({ message: 'Request declined' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ error: error.message });
    }
  }

  static async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.auth!.sub;
      const user = await UserModel.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const activeCommunityCount = await UserModel.countDocuments({ role: 'user' });
      const friendsCount = (user.friends || []).length;
      const recommendations = await UserService.getRecommendationsList(user, 20);
      const currentIds = recommendations.map((rec: any) => rec._id.toString());
      const previousIds = ((user as any).previousRecommendations || []).map((id: any) => id.toString());
      const newMatchesCount = currentIds.filter(id => !previousIds.includes(id)).length;

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
  }

  static async getFriends(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.auth!.sub).populate('friends', '_id fullName profilePicture nationality japaneseLevel vietnameseLevel');
      if (!user) return res.status(404).json({ message: 'User not found' });

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
  }

  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.auth!.sub;
      const user = await UserModel.findById(userId).populate('pendingRequests', 'fullName profilePicture');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const requests = (user.pendingRequests as any[]).map(r => ({
        id: r._id,
        name: r.fullName,
        avatar: r.profilePicture,
        type: 'friend_request'
      }));

      const eventNotifs = await NotificationModel.find({
        type: 'new_event',
        readBy: { $ne: userId },
        $or: [
          { targetUsers: { $exists: false } },
          { targetUsers: { $size: 0 } },
          { targetUsers: userId }
        ]
      }).sort({ createdAt: -1 });

      const notifications = eventNotifs.map(n => ({
        id: n._id,
        name: n.title,
        avatar: null,
        type: 'new_event',
        message: n.message,
        relatedId: n.relatedId
      }));

      res.json({ requests: [...requests, ...notifications] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const { targetUser, matchPercentage, avgRating, reviews } = await UserService.getProfile(req.auth!.sub, req.params.id);
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
        reviews: reviews.map((r: any) => ({
          id: r._id,
          reviewerName: r.reviewerId?.fullName || 'Unknown',
          reviewerAvatar: r.reviewerId?.profilePicture,
          rating: r.rating,
          text: r.text,
          date: r.createdAt
        }))
      });
    } catch (error: any) {
      res.status(error.message === 'User not found' ? 404 : 500).json({ error: error.message });
    }
  }
}
