import {expect} from 'chai';
import {Users} from '../../src/components/User';
import {User} from '../../src/types/user';
import {DBusers} from '../../src/utils/databases';
import {ControlledError} from '../../src/utils/errors';
import crypto from 'crypto';

describe('User', () => {
  beforeEach(() => {
    // Clear all users
    DBusers.length = 0;
  });

  describe('getByEmail', () => {
    it('Should return a user when passed an existing email address', async () => {
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync('password', salt, 1000, 64, `sha512`).toString(`hex`);

      const mockUser: User = {
        id: '12345',
        admin: false,
        email: 'test@test.com',
        password,
        salt,
      };

      DBusers.push(mockUser);
      const user = await Users.getByEmail('test@test.com');

      expect(user).to.exist;
      expect(user.id).to.equal('12345');
      expect(user.admin).to.equal(false);
      expect(user.email).to.equal('test@test.com');
      expect(user.password).to.be.a('string');
    });
    it('Should throw an error when no user is found', async () => {
      const email = 'test@test.com';

      Users.getByEmail(email)
        .then(() => {
          throw new Error('Not supposed to succeed.');
        })
        .catch(e => {
          expect(e).to.be.an.instanceOf(ControlledError);
          expect(e.message).to.equal(`Cannot find user with email: ${email}`);
        });
    });
  });

  describe('create', () => {
    it('Should create a new non-admin user', async () => {
      const email = 'test@test.com';
      const password = 'password';

      const user = await Users.create(email, password);

      expect(user).to.exist;
      expect(user.id).to.be.a('string');
      expect(user.admin).to.equal(false);
      expect(user.email).to.equal('test@test.com');
      expect(user.password).to.be.a('string');

      DBusers.pop();
    });

    it('Should throw an error on existing email address', async () => {
      const email = 'test@test.com';
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync('password', salt, 1000, 64, `sha512`).toString(`hex`);

      const mockUser: User = {
        id: '12345',
        admin: false,
        email,
        password,
        salt,
      };

      DBusers.push(mockUser);

      Users.create(email, password)
        .then(() => {
          throw new Error('Not supposed to succeed.');
        })
        .catch(e => {
          expect(e).to.be.an.instanceOf(ControlledError);
          expect(e.message).to.equal(`Email already exists, please try logging in`);
        });
    });
  });
});
