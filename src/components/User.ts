import {User} from '../types/user';
import {DBusers} from '../utils/databases';
import {v4 as uuidv4} from 'uuid';
import crypto from 'crypto';

export class Users {
  /**
   * Get a user by their email address
   */
  public static async getByEmail(email: string): Promise<User> {
    const user = DBusers.find(u => u.email === email);

    if (!user) {
      throw new Error(`Cannot find user with email: ${email}`);
    }

    return user;
  }

  /**
   * Create a new user
   */
  public static async create(email: string, password: string): Promise<User> {
    // Check for existing user
    const existingUser = DBusers.find(u => u.email === email);
    if (existingUser) {
      throw new Error(`Email already exists, please try logging in`);
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

    // Add new user to "DB"
    const newUser: User = {
      id: uuidv4(),
      email: email,
      password: hash,
      salt,
      admin: false,
    };
    DBusers.push(newUser);

    return newUser;
  }
}
