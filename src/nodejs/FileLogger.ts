import { appendFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { ILogger, LogLevel } from "../common/Interfaces";
import { SetLogger } from "../common/Logger";

export class FileLogger implements ILogger {
    constructor(private readonly logFilename: string, private readonly maxLogLevel: LogLevel) {
        const folder = dirname(logFilename);
        if (!existsSync(folder)) {
            mkdirSync(folder, { recursive: true });
        }
        if (existsSync(logFilename)) {
            unlinkSync(logFilename);
        }
    }

    public logVerbose(message: string): void { this.log(message, LogLevel.verbose); }
    public logInfo(message: string): void { this.log(message, LogLevel.information); }
    public logWarning(message: string): void { this.log(message, LogLevel.warning); }
    public logError(message: string): void { this.log(message, LogLevel.error); }

    public logException(error: Error): void {
        if (error instanceof Error) {
            this.log(`Exception message: ${error.message}\nCall stack: ${error.stack || "unavailable"}`, LogLevel.verbose);
        }
        else {
            this.log(`Unknown exception: ${JSON.stringify(error)}`, LogLevel.verbose);
        }
    }

    private log(message: string, logLevel: LogLevel): void {
        const outputMessage = `[${LogLevel[logLevel].toUpperCase()}] [${new Date().toISOString()}] ${message}`;
        if (logLevel <= this.maxLogLevel) {
            console.log(outputMessage);
        }
        appendFileSync(this.logFilename, `${outputMessage}\n`, { encoding: "utf-8" });
    }
}

export function InitializeFileLogger(logFilename: string, maxLogLevel: LogLevel): void {
    SetLogger(new FileLogger(logFilename, maxLogLevel));
}
