import { apiClient } from './api-client';
import { ApiResponse, HealthCheckData } from '@/types/api';

export const healthService = {
  checkBackendHealth: async (): Promise<ApiResponse<HealthCheckData>> => {
    return (await apiClient.get('/health')) as unknown as ApiResponse<HealthCheckData>;
  },
};
