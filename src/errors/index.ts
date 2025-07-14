export class LichessAPIError extends Error {
  readonly statusCode?: number;
  readonly endpoint?: string;

  constructor(message: string, statusCode?: number, endpoint?: string) {
    super(message);
    this.name = "LichessAPIError";
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class NetworkError extends Error {
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

export class RateLimitError extends Error {
  readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ValidationError extends Error {
  readonly data?: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.data = data;
  }
}
