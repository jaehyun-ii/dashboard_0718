// API client for cycles management
import { CycleInfo, VariableStatus } from "../data";

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Backend API response types
interface BackendCycleData {
  data_id: number;
  equip_id: number;
  cycle_number: number;
  start_time: string; // ISO datetime string
  end_time: string; // ISO datetime string
  anomaly_flag: number; // 0 = normal, 1 = anomaly
  anomaly_seq?: number | null;
}

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

// Navigation types
export interface NavigationParams {
  base_time: string;
  direction: "previous" | "next" | "current";
}

export interface CycleNumberParams {
  cycle_number: number;
}

export interface DateTimeParams {
  date_time: string;
}

// API service class
export class CyclesAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
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
      throw new Error(
        errorData.message ||
          `API Error: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Fetch cycles with filtering and pagination
  static async fetchCycles(
    params: FetchCyclesRequest = {}
  ): Promise<FetchCyclesResponse> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const endpoint = `/cycles${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    return this.request<FetchCyclesResponse>(endpoint, {
      method: "GET",
    });
  }

  // Navigation endpoints
  static async fetchCyclesNavigation(
    params: NavigationParams
  ): Promise<FetchCyclesResponse> {
    const searchParams = new URLSearchParams({
      base_time: params.base_time,
      direction: params.direction,
    });

    const endpoint = `/cycles/navigation?${searchParams.toString()}`;

    try {
      // Backend returns direct array of BackendCycleData
      const backendCycles = await this.request<BackendCycleData[]>(endpoint, {
        method: "GET",
      });

      // Transform backend data to frontend format
      const cycles = backendCycles.map(transformBackendCycleToFrontend);

      return {
        success: true,
        data: {
          cycles,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: cycles.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          cycles: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        error: formatApiError(error),
      };
    }
  }

  // Get cycles by cycle number
  static async fetchCyclesByCycleNumber(
    cycleNumber: number
  ): Promise<FetchCyclesResponse> {
    const endpoint = `/cycles/cycle-number/${cycleNumber}`;

    try {
      // Backend returns direct array of BackendCycleData
      const backendCycles = await this.request<BackendCycleData[]>(endpoint, {
        method: "GET",
      });

      // Transform backend data to frontend format
      const cycles = backendCycles.map(transformBackendCycleToFrontend);

      return {
        success: true,
        data: {
          cycles,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: cycles.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          cycles: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        error: formatApiError(error),
      };
    }
  }

  // Get cycles by datetime
  static async fetchCyclesByDateTime(
    params: DateTimeParams
  ): Promise<FetchCyclesResponse> {
    const searchParams = new URLSearchParams({
      date_time: params.date_time,
    });

    const endpoint = `/cycles/datetime?${searchParams.toString()}`;

    try {
      // Backend returns direct array of BackendCycleData
      const backendCycles = await this.request<BackendCycleData[]>(endpoint, {
        method: "GET",
      });

      // Transform backend data to frontend format
      const cycles = backendCycles.map(transformBackendCycleToFrontend);

      return {
        success: true,
        data: {
          cycles,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: cycles.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          cycles: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        error: formatApiError(error),
      };
    }
  }

  // Get recent cycles (7 days from latest)
  static async fetchRecentCycles(): Promise<FetchCyclesResponse> {
    const endpoint = `/cycles/recent`;

    try {
      // Backend returns direct array of BackendCycleData
      const backendCycles = await this.request<BackendCycleData[]>(endpoint, {
        method: "GET",
      });

      // Transform backend data to frontend format
      const cycles = backendCycles.map(transformBackendCycleToFrontend);

      return {
        success: true,
        data: {
          cycles,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: cycles.length,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {
          cycles: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        error: formatApiError(error),
      };
    }
  }

  // Get single cycle by ID
  static async getCycleById(id: string): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/cycles/${id}`, {
      method: "GET",
    });
  }

  // Create new cycle
  static async createCycle(
    params: CreateCycleRequest
  ): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>("/cycles", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Update cycle
  static async updateCycle(
    id: string,
    params: Partial<CreateCycleRequest>
  ): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/cycles/${id}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  // Delete cycle
  static async deleteCycle(id: string): Promise<ApiResponse<CycleInfo>> {
    return this.request<ApiResponse<CycleInfo>>(`/cycles/${id}`, {
      method: "DELETE",
    });
  }

  // Get combustion data by cycle with variable group filter
  static async getCombustionDataByCycle(
    startTime: string,
    endTime: string
  ): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams({
      start_time: startTime,
      end_time: endTime,
    });

    const endpoint = `/combustion/cycle?${searchParams.toString()}`;

    try {
      const response = await this.request<any>(endpoint, {
        method: "GET",
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: formatApiError(error),
      };
    }
  }
}

// Data transformation utilities
const mapEquipIdToTurbine = (equipId: number): string => {
  // Map equipment IDs to turbine names
  // Adjust this mapping based on your backend data
  switch (equipId) {
    case 306:
      return "Turbine A";
    case 307:
      return "Turbine B";
    case 308:
      return "Turbine C";
    case 309:
      return "Turbine D";
    default:
      return `Turbine ${String.fromCharCode(65 + (equipId % 4))}`;
  }
};

const getCycleColor = (anomalyFlag: number): string => {
  // 어노멀리 플래그에 따른 색상 지정
  if (anomalyFlag === 1) {
    // 어노멀리가 있는 경우 빨간색
    return "bg-red-600";
  } else {
    // 정상인 경우 파란색으로 통일
    return "bg-blue-500";
  }
};

// Mock 변수 데이터 생성 (실제 백엔드 API가 없을 때 사용)
const generateMockVariables = (cycleNumber: number, anomalyFlag: number) => {
  // 시드를 사용한 랜덤 생성으로 일관된 데이터 제공
  const seed = cycleNumber;
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  const variableGroups = [
    { group: "진동", names: ["진동 A1", "진동 B1", "진동 C1", "진동 D1"] },
    {
      group: "연소",
      names: ["연소 온도", "연소 압력", "연소 효율", "연소 배기"],
    },
    { group: "전기", names: ["전압", "전류", "주파수", "역률"] },
    { group: "단위기기", names: ["펌프 A", "펌프 B", "밸브 1", "밸브 2"] },
  ];

  const variables = [];

  for (const { group, names } of variableGroups) {
    for (const name of names) {
      const random = seededRandom();
      let status;

      // 어노멀리가 있는 사이클의 경우 일부 변수를 위험/경고 상태로 설정
      if (anomalyFlag === 1) {
        if (random < 0.3) status = "critical";
        else if (random < 0.6) status = "warning";
        else status = "healthy";
      } else {
        // 정상 사이클의 경우 대부분 정상, 가끔 경고
        if (random < 0.1) status = "warning";
        else status = "healthy";
      }

      variables.push({
        name,
        value: (random * 100).toFixed(1),
        status: status as "healthy" | "warning" | "critical",
        group: group as "진동" | "연소" | "전기" | "단위기기",
      });
    }
  }

  return variables;
};

const transformBackendCycleToFrontend = (
  backendCycle: BackendCycleData
): CycleInfo => {
  const startDate = new Date(backendCycle.start_time);
  const endDate = new Date(backendCycle.end_time);

  // Extract date and time components with minute precision
  const date = startDate.toISOString().slice(0, 10); // YYYY-MM-DD

  // Convert to minutes from start of day (0-1439 for 24 hours)
  let startMinutes = startDate.getUTCHours() * 60 + startDate.getUTCMinutes();
  let endMinutes = endDate.getUTCHours() * 60 + endDate.getUTCMinutes();

  // 사이클이 다음 날로 넘어가는 경우 처리
  if (endDate.getUTCDate() !== startDate.getUTCDate()) {
    endMinutes = endMinutes + 24 * 60; // Add 24 hours in minutes
  }

  // 사이클 길이가 0이거나 음수인 경우 최소 1시간으로 보정
  if (endMinutes <= startMinutes) {
    endMinutes = startMinutes + 60; // Add 60 minutes (1 hour)
  }

  // 48시간(2880분)을 초과하는 경우 제한
  if (endMinutes > 24 * 60) {
    endMinutes = 24 * 60; // 24 hours in minutes
  }

  // Format time for logging
  const formatMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  console.log(
    `Cycle ${backendCycle.cycle_number}: ${date} ${formatMinutesToTime(
      startMinutes
    )}-${formatMinutesToTime(endMinutes)} (원본: ${backendCycle.start_time} ~ ${
      backendCycle.end_time
    })`
  );

  return {
    id: `cycle-${backendCycle.data_id}`,
    name: `Cycle ${backendCycle.cycle_number}`,
    date: date,
    start: startMinutes,
    end: endMinutes,
    turbine: mapEquipIdToTurbine(backendCycle.equip_id),
    color: getCycleColor(backendCycle.anomaly_flag),
    variables: generateMockVariables(
      backendCycle.cycle_number,
      backendCycle.anomaly_flag
    ),
  };
};

// Utility functions
export const formatApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

export const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.message || response.error || "API request failed");
  }
  return response.data as T;
};
