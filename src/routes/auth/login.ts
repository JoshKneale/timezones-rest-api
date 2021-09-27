import * as yup from 'yup';
import {Request, Response} from 'express';
import {Users} from '../../components/User';
import {Auth} from '../../components/Auth';
import {Route} from '../../utils/route';
import {RouteType} from '../../types/routes';

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export default class Login extends Route {
  requiresAuth = false;

  constructor() {
    super(RouteType.POST, '/login');
  }

  async handle(req: Request, _res: Response) {
    const validData = await schema.validate(req.body);

    const user = await Users.getByEmail(validData.email);

    const tokens = Auth.authenticate(user, validData.password);

    return tokens;
  }
}
