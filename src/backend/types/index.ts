export type JwtPayload = { sub: string; email: string; role: 'user' | 'admin' };

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}
