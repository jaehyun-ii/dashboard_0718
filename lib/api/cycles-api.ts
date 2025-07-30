// API client for cycles management
import { CycleInfo, VariableStatus } from '../data';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Types for API requests/responses
export interface FetchCyclesRequest {
  page?: number;
  limit?: number;
  turbine?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: VariableStatus;
}

export interface FetchCyclesResponse {
  success: boolean;
  data: {
    cycles: CycleInfo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  error?: string;
  message?: string;
}

export interface CreateCycleRequest {
  name: string;
  turbine: string;
  date: string;
  start: number;
  end: number;
  color?: string;
  variables?: any[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API service class
export class CyclesAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Fetch cycles with filtering and pagination
  static async fetchCycles(params: FetchCyclesRequest = {}): Promise<FetchCyclesResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/api/cycles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return this.request<FetchCyclesResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Get single cycle by ID
  static async getCycleById(id: string): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/api/cycles/${id}`, {
      method: 'GET',
    });
  }

  // Create new cycle
  static async createCycle(params: CreateCycleRequest): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>('/api/cycles', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Update cycle
  static async updateCycle(id: string, params: Partial<CreateCycleRequest>): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/api/cycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  // Delete cycle
  static async deleteCycle(id: string): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/api/cycles/${id}`, {
      method: 'DELETE',
    });
  }
}

// Utility functions
export const formatApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || response.error || 'API request failed');
  }
  return response.data as T;
};