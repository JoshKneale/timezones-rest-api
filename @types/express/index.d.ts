import {SecureUser} from '../../src/types/user';

declare global {
  namespace Express {
    interface Request {
      user: SecureUser;
    }
  }
}
