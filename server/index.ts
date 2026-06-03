import 'dotenv/config';
import express from 'express';
import { connectToDatabase } from './config/database';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import { requireAdmin, requireAuth } from './middleware/auth';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.get('/api/dashboard', requireAuth, (req, res) => {
  res.status(200).json({ message: 'Dashboard data allowed.', auth: req.auth });
});

app.get('/api/admin', requireAuth, requireAdmin, (_req, res) => {
  res.status(200).json({ message: 'Admin route allowed.' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('GLOBAL ERROR:', err);
  require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + (err.stack || err.message) + '\n');
  res.status(500).json({ error: err.message || 'Internal server error from global handler' });
});

async function bootstrap() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

