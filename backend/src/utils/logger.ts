type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS = {
  reset: '\x1b[0m',
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[35m', // Magenta
  dim: '\x1b[2m',
};

class Logger {
  private format(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const prefix = `${COLORS.dim}[${timestamp}]${COLORS.reset} ${color}[${level.toUpperCase()}]${COLORS.reset}`;
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${prefix} ${message}${metaStr}`;
  }

  info(message: string, meta?: unknown): void {
    console.log(this.format('info', message, meta));
  }

  warn(message: string, meta?: unknown): void {
    console.warn(this.format('warn', message, meta));
  }

  error(message: string, meta?: unknown): void {
    console.error(this.format('error', message, meta));
  }

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, meta));
    }
  }
}

export const logger = new Logger();
