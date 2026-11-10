import { apiClient } from './api-client';
import { ApiResponse } from '@/types/api';
import { Asset3D } from '@/types/asset3d';

export const assetService = {
  getAssets: async (format?: string): Promise<ApiResponse<Asset3D[]>> => {
    return (await apiClient.get('/assets', {
      params: { format },
    })) as unknown as ApiResponse<Asset3D[]>;
  },

  getPresignedUploadUrl: async (payload: {
    fileName: string;
    fileType: string;
    format: string;
  }): Promise<
    ApiResponse<{
      uploadUrl: string;
      key: string;
      publicUrl: string;
    }>
  > => {
    return (await apiClient.post(
      '/assets/presigned-url',
      payload
    )) as unknown as ApiResponse<{
      uploadUrl: string;
      key: string;
      publicUrl: string;
    }>;
  },
};
