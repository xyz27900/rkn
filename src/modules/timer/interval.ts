import { Timeout } from '@/modules/timer/timeout';
import { logger } from '@/utils/logger';

const prettifyTime = (milliseconds: number): string => {
  const day = Math.floor(milliseconds / 86400000);
  const hour = Math.floor(milliseconds / 3600000) % 24;
  const min = Math.floor(milliseconds / 60000) % 60;
  const s = Math.floor(milliseconds / 1000) % 60;
  const ms = Math.floor(milliseconds) % 1000;
  const time = { day, hour, min, s, ms };
  return Object.entries(time)
    .filter(([/* key */, value]) => value !== 0)
    .map(([key, value]) => `${value} ${key}`)
    .join(' ');
};

type SetIntervalOptions = { immediate: boolean };

export class Interval {
  private timeout: Timeout = new Timeout();
  private time: number;

  constructor(time: number) {
    this.time = time;
  }

  public get isRunning(): boolean {
    return this.timeout.isRunning;
  }

  public start(callback: () => void | Promise<void>, time: number, options?: SetIntervalOptions): void {
    logger.debug(`Scheduled new task with interval ${prettifyTime(time)}`);
    const execute = (): void => {
      this.timeout.start(() => {
        callback();
        execute();
      }, time);
    };

    if (options?.immediate) {
      logger.debug('Executing task immediate');
      callback();
    }

    execute();
  }

  public async stop(): Promise<boolean> {
    return await this.timeout.stop();
  }
}
