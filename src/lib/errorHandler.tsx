import { Component, ErrorInfo, ReactNode } from 'react';
import { Logger } from '../lib/logger';

export enum ErrorType {
    NETWORK = 'NETWORK',
    TRANSCRIPT_NOT_FOUND = 'TRANSCRIPT_NOT_FOUND',
    TRANSCRIPT_DISABLED = 'TRANSCRIPT_DISABLED',
    PARSING = 'PARSING',
    TIMEOUT = 'TIMEOUT',
    UNKNOWN = 'UNKNOWN',
    CONFIG = 'CONFIG'
}

export interface AppError {
    type: ErrorType;
    message: string;
    originalError?: any;
}

export function createAppError(type: ErrorType, message: string, originalError?: any): AppError {
    return { type, message, originalError };
}

export const ErrorHandler = {
    log: (error: AppError | Error | unknown) => {
        if (process.env.NODE_ENV !== 'production') {
            Logger.error('[Ebutia Error]:', error);
        }
    },

    getUserMessage: (error: AppError | Error | unknown): string => {
        if ((error as AppError).type) {
            const appError = error as AppError;
            switch (appError.type) {

                case ErrorType.TRANSCRIPT_DISABLED:
                    return 'Transcripts are disabled for this video.';
                case ErrorType.TIMEOUT:
                    return 'Operation timed out. Please try again.';
                case ErrorType.NETWORK:
                    return 'Network error. Please check your connection.';
                default:
                    return appError.message || 'An unexpected error occurred.';
            }
        }
        if (error instanceof Error) return error.message;
        return 'An unknown error occurred.';
    }
};

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        ErrorHandler.log(createAppError(ErrorType.UNKNOWN, 'UI Crash (ErrorBoundary)', { error, errorInfo }));
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#374151',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>Something went wrong</h2>
                    <p style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                        The extension encountered an unexpected error.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        Reload Extension
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
