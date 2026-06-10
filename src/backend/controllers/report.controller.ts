import { Request, Response } from 'express';
import { ReportModel } from '../models/Report.js';
import { UserModel } from '../models/User.js';

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportedUserId, type, description, severity } = req.body;
    const reporterId = (req as any).user.id;

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
      .populate('reporter', 'name email avatar')
      .populate('reportedUser', 'name email avatar')
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

    res.status(200).json({ message: 'Report updated successfully', report });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
