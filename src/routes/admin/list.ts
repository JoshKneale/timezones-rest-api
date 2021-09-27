import {RouteType} from '../../types/routes';
import {Route} from '../../utils/route';
import {Request, Response} from 'express';
import {Timezone} from '../../types/timezone';
import {Timezones} from '../../components/Timezones';
import {ControlledError} from '../../utils/errors';
import * as yup from 'yup';

const schema = yup
  .object({
    userId: yup.string().required(),
  })
  .required();

export default class AdminListTimezones extends Route {
  constructor() {
    super(RouteType.GET, '/admin/timezones/:userId');
  }

  async handle(req: Request, _res: Response): Promise<{timezones: Timezone[]}> {
    // Validate admin permissions
    if (!req.user || !req.user.admin) {
      throw new ControlledError(`You are not authorised to make this action`, {}, 401);
    }

    const validData = await schema.validate(req.params);

    return {timezones: Timezones.list(validData.userId)};
  }
}
