export const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

export enum View {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  RESET_PASSWORD = 'RESET_PASSWORD',
  FEED = 'FEED',
  BUDDIES = 'BUDDIES',
  MESSAGES = 'MESSAGES',
  EVENTS = 'EVENTS',
  PROFILE_SETTINGS = 'PROFILE_SETTINGS',
  BUDDY_PROFILE = 'BUDDY_PROFILE',
  REVIEW = 'REVIEW',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_EVENTS = 'ADMIN_EVENTS',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  REPORT_QUEUE = 'REPORT_QUEUE',
}

export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  profilePicture?: string;
  bio?: string;
  livingArea?: string;
  japaneseLevel?: string;
  vietnameseLevel?: string;
  interests?: string[];
  location?: string;
  nationality?: string;
  job?: string;
  age?: number;
  status?: 'active' | 'banned';
}

export interface Buddy {
  id: string;
  name: string;
  avatar: string;
  location: string;
  matchPercentage: number;
  tags: string[];
  bio: string;
  role: 'Vietnamese Native' | 'Japanese Native';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  category: string;
  description: string;
}
