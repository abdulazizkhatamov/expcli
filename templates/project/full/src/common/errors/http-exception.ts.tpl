export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpException';
    Object.setPrototypeOf(this, HttpException.prototype);
  }

  static badRequest(message: string, details?: unknown): HttpException {
    return new HttpException(400, message, details);
  }

  static unauthorized(message = 'Unauthorized'): HttpException {
    return new HttpException(401, message);
  }

  static forbidden(message = 'Forbidden'): HttpException {
    return new HttpException(403, message);
  }

  static notFound(message = 'Not found'): HttpException {
    return new HttpException(404, message);
  }

  static conflict(message: string): HttpException {
    return new HttpException(409, message);
  }

  static internal(message = 'Internal server error'): HttpException {
    return new HttpException(500, message);
  }
}
