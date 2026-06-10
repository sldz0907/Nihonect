export function mustGetEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not set in environment variables.`);
  }
  return value;
}

export function getJwtSecret(): string {
  return mustGetEnv('JWT_SECRET');
}
