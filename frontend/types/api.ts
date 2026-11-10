export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total?: number;
    pages?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Array<{ path?: string; message: string }>;
  timestamp: string;
}

export interface HealthCheckData {
  status: 'healthy' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  database: {
    type: string;
    state: string;
    connected: boolean;
    host: string;
    databaseName: string;
  };
  storage: {
    provider: string;
    bucket: string;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}
