// =============================================================================
// Structured logger — swap the implementation when you need a real logger
// (Pino, Winston, Axiom, etc.) without changing call sites.
// =============================================================================

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogMeta {
    [key: string]: unknown;
}

function formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

function extractErrorInfo(error: unknown): LogMeta {
    if (error instanceof Error) {
        return {
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack,
        };
    }
    return { errorRaw: String(error) };
}

export const logger = {
    info(message: string, meta?: LogMeta) {
        console.log(formatMessage("info", message, meta));
    },

    warn(message: string, meta?: LogMeta) {
        console.warn(formatMessage("warn", message, meta));
    },

    error(message: string, error?: unknown, meta?: LogMeta) {
        const errorMeta = error ? extractErrorInfo(error) : {};
        console.error(formatMessage("error", message, { ...errorMeta, ...meta }));
    },

    debug(message: string, meta?: LogMeta) {
        if (process.env.NODE_ENV === "development") {
            console.debug(formatMessage("debug", message, meta));
        }
    },
};
