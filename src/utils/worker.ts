import { Worker } from 'worker_threads';

import { logger } from '@/utils/logger';

type RunWorkerArgs<T> = {
  onError?: (error: Error) => void;
  onMessage?: (value: any) => void;
  path: string;
  workerData: T;
}

export const runWorker = <T> ({ path, workerData, onMessage, onError }: RunWorkerArgs<T>): Worker => {
  const worker = new Worker(path, { workerData });

  worker.on('message', value => onMessage && onMessage(value));
  worker.on('error', error => onError && onError(error));
  worker.on('exit', code => {
    const message = `Worker has stopped with code ${code}`;
    logger.debug(message);
    if (code !== 0 && onError) {
      onError(new Error(message));
    }
  });

  return worker;
};
