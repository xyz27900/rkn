import { parse } from 'tldts';

import { CHECK_INTERVAL } from '@/config';
import { CSVParser } from '@/modules/csvParser';
import { Emitter } from '@/modules/emitter';
import { Parser } from '@/modules/parser';
import { Interval } from '@/modules/timer/interval';
import { getDump } from '@/utils/files';
import { logger } from '@/utils/logger';

export class Storage extends Emitter<'ready' | 'update'> {
  private readonly parser: Parser = new Parser();
  private interval: Interval | null = null;
  private sha: string | null = null;

  public async getLatest(): Promise<void> {
    const isFirst = this.sha === null;
    if (isFirst) {
      logger.info('First run');
    }

    logger.info('Fetching data');
    const dump = await getDump();

    if (!dump) {
      logger.error('Error while fetching data');
      return;
    }

    const { sha, content } = dump;
    if (sha === this.sha) {
      logger.info('Data has not been updated');
      return;
    }

    logger.info('Updating data');
    this.sha = sha;
    const result = await CSVParser.parse(content);
    result.forEach(this.parser.processData.bind(this.parser));
    this.emit(isFirst ? 'ready' : 'update');
  }

  public check(value: string): boolean {
    const { hostname, isIp } = parse(value);
    if (!hostname) {
      logger.warn('Invalid hostname received');
      return false;
    }

    const record = this.parser.get(hostname, { deep: !isIp });
    if (!record) {
      return false;
    }

    return this.parser.handle(record, value);
  }

  public start(): void {
    logger.info('Scheduling checking updates');
    this.interval = new Interval(CHECK_INTERVAL);
    this.interval.start(async () => this.getLatest(), CHECK_INTERVAL, { immediate: true });
  }

  public async stop(): Promise<void> {
    if (!this.interval) {
      return;
    }
    await this.interval.stop();
    logger.info('Updates checking stopped');
  }
}
