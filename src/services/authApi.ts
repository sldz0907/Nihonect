export type ApiRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: ApiRole;
  provider: 'local' | 'google' | 'facebook' | 'line';
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
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function safeParseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function parseApiResponse<T>(response: Response, fallbackError: string): Promise<T> {
  const data = await safeParseJson<T & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(data?.message ?? `${fallbackError} (status ${response.status})`);
  }
  if (!data) {
    throw new Error('Invalid server response format.');
  }
  return data;
}

export async function registerWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, role: 'user' }),
    });
    return parseApiResponse<AuthResponse>(response, 'Register failed.');
  } catch {
    throw new Error('Cannot connect to auth server. Please ensure backend is running.');
  }
}

export async function loginWithEmail(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return parseApiResponse<AuthResponse>(response, 'Login failed.');
  } catch {
    throw new Error('Cannot connect to auth server. Please ensure backend is running.');
  }
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

