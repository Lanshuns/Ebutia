const isDev = import.meta.env?.DEV ?? false;

export const Logger = {
    log: (message: string, ...args: any[]) => {
        if (isDev) {
            console.log(`[Ebutia] ${message}`, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (isDev) {
            console.warn(`[Ebutia] ${message}`, ...args);
        }
    },
    error: (message: string, error?: unknown) => {
        if (isDev) {
            console.error(`[Ebutia] ${message}`, error);
        }
    }
};
