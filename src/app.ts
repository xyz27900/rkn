import { check } from '@/controllers/check';
import { Server } from '@/modules/server';
import { Storage } from '@/modules/storage';
import { logger } from '@/utils/logger';

const storage = new Storage();
storage.on('ready', () => {
  logger.info('Storage is ready');
  server.start();
});

const server = new Server();
server.get('/check', check(storage));

storage.start();
