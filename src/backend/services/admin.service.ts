import { UserModel } from '../models/User.js';
import { EventModel } from '../models/Event.js';
import { ReviewModel } from '../models/Review.js';
import { MessageModel } from '../models/Message.js';
import { ReportModel } from '../models/Report.js';

export class AdminService {
  static async getStats() {
    const totalUsers = await UserModel.countDocuments({ role: 'user' });
    const activeEvents = await EventModel.countDocuments({});

    const usersWithFriends = await UserModel.aggregate([
      { $project: { friendsCount: { $size: { $ifNull: ["$friends", []] } } } },
      { $group: { _id: null, total: { $sum: "$friendsCount" } } }
    ]);
    const newMatches = usersWithFriends.length > 0 ? Math.floor(usersWithFriends[0].total / 2) : 0;

    const reports = await ReportModel.countDocuments({ status: 'pending' });

    const recentUsers = await UserModel.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName createdAt');

    const recentLogs = recentUsers.map((u: any) => ({
      time: u.createdAt,
      text: `新規ユーザー(${u.fullName})が登録しました。`
    }));

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

    return { stats: { totalUsers, activeEvents, newMatches, reports }, recentLogs, growthData };
  }

  static async getUsers(filter: any) {
    return UserModel.find(filter).select('-password').sort({ createdAt: -1 });
  }

  static async updateUserStatus(userId: string, status: string) {
    if (!['active', 'banned'].includes(status)) throw new Error('Invalid status');
    const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async deleteUser(userId: string) {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) throw new Error('User not found');
    await ReviewModel.deleteMany({ $or: [{ reviewerId: userId }, { targetId: userId }] });
    await MessageModel.deleteMany({ $or: [{ senderId: userId }, { receiverId: userId }] });
  }
}
