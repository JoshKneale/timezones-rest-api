import * as yup from 'yup';
import {Request, Response} from 'express';
import {Route} from '../../utils/route';
import {RouteType} from '../../types/routes';
import {Auth} from '../../components/Auth';

const schema = yup
  .object({
    token: yup.string().required(),
  })
  .required();

/**
 * @swagger
 *
 * /default:
 *   get:
 *     summary: "Get default route"
 *     produces:
 *       - "application/json"
 *     responses:
 *       "200":
 *         description: "Returns welcome message."
 *         content:
 *           application/json
 */
export default class Refresh extends Route {
  requiresAuth = false;

  constructor() {
    super(RouteType.POST, '/refresh');
  }

  async handle(req: Request, _res: Response) {
    const validData = await schema.validate(req.body);

    const accessToken = Auth.refresh(validData.token);

    return {accessToken};
  }
}
