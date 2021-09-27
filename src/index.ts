import {logger} from './utils/logger';
import express from 'express';
import glob from 'glob';
import {promisify} from 'util';
import http from 'http';
import {PORT} from './utils/constants';
import {Route} from './utils/route';

let server: http.Server;

const start = async () => {
  const app = express();
  app.use(express.json());
  const globPromise = promisify(glob);

  // // Apply middleware
  // const middlewareFiles = await globPromise('./middleware/*.ts', {cwd: './src'});
  // middlewareFiles.forEach(file => {
  //   const x = require(file.replace(/\.[^/.]+$/, '')); // eslint-disable-line @typescript-eslint/no-var-requires
  //   if (x.default && typeof x.default === 'function') {
  //     logger.info(`Loading middleware from ${file}`);
  //     x.default(app);
  //   }
  // });

  // Apply routes
  const routeFiles = await globPromise('./routes/**/*.ts', {cwd: './src'});
  routeFiles.forEach(file => {
    const x = require(file.replace(/\.[^/.]+$/, '')); // eslint-disable-line @typescript-eslint/no-var-requires
    try {
      const routeClass = new x.default() as Route;
      app[routeClass.routeType](routeClass.path, routeClass._handle);
      logger.info(`Loaded route from ${file}`);
    } catch (e) {
      logger.error(`Could not load route from ${file}`);
    }
  });

  server = app.listen(PORT, () => {
    logger.info(`Service started on port ${PORT}`);
  });
};

start();

/**
 * Graceful process exit.
 */
const stop = async (signal: string) => {
  logger.info(`Received signal to terminate: ${signal}`);

  logger.info(`Stopping server...`);
  server.close(err => {
    if (err) {
      logger.error(err);
    }
    process.exit();
  });
};

// Exception logging
process.on('uncaughtException', function (err) {
  logger.error(err);
  throw err;
});

// Process termination handling
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
