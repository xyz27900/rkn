import { Request, Response } from 'express';

import { Storage } from '@/modules/storage';
import { logger } from '@/utils/logger';

export const check = (storage: Storage) =>
  (req: Request, res: Response): void => {
    const { url } = req.query;
    if (typeof url !== 'string') {
      logger.warn('Bad request');
      res.sendStatus(400);
      return;
    }

    const blocked = storage.check(encodeURIComponent(url));
    res.send({ blocked });
  };
