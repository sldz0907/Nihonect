import { Request, Response } from 'express';
import { ReportModel } from '../models/Report.js';
import { UserModel } from '../models/User.js';
import { NotificationModel } from '../models/Notification.js';

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportedUserId, type, description, severity } = req.body;
    const reporterId = (req as any).auth?.sub;

    if (!reportedUserId || !type || !description) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const reportedUser = await UserModel.findById(reportedUserId);
    if (!reportedUser) {
      res.status(404).json({ message: 'Reported user not found' });
      return;
    }

    const report = new ReportModel({
      reporter: reporterId,
      reportedUser: reportedUserId,
      type,
      description,
      severity: severity || 'medium'
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await ReportModel.find()
      .populate('reporter', 'fullName email profilePicture')
      .populate('reportedUser', 'fullName email profilePicture')
      .sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const report = await ReportModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }

    if (status === 'resolved') {
      const notification = new NotificationModel({
        type: 'report_resolved',
        title: '通報が解決されました',
        message: 'ご報告いただいた内容は管理者が確認し、適切に処理されました。ご協力ありがとうございます。 (Báo cáo của bạn đã được quản trị viên xử lý. Cảm ơn sự hợp tác của bạn.)',
        relatedId: report._id,
        targetUsers: [report.reporter]
      });
      await notification.save();
    }

    res.status(200).json({ message: 'Report updated successfully', report });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const report = await ReportModel.findByIdAndDelete(id);
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
