import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { NotificationModel } from '../models/Notification.js';

const router = Router();
router.use(requireAuth);

router.post('/:id/read', async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await NotificationModel.findByIdAndUpdate(id, { $addToSet: { readBy: userId } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
