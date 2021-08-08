import express, { Express, Request, Response } from 'express';

import { APP_PORT } from '@/config';
import { logger } from '@/utils/logger';

type ServerRouteHandler = (req: Request, res: Response) => void | Promise<void>;

export class Server {
  app: Express = express();

  public start(): void {
    this.app.listen(APP_PORT, () => {
      logger.info(`Server is running on :${APP_PORT}`);
    });
  }

  public get(route: string, handler: ServerRouteHandler): Express {
    return this.app.get(route, handler);
  }
}
