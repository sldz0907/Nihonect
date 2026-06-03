export type AuthProvider = 'local' | 'google' | 'facebook';
export type AppRole = 'user' | 'admin';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AppRole;
}

