import {RouteType} from '../../types/routes';
import {Route} from '../../utils/route';
import {Request, Response} from 'express';
import * as yup from 'yup';
import {Timezones} from '../../components/Timezones';

const schema = yup
  .object({
    timezone: yup.string().required(),
  })
  .required();

export default class DeleteTimezone extends Route {
  constructor() {
    super(RouteType.DELETE, '/timezones');
  }

  async handle(req: Request, _res: Response) {
    const userId = req.user.id;
    const validData = await schema.validate(req.body);

    const timezones = Timezones.delete(userId, validData.timezone);

    return {timezones};
  }
}
