import type { CreateUrlResponse, GetUrlsResponse } from '../types/url';

const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message || 'An error occurred');
  }
  return response.json();
};

export const createShortUrl = async (originalUrl: string): Promise<CreateUrlResponse> => {
  const response = await fetch(`${API_BASE_URL}/urls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ originalUrl }),
  });

  return handleResponse<CreateUrlResponse>(response);
};

export const getUrls = async (): Promise<GetUrlsResponse> => {
  const response = await fetch(`${API_BASE_URL}/urls`);
  return handleResponse<GetUrlsResponse>(response);
};
