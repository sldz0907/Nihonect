import { UserModel } from '../models/User.js';
import { ReviewModel } from '../models/Review.js';

export class UserService {
  static async getRecommendationsList(currentUser: any, limit: number = 20) {
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

  static async getRecommendations(userId: string) {
    const currentUser = await UserModel.findById(userId).lean();
    if (!currentUser) throw new Error('User not found');
    return this.getRecommendationsList(currentUser, 20);
  }

  static async sendRequest(userId: string, targetUserId: string) {
    if (userId === targetUserId) throw new Error('Cannot send request to yourself');
    const [user, targetUser] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetUserId)
    ]);
    if (!user || !targetUser) throw new Error('User not found');
    if (user.friends.includes(targetUserId as any)) throw new Error('Already friends');
    if (user.sentRequests.includes(targetUserId as any)) throw new Error('Request already sent');

    user.sentRequests.push(targetUserId as any);
    targetUser.pendingRequests.push(userId as any);
    await Promise.all([user.save(), targetUser.save()]);
  }

  static async acceptRequest(userId: string, requesterId: string) {
    const [user, requester] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(requesterId)
    ]);
    if (!user || !requester) throw new Error('User not found');

    user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    if (!user.friends.includes(requesterId as any)) user.friends.push(requesterId as any);
    if (!requester.friends.includes(userId as any)) requester.friends.push(userId as any);

    await Promise.all([user.save(), requester.save()]);
  }

  static async declineRequest(userId: string, requesterId: string) {
    const [user, requester] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(requesterId)
    ]);
    if (!user || !requester) throw new Error('User not found');

    user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), requester.save()]);
  }

  static async getProfile(userId: string, targetId: string) {
    const [user, targetUser, reviews] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(targetId),
      ReviewModel.find({ targetId }).populate('reviewerId', 'fullName profilePicture').sort({ createdAt: -1 })
    ]);

    if (!targetUser || !user) throw new Error('User not found');

    let matchPercentage = 50;
    if (user.interests && targetUser.interests) {
      const sharedInterests = user.interests.filter(i => targetUser.interests.includes(i));
      matchPercentage += sharedInterests.length * 10;
      if (matchPercentage > 99) matchPercentage = 99;
    }

    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (r as any).rating, 0);
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    return { targetUser, matchPercentage, avgRating, reviews };
  }
}
