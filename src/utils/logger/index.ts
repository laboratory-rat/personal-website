export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface ILogger {
    setLogLevel(level: LogLevel): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}

export class Logger implements ILogger {
    private currentLogLevel: LogLevel;

    constructor(logLevel: LogLevel = 'info') {
        this.currentLogLevel = logLevel;
    }

    public setLogLevel(level: LogLevel) {
        this.currentLogLevel = level;
    }

    public debug(...args: any[]): void {
        this.log('debug', ...args);
    }

    public info(...args: any[]): void {
        this.log('info', ...args);
    }

    public warn(...args: any[]): void {
        this.log('warn', ...args);
    }

    public error(...args: any[]): void {
        this.log('error', ...args);
    }

    private log(level: LogLevel, ...args: any[]): void {
        if (this.shouldLog(level)) {
            console.log(`[${level}]`, ...args);
        }
    }

    private shouldLog(level: LogLevel): boolean {
        const order: LogLevel[] = ['debug', 'info', 'warn', 'error', 'none'];
        return order.indexOf(this.currentLogLevel) <= order.indexOf(level) && this.currentLogLevel !== 'none';
    }
}
