export class ControlledError extends Error {
  public httpCode: number;

  constructor(public message: string, public data?: Record<string, unknown>, httpCode?: number) {
    super();
    this.name = 'ControlledError';
    this.message = message;
    this.data = data;
    this.httpCode = httpCode || 400;
    Error.captureStackTrace(this, ControlledError);
  }
}
