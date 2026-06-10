import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../../../lib/cloudinary.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/', (req, res) => res.status(200).json({ message: 'Admin route allowed.' }));
router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.getUsers);
router.put('/users/:userId/status', AdminController.updateStatus);
router.delete('/users/:userId', AdminController.deleteUser);
router.post('/events', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    next();
  });
}, AdminController.createEvent);
router.delete('/events/:eventId', AdminController.deleteEvent);
router.post('/events/:eventId/notify', AdminController.notifyEvent);

export default router;
