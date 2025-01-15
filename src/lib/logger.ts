import { format } from 'date-fns';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  fileName: string;
  functionName: string;
  lineNumber?: number;
  data?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private environment: string;
  private logBuffer: LogEntry[] = [];

  private constructor() {
    this.environment = import.meta.env.MODE || 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(7);
    const location = `${entry.fileName}:${entry.functionName}${entry.lineNumber ? `:${entry.lineNumber}` : ''}`;
    let message = `[${timestamp}] ${level} [${location}] ${entry.message}`;

    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      message += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }

    return message;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.environment === 'production') {
      return level !== LogLevel.DEBUG;
    }
    return true;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    fileName: string,
    functionName: string,
    data?: Record<string, unknown>,
    error?: Error,
    lineNumber?: number
  ): LogEntry {
    return {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      level,
      message,
      fileName,
      functionName,
      lineNumber,
      data,
      error
    };
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedLog = this.formatLogEntry(entry);
    this.logBuffer.push(entry);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARNING:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
    }

    // In production, we could send logs to a service
    if (this.environment === 'production' && entry.level === LogLevel.ERROR) {
      this.sendToErrorReporting(entry);
    }
  }

  private async sendToErrorReporting(entry: LogEntry): Promise<void> {
    // Implementation for sending to error reporting service
    // This would integrate with services like Sentry, LogRocket, etc.
    try {
      // Example implementation
      const payload = {
        ...entry,
        environment: this.environment,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      // Send to error reporting service
      console.info('Would send to error reporting:', payload);
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  debug(
    message: string,
    fileName: string,
    functionName: string,
    data?: Record<string, unknown>,
    lineNumber?: number
  ): void {
    this.log(this.createLogEntry(LogLevel.DEBUG, message, fileName, functionName, data, undefined, lineNumber));
  }

  info(
    message: string,
    fileName: string,
    functionName: string,
    data?: Record<string, unknown>,
    lineNumber?: number
  ): void {
    this.log(this.createLogEntry(LogLevel.INFO, message, fileName, functionName, data, undefined, lineNumber));
  }

  warn(
    message: string,
    fileName: string,
    functionName: string,
    data?: Record<string, unknown>,
    error?: Error,
    lineNumber?: number
  ): void {
    this.log(this.createLogEntry(LogLevel.WARNING, message, fileName, functionName, data, error, lineNumber));
  }

  error(
    message: string,
    fileName: string,
    functionName: string,
    error: Error,
    data?: Record<string, unknown>,
    lineNumber?: number
  ): void {
    this.log(this.createLogEntry(LogLevel.ERROR, message, fileName, functionName, data, error, lineNumber));
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }
}

export const logger = Logger.getInstance();