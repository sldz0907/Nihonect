import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { MessageModel } from '../models/Message.js';

const router = Router();
router.use(requireAuth);

router.get('/:buddyId', async (req: Request, res: Response) => {
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

export default router;
