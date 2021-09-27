import {Request} from 'express';
import jwt from 'jsonwebtoken';
import {SecureUser, User} from '../types/user';
import {JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET} from '../utils/constants';
import {DBrefreshTokens} from '../utils/databases';
import {ControlledError} from '../utils/errors';
import {logger} from '../utils/logger';
import crypto from 'crypto';

export class Auth {
  /**
   * Authorise a token present on a request header
   */
  public static authorise(req: Request): void {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ControlledError(`You must be authenticated`, {}, 403);
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET);
      req.user = user as SecureUser;
    } catch (e) {
      throw new ControlledError(`You must be authenticated`, {}, 403);
    }
  }

  /**
   * Authenticate a user by comparing passwords
   */
  public static authenticate(user: User, submittedPassword: string): {accessToken: string; refreshToken: string} {
    if (!user) {
      throw new ControlledError(`Invalid email / password`, {}, 403);
    }

    const hash = crypto.pbkdf2Sync(submittedPassword, user.salt, 1000, 64, `sha512`).toString(`hex`);
    if (hash === user.password) {
      const accessToken = jwt.sign({...user, password: undefined}, JWT_ACCESS_TOKEN_SECRET, {expiresIn: '20m'});
      const refreshToken = jwt.sign({...user, password: undefined}, JWT_REFRESH_TOKEN_SECRET); // NOTE: could apply a TTL for additional security
      DBrefreshTokens.push(refreshToken);

      return {accessToken, refreshToken};
    } else {
      throw new ControlledError(`Invalid email / password`, {}, 403);
    }
  }

  /**
   * Refresh a JWT token
   */
  public static refresh(token: string): string {
    if (!DBrefreshTokens.includes(token)) {
      throw new ControlledError(`Invalid token`, {}, 403);
    }

    try {
      const user = jwt.verify(token, JWT_REFRESH_TOKEN_SECRET);
      const accessToken = jwt.sign(user, JWT_ACCESS_TOKEN_SECRET, {expiresIn: '20m'});
      return accessToken;
    } catch (e) {
      logger.error(e);
      throw new ControlledError(`Invalid token`, {}, 403);
    }
  }
}
