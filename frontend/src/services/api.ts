import type { CreateUrlResponse, GetUrlsResponse } from '../types/url';

// Normaliser l'URL de l'API : s'assurer qu'elle est absolue ou relative correctement
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) {
    return '/api';
  }
  
  // Si l'URL commence par http:// ou https://, c'est une URL absolue
  // Utiliser l'URL telle quelle sans ajouter /api
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    // Retirer le slash final s'il existe pour éviter les doubles slashes
    return envUrl.replace(/\/$/, '');
  }
  
  // Sinon, traiter comme un chemin relatif
  return envUrl.startsWith('/') ? envUrl : `/${envUrl}`;
};

const API_BASE_URL = getApiBaseUrl();

// Debug: vérifier que la variable d'environnement est bien utilisée
if (import.meta.env.DEV) {
  console.log('API_BASE_URL:', API_BASE_URL);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
}

export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
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
