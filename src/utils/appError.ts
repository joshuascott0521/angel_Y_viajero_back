export class AppError extends Error {
  status: number;
  code: string;
  details?: any;

  constructor(message: string, status = 400, code = "BAD_REQUEST", details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
