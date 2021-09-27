import * as yup from 'yup';
import {Request, Response} from 'express';
import {Users} from '../../components/User';
import {Route} from '../../utils/route';
import {RouteType} from '../../types/routes';

const schema = yup
  .object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })
  .required();

export default class CreateUser extends Route {
  requiresAuth = false;

  constructor() {
    super(RouteType.POST, '/users');
  }

  async handle(req: Request, _res: Response) {
    const validData = await schema.validate(req.body);

    const user = await Users.create(validData.email, validData.password);

    return {...user, password: undefined, salt: undefined};
  }
}
