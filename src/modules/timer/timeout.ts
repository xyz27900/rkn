import path from 'path';
import { Worker } from 'worker_threads';

import { runWorker } from '@/utils/worker';

type TimeoutWorkerData = { time: number };

export class Timeout {
  private static workerFilename = 'worker.js';
  private worker: Worker | null = null;

  public get isRunning(): boolean {
    return !!this.worker;
  }

  public start(callback: () => void | Promise<void>, time: number): void {
    const onMessage = (): void => {
      this.worker = null;
      callback();
    };
    this.worker = runWorker<TimeoutWorkerData>({
      onMessage,
      path: path.join(__dirname, Timeout.workerFilename),
      workerData: { time },
    });
  }

  public async stop(): Promise<boolean> {
    if (!this.worker) {
      return false;
    }

    await this.worker.terminate();
    this.worker = null;
    return true;
  }
}
