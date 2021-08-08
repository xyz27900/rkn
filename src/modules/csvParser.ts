import parse, { Parser } from 'csv-parse';
import { Iconv } from 'iconv';

import { logger } from '@/utils/logger';

export type ParseRecordOutput = {
  initiator: string;
  ips: string[];
  target: string;
  urls: string[];
}

export class CSVParser {
  private static sourceEncoding = 'cp1251';
  private static resultEncoding = 'utf8';
  private static delimiter = ';';

  private static splitString(string: string, separator = '|'): string[] {
    return string.split(separator).map(s => s.trim()).filter(s => s.length > 0);
  }

  private static convertData(content: Buffer): Buffer {
    logger.info('Converting data');
    const converter = new Iconv(CSVParser.sourceEncoding, CSVParser.resultEncoding);
    return converter.convert(content);
  }

  private static parseRecord(record: string[]): ParseRecordOutput {
    const [ipStr, targetStr, urlStr, whoStr] = record;
    const ips = CSVParser.splitString(ipStr);
    const urls = CSVParser.splitString(urlStr);
    const target = targetStr.trim();
    const initiator = whoStr.trim();
    return { initiator, ips, target, urls };
  }

  private static createParser(onEnd?: (result: ParseRecordOutput[]) => void): Parser {
    const result: ParseRecordOutput[] = [];
    const parser = parse({
      delimiter: CSVParser.delimiter,
      from_line: 2,
    });
    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        result.push(CSVParser.parseRecord(record));
      }
    });
    parser.on('end', () => {
      onEnd && onEnd(result);
    });
    return parser;
  }

  public static parse(content: Buffer): Promise<ParseRecordOutput[]> {
    return new Promise(resolve => {
      const converted = CSVParser.convertData(content);
      const parser = CSVParser.createParser(result => resolve(result));
      logger.info('Parsing started');
      parser.write(converted);
      parser.end();
      logger.info('Parsing finished');
    });
  }
}
