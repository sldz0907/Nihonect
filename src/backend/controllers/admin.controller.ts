import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import { EventModel } from '../models/Event.js';
import { NotificationModel } from '../models/Notification.js';

interface MulterRequest extends Request {
  file?: { path: string; [key: string]: any; };
}

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const data = await AdminService.getStats();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const { role, nationality, status } = req.query;
      const filter: any = {};
      if (role) filter.role = role;
      if (nationality) filter.nationality = nationality;
      if (status) filter.status = status;
      const users = await AdminService.getUsers(filter);
      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const user = await AdminService.updateUserStatus(req.params.userId, req.body.status);
      res.json({ message: 'User status updated', user });
    } catch (error: any) {
      const code = error.message === 'User not found' ? 404 : 400;
      res.status(code).json({ message: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      await AdminService.deleteUser(req.params.userId);
      res.json({ message: 'User and associated data deleted successfully' });
    } catch (error: any) {
      res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message });
    }
  }

  static async createEvent(req: MulterRequest, res: Response): Promise<any> {
    try {
      const { title, description, date, location, category, capacity, price, format, languageRequirement } = req.body;
      if (!req.file) return res.status(400).json({ message: 'Event image is required' });

      const newEvent = new EventModel({
        title, description, date, location, category,
        capacity: capacity ? parseInt(capacity) : 0,
        price: price || '無料', format: format || 'オフライン',
        languageRequirement: languageRequirement || '',
        image: req.file.path, createdBy: req.auth!.sub, attendees: []
      });
      await newEvent.save();

      const notif = new NotificationModel({
        type: 'new_event', title: '新しいイベントが作成されました',
        message: title, relatedId: newEvent._id
      });
      await notif.save();

      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteEvent(req: Request, res: Response): Promise<any> {
    try {
      const eventId = req.params.eventId;
      const event = await EventModel.findByIdAndDelete(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });
      res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async notifyEvent(req: Request, res: Response): Promise<any> {
    try {
      const eventId = req.params.eventId;
      const { message } = req.body;
      const event = await EventModel.findById(eventId);
      if (!event) return res.status(404).json({ message: 'Event not found' });

      if (!event.attendees || event.attendees.length === 0) {
        return res.status(400).json({ message: 'No attendees to notify' });
      }

      const notif = new NotificationModel({
        type: 'new_event', // Reusing this type so it shows the bell icon
        title: `イベントの変更: ${event.title}`,
        message: message,
        relatedId: event._id,
        targetUsers: event.attendees
      });
      await notif.save();

      res.json({ message: 'Notification sent successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
