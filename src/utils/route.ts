import express from 'express';
import {ValidationError} from 'yup';
import {Auth} from '../components/Auth';
import {ENVIRONMENT} from '../types/environment';
import {RouteType} from '../types/routes';
import {NODE_ENV} from './constants';
import {ControlledError} from './errors';
import {logger} from './logger';

export abstract class Route {
  /** Whether or not a route requires authentication, defaults to true */
  protected requiresAuth = true;

  public readonly routeType: RouteType;
  public readonly path: string;

  protected constructor(routeType: RouteType, path: string) {
    this.routeType = routeType;
    this.path = path;
    this._handle = this._handle.bind(this);
  }

  async _handle(req: express.Request, res: express.Response): Promise<void> {
    const startTime = new Date().getTime();

    try {
      logger.info(
        {
          data: req.body.args ? {...req.body.args, password: null} : undefined, // Remove any passwords sent
        },
        `${this.routeType} - ${this.path} called`,
      );

      if (this.requiresAuth) {
        Auth.authorise(req);
      }

      const response = await this.handle(req, res);

      const diff = new Date().getTime() - startTime;
      logger.info(`${this.path} response time: ${diff} ms`);

      res.status(200).json(response);
    } catch (e) {
      logger.warn(
        {
          stack: e.stack || e,
        },
        e.message,
      );

      /**
       * Controlled Error will need to be thrown in the event of where the problem is not internal
       * and the user needs to be served an error message
       */
      if (e instanceof ControlledError) {
        return void res.status(e.httpCode).send({
          error: {
            message: e.message,
            data: e.data,
          },
        });
        /**
         * Validation error is thrown by yup and returns just the field name. Therefore just changing the message
         * a bit to make it more usable for the client (e.g Last Name instead of lastName)
         */
      } else if (e instanceof ValidationError) {
        const parts = e.message.split(' ');
        const fieldName = parts[0].replace(/([a-z])([A-Z])/g, '$1 $2');
        return void res.status(400).send({
          error: {
            type: 'ValidationError',
            message: `${fieldName[0]?.toUpperCase() + fieldName.slice(1) || fieldName} ${parts.splice(1).join(' ')}`,
          },
        });
        /**
         * Everything else that is server based and internal will be caught here.
         * In develop the actual error will be served back where-as in prod internal messages are abstracted to
         * the below.
         */
      } else {
        return void res.status(500).send({
          error: {
            message: NODE_ENV === ENVIRONMENT.PROD ? 'An internal server error has occured.' : e.message,
            stack: NODE_ENV === ENVIRONMENT.PROD ? undefined : e.stack || e,
          },
        });
      }
    }
  }

  abstract handle(req: express.Request, res: express.Response): Promise<unknown>;
}
