import {RouteType} from '../../types/routes';
import {Route} from '../../utils/route';
import {Request, Response} from 'express';
import {Timezone} from '../../types/timezone';
import {Timezones} from '../../components/Timezones';

export default class ListTimezones extends Route {
  constructor() {
    super(RouteType.GET, '/timezones');
  }

  async handle(req: Request, _res: Response): Promise<{timezones: Timezone[]}> {
    const userId = req.user.id;

    return {timezones: Timezones.list(userId)};
  }
}
