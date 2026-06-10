import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { ReviewModel } from '../models/Review.js';

const router = Router();
router.use(requireAuth);

router.post('/:targetId', async (req: Request, res: Response): Promise<any> => {
  try {
    const reviewerId = req.auth!.sub;
    const { targetId } = req.params;
    const { rating, categories, text } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating' });
    }

    const review = new ReviewModel({
      reviewerId, targetId, rating,
      categories: categories || [],
      text: text || ''
    });

    await review.save();
    return res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
