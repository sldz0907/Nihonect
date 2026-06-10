import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { EventModel } from '../models/Event.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  try {
    const events = await EventModel.find().sort({ date: 1 }).populate('createdBy', 'fullName profilePicture');
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/join', async (req: Request, res: Response): Promise<any> => {
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
    return res.json({ message: 'Successfully joined the event', event });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
