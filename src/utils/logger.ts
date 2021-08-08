import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  level: 'debug',
  transports: [new transports.Console()],
});
