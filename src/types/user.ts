export interface User {
  id: string;
  email: string;
  password: string;
  salt: string;
  admin: boolean;
}

/**
 * User object with credentials taken out
 */
export type SecureUser = Omit<User, 'salt' | 'password'>;
