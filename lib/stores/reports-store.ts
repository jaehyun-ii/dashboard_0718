import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Extended report types for the management interface
export interface ReportFile {
  id: string;
  type: "사이클" | "주간" | "월간";
  plant: "신인천" | "부산";
  unit: "1호기" | "2호기";
  title: string;
  date: string;
  createdAt: Date;
  status: "완료" | "진행중" | "대기";
  size: string;
  createdBy: string;
  filePath?: string; // For future API integration
  downloadUrl?: string; // For future API integration
}

export interface ReportFilters {
  plant: string;
  unit: string;
  type: string;
  searchKeyword: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ReportsState {
  reports: ReportFile[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;

  // UI state
  filters: ReportFilters;
  selectedReports: Set<string>;
  currentPage: number;
  itemsPerPage: number;
}

interface ReportsActions {
  // Data management
  setReports: (reports: ReportFile[]) => void;
  addReport: (report: ReportFile) => void;
  updateReport: (id: string, updates: Partial<ReportFile>) => void;
  deleteReport: (id: string) => void;

  // Filtering and search
  setFilters: (filters: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  searchReports: (keyword: string) => void;

  // Selection management
  selectReport: (id: string) => void;
  deselectReport: (id: string) => void;
  selectAllReports: (reportIds: string[]) => void;
  clearSelection: () => void;

  // Pagination
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;

  // API operations (for future implementation)
  fetchReports: () => Promise<void>;
  downloadReports: (reportIds: string[]) => Promise<void>;
  generateReport: (config: any) => Promise<void>;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface ReportsStore extends ReportsState, ReportsActions {
  // Computed values
  getFilteredReports: () => ReportFile[];
  getPaginatedReports: () => ReportFile[];
  getTotalPages: () => number;
  getSelectedReportsData: () => ReportFile[];
  getReportsByType: (type: string) => ReportFile[];
  getReportsByPlant: (plant: string) => ReportFile[];
}

// Mock data generator using existing project patterns
const generateMockReports = (): ReportFile[] => {
  const plants = ["신인천", "부산"] as const;
  const units = ["1호기", "2호기"] as const;
  const types = ["사이클", "주간", "월간"] as const;
  const statuses = ["완료", "진행중", "대기"] as const;

  const reports: ReportFile[] = [];

  for (let i = 1; i <= 25; i++) {
    const plant = plants[i % 2];
    const unit = units[i % 2];
    const type = types[i % 3];
    const status = statuses[i % 3];
    const date = new Date(2024, 0, i);

    reports.push({
      id: `report-${i.toString().padStart(3, "0")}`,
      type,
      plant,
      unit,
      title: `${plant} ${unit} ${type} 보고서`,
      date: date.toLocaleDateString("ko-KR"),
      createdAt: date,
      status,
      size: `${Math.floor(Math.random() * 50) + 10}MB`,
      createdBy: "system",
      filePath: `/reports/${i.toString().padStart(3, "0")}.pdf`,
      downloadUrl: `https://api.example.com/reports/download/${i
        .toString()
        .padStart(3, "0")}`,
    });
  }

  return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const initialFilters: ReportFilters = {
  plant: "전체",
  unit: "전체",
  type: "사이클",
  searchKeyword: "",
};

export const useReportsStore = create<ReportsStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    reports: generateMockReports(),
    isLoading: false,
    error: null,
    lastUpdated: Date.now(),

    // UI state
    filters: initialFilters,
    selectedReports: new Set(),
    currentPage: 1,
    itemsPerPage: 10,

    // Data management actions
    setReports: (reports) => set({ reports, lastUpdated: Date.now() }),

    addReport: (report) =>
      set((state) => ({
        reports: [report, ...state.reports],
        lastUpdated: Date.now(),
      })),

    updateReport: (id, updates) =>
      set((state) => ({
        reports: state.reports.map((report) =>
          report.id === id ? { ...report, ...updates } : report
        ),
        lastUpdated: Date.now(),
      })),

    deleteReport: (id) =>
      set((state) => ({
        reports: state.reports.filter((report) => report.id !== id),
        selectedReports: new Set(
          [...state.selectedReports].filter((selectedId) => selectedId !== id)
        ),
        lastUpdated: Date.now(),
      })),

    // Filtering and search actions
    setFilters: (newFilters) =>
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
        currentPage: 1, // Reset to first page when filtering
      })),

    resetFilters: () =>
      set({
        filters: initialFilters,
        currentPage: 1,
        selectedReports: new Set(),
      }),

    searchReports: (keyword) =>
      set((state) => ({
        filters: { ...state.filters, searchKeyword: keyword },
        currentPage: 1,
      })),

    // Selection management
    selectReport: (id) =>
      set((state) => ({
        selectedReports: new Set([...state.selectedReports, id]),
      })),

    deselectReport: (id) =>
      set((state) => {
        const newSelection = new Set(state.selectedReports);
        newSelection.delete(id);
        return { selectedReports: newSelection };
      }),

    selectAllReports: (reportIds) =>
      set({
        selectedReports: new Set(reportIds),
      }),

    clearSelection: () =>
      set({
        selectedReports: new Set(),
      }),

    // Pagination
    setCurrentPage: (page) => set({ currentPage: page }),

    setItemsPerPage: (count) =>
      set({
        itemsPerPage: count,
        currentPage: 1, // Reset to first page when changing items per page
      }),

    // API operations (mock implementations for now)
    fetchReports: async () => {
      set({ isLoading: true, error: null });

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In real implementation, this would fetch from API
        const reports = generateMockReports();
        set({
          reports,
          isLoading: false,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to fetch reports",
        });
      }
    },

    downloadReports: async (reportIds) => {
      set({ isLoading: true, error: null });

      try {
        // Simulate download process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In real implementation, this would trigger file downloads

        set({ isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to download reports",
        });
      }
    },

    generateReport: async (config) => {
      set({ isLoading: true, error: null });

      try {
        // Simulate report generation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // In real implementation, this would trigger report generation

        set({ isLoading: false });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate report",
        });
      }
    },

    // State management
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Computed values
    getFilteredReports: () => {
      const { reports, filters } = get();

      return reports.filter((report) => {
        const plantMatch =
          filters.plant === "전체" || report.plant === filters.plant;
        const unitMatch =
          filters.unit === "전체" || report.unit === filters.unit;
        const typeMatch =
          filters.type === "전체" || report.type === filters.type;
        const searchMatch =
          filters.searchKeyword === "" ||
          report.title
            .toLowerCase()
            .includes(filters.searchKeyword.toLowerCase()) ||
          report.id.toLowerCase().includes(filters.searchKeyword.toLowerCase());

        return plantMatch && unitMatch && typeMatch && searchMatch;
      });
    },

    getPaginatedReports: () => {
      const { currentPage, itemsPerPage } = get();
      const filteredReports = get().getFilteredReports();

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      return filteredReports.slice(startIndex, endIndex);
    },

    getTotalPages: () => {
      const { itemsPerPage } = get();
      const filteredReports = get().getFilteredReports();

      return Math.ceil(filteredReports.length / itemsPerPage);
    },

    getSelectedReportsData: () => {
      const { reports, selectedReports } = get();

      return reports.filter((report) => selectedReports.has(report.id));
    },

    getReportsByType: (type) => {
      const { reports } = get();
      return reports.filter((report) => report.type === type);
    },

    getReportsByPlant: (plant) => {
      const { reports } = get();
      return reports.filter((report) => report.plant === plant);
    },
  }))
);
