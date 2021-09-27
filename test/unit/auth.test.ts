import {Auth} from '../../src/components/Auth';
import jwt from 'jsonwebtoken';
import {JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET} from '../../src/utils/constants';
import {Request} from 'express';
import {ControlledError} from '../../src/utils/errors';
import {expect} from 'chai';
import {User} from '../../src/types/user';
import {DBrefreshTokens} from '../../src/utils/databases';
import crypto from 'crypto';

describe('Auth', () => {
  describe('authorise', () => {
    it('Should correctly authorise a request', () => {
      const accessToken = jwt.sign({email: '', id: ''}, JWT_ACCESS_TOKEN_SECRET, {expiresIn: '20m'});
      const mockRequest = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      } as Request;
      Auth.authorise(mockRequest);
    });

    it('Should throw an error in the case of no header passed', () => {
      const mockRequest = {
        headers: {},
      } as Request;
      expect(() => Auth.authorise(mockRequest)).to.throw(ControlledError, 'You must be authenticated');
    });

    it('Should throw an error on expired token', () => {
      const accessToken = jwt.sign({email: '', id: ''}, JWT_ACCESS_TOKEN_SECRET, {expiresIn: '-1h'});
      const mockRequest = {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      } as Request;
      expect(() => Auth.authorise(mockRequest)).to.throw(ControlledError, 'You must be authenticated');
    });
  });

  describe('authenticate', () => {
    it('Should correctly authenticate a user', () => {
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync('password', salt, 1000, 64, `sha512`).toString(`hex`);
      const mockUser: User = {
        id: '12345',
        admin: false,
        email: 'test@test.com',
        password,
        salt,
      };
      const tokens = Auth.authenticate(mockUser, 'password');

      expect(tokens).to.be.a('object');
      expect(tokens.accessToken).to.be.a('string');
      expect(tokens.refreshToken).to.be.a('string');
    });

    it('Should throw an error on no user passed (no user found)', () => {
      expect(() => Auth.authenticate(undefined as unknown as User, 'password')).to.throw(
        ControlledError,
        'Invalid email / password',
      );
    });

    it('Should throw an error on invalid password', () => {
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync('incorrect', salt, 1000, 64, `sha512`).toString(`hex`);

      const mockUser: User = {
        id: '12345',
        admin: false,
        email: 'test@test.com',
        password,
        salt,
      };
      expect(() => Auth.authenticate(mockUser, 'password')).to.throw(ControlledError, 'Invalid email / password');
    });
  });

  describe('refresh', () => {
    it('Should correctly refresh a token', () => {
      const refreshToken = jwt.sign({email: '', id: ''}, JWT_REFRESH_TOKEN_SECRET);
      DBrefreshTokens.push(refreshToken);

      const newAccessToken = Auth.refresh(refreshToken);

      expect(newAccessToken).to.be.a('string');

      DBrefreshTokens.pop();
    });

    it('Should throw an error on attempting to refresh an invalid token', () => {
      const refreshToken = jwt.sign({email: '', id: ''}, JWT_REFRESH_TOKEN_SECRET);

      expect(() => Auth.refresh(refreshToken)).to.throw(ControlledError, 'Invalid token');
    });
  });
});
