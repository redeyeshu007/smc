import { Response } from 'express';

export interface ApiResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    {
      statusCode = 200,
      message = 'Operation successful',
      data,
      meta,
    }: ApiResponseOptions<T>
  ): Response {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(
    res: Response,
    message = 'Resource created successfully',
    data?: T
  ): Response {
    return this.success(res, { statusCode: 201, message, data });
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
