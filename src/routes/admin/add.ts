import {RouteType} from '../../types/routes';
import {Route} from '../../utils/route';
import {Request, Response} from 'express';
import * as yup from 'yup';
import {Timezones} from '../../components/Timezones';
import {ControlledError} from '../../utils/errors';

const bodySchema = yup
  .object({
    timezone: yup.string().required(),
  })
  .required();

const paramsSchema = yup
  .object({
    userId: yup.string().required(),
  })
  .required();

export default class AdminAddTimezone extends Route {
  constructor() {
    super(RouteType.POST, '/admin/timezones/:userId');
  }

  async handle(req: Request, _res: Response) {
    // Validate admin permissions
    if (!req.user || !req.user.admin) {
      throw new ControlledError(`You are not authorised to make this action`, {}, 401);
    }

    const validParamData = await paramsSchema.validate(req.params);
    const validBodyData = await bodySchema.validate(req.body);

    const timezones = Timezones.add(validParamData.userId, validBodyData.timezone);

    return {timezones};
  }
}
