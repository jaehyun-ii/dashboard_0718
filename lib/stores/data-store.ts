import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  CycleInfo,
  VariableInfo,
  VariableStatus,
  VariableGroup,
  SwirlDataEntry,
  SwirlDatum,
  Blowchart,
  blowchartValues,
} from "../data";
import { CyclesAPI, formatApiError } from "../api/cycles-api";

interface DataState {
  cycles: CycleInfo[];
  swirlData: SwirlDataEntry[];
  blowchart: Blowchart;
  isLoading: boolean;
  isLoadingCycles: boolean;
  isLoadingSwirlData: boolean;
  isLoadingBlowchart: boolean;
  lastUpdated: number;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

interface DataActions {
  // API-based actions
  fetchCycles: (params?: {
    page?: number;
    limit?: number;
    turbine?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: VariableStatus;
  }) => Promise<void>;
  fetchCycleById: (id: string) => Promise<CycleInfo | null>;
  createCycle: (params: {
    name: string;
    turbine: string;
    date: string;
    start: number;
    end: number;
    color?: string;
  }) => Promise<void>;
  updateCycle: (id: string, updates: Partial<CycleInfo>) => Promise<void>;
  deleteCycle: (id: string) => Promise<void>;

  fetchSwirlData: (cycleId?: string) => Promise<void>;
  updateSwirlData: (cycleId: string, data: SwirlDatum[]) => Promise<void>;

  fetchBlowchart: (keys?: string[]) => Promise<void>;
  updateBlowchartValue: (key: string, value: number) => Promise<void>;
  updateBlowchartValues: (values: Record<string, number>) => Promise<void>;

  updateVariableStatus: (
    cycleId: string,
    variableName: string,
    status: VariableStatus
  ) => Promise<void>;
  updateVariableValue: (
    cycleId: string,
    variableName: string,
    value: string
  ) => Promise<void>;

  // Local state management
  setCycles: (cycles: CycleInfo[]) => void;
  setSwirlData: (data: SwirlDataEntry[]) => void;
  setBlowchart: (data: Blowchart) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: DataState["pagination"]) => void;

  // Utility actions
  refreshData: () => Promise<void>;
  resetData: () => void;
}

interface DataStore extends DataState, DataActions {
  getCycleById: (id: string) => CycleInfo | null;
  getCyclesByTurbine: (turbine: string) => CycleInfo[];
  getCyclesByDateRange: (from: string, to: string) => CycleInfo[];
  getCyclesByStatus: (status: VariableStatus) => CycleInfo[];

  getSwirlDataByCycle: (cycleId: string) => SwirlDatum[] | null;
  getVariablesByGroup: (
    cycleId: string,
    group: VariableGroup
  ) => VariableInfo[];

  getHealthySummary: () => {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };

  getRecentCycles: (limit?: number) => CycleInfo[];
  searchCycles: (query: string) => CycleInfo[];
}

// Seeded random for consistent data generation
const seededRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

const initialSwirlData: SwirlDataEntry[] = [];

export const useDataStore = create<DataStore>()(
  subscribeWithSelector((set, get) => ({
    cycles: [],
    swirlData: [],
    blowchart: {},
    isLoading: false,
    isLoadingCycles: false,
    isLoadingSwirlData: false,
    isLoadingBlowchart: false,
    lastUpdated: Date.now(),
    error: null,
    pagination: null,

    // API-based actions
    fetchCycles: async (params = {}) => {
      set({ isLoadingCycles: true, error: null });
      try {
        const response = await CyclesAPI.fetchCycles(params);
        set({
          cycles: response.data.cycles,
          pagination: response.data.pagination,
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    fetchCycleById: async (id) => {
      set({ isLoadingCycles: true, error: null });
      try {
        const response = await CyclesAPI.getCycleById(id);
        set({ isLoadingCycles: false });
        return response.data || null;
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
        return null;
      }
    },

    createCycle: async (params) => {
      set({ isLoadingCycles: true, error: null });
      try {
        const response = await CyclesAPI.createCycle(params);
        const newCycle = response.data!;
        set((state) => ({
          cycles: [...state.cycles, newCycle],
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    updateCycle: async (id, updates) => {
      set({ isLoadingCycles: true, error: null });
      try {
        const response = await CyclesAPI.updateCycle(id, updates);
        const updatedCycle = response.data!;
        set((state) => ({
          cycles: state.cycles.map((cycle) =>
            cycle.id === id ? updatedCycle : cycle
          ),
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    deleteCycle: async (id) => {
      set({ isLoadingCycles: true, error: null });
      try {
        await CyclesAPI.deleteCycle(id);
        set((state) => ({
          cycles: state.cycles.filter((cycle) => cycle.id !== id),
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    fetchSwirlData: async (cycleId) => {
      set({ isLoadingSwirlData: true, error: null });
      try {
        // TODO: Implement API call for swirl data
        // const response = await SwirlAPI.fetchSwirlData(cycleId);
        // set({ swirlData: response.data, isLoadingSwirlData: false });

        // For now, use existing mock data
        set({ isLoadingSwirlData: false });
      } catch (error) {
        set({
          isLoadingSwirlData: false,
          error: formatApiError(error),
        });
      }
    },

    updateSwirlData: async (cycleId, data) => {
      set({ isLoadingSwirlData: true, error: null });
      try {
        // TODO: Implement API call for updating swirl data
        // await SwirlAPI.updateSwirlData(cycleId, data);

        // Update local state
        set((state) => ({
          swirlData: state.swirlData.map((entry) =>
            entry.cycle === cycleId ? { ...entry, swirlData: data } : entry
          ),
          isLoadingSwirlData: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingSwirlData: false,
          error: formatApiError(error),
        });
      }
    },

    fetchBlowchart: async (keys) => {
      set({ isLoadingBlowchart: true, error: null });
      try {
        // TODO: Implement API call for blowchart data
        // const response = await BlowchartAPI.fetchBlowchart(keys);
        // set({ blowchart: response.data, isLoadingBlowchart: false });

        // For now, use existing mock data
        set({ isLoadingBlowchart: false });
      } catch (error) {
        set({
          isLoadingBlowchart: false,
          error: formatApiError(error),
        });
      }
    },

    updateBlowchartValue: async (key, value) => {
      set({ isLoadingBlowchart: true, error: null });
      try {
        // TODO: Implement API call for updating single blowchart value
        // await BlowchartAPI.updateValue(key, value);

        // Update local state
        set((state) => ({
          blowchart: { ...state.blowchart, [key]: value },
          isLoadingBlowchart: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingBlowchart: false,
          error: formatApiError(error),
        });
      }
    },

    updateBlowchartValues: async (values) => {
      set({ isLoadingBlowchart: true, error: null });
      try {
        // TODO: Implement API call for updating multiple blowchart values
        // await BlowchartAPI.updateValues(values);

        // Update local state
        set((state) => ({
          blowchart: { ...state.blowchart, ...values },
          isLoadingBlowchart: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingBlowchart: false,
          error: formatApiError(error),
        });
      }
    },

    updateVariableStatus: async (cycleId, variableName, status) => {
      set({ isLoadingCycles: true, error: null });
      try {
        // TODO: Implement API call for updating variable status
        // await VariablesAPI.updateVariableStatus(cycleId, variableName, status);

        // Update local state
        set((state) => ({
          cycles: state.cycles.map((cycle) =>
            cycle.id === cycleId
              ? {
                  ...cycle,
                  variables: cycle.variables.map((variable) =>
                    variable.name === variableName
                      ? { ...variable, status }
                      : variable
                  ),
                }
              : cycle
          ),
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    updateVariableValue: async (cycleId, variableName, value) => {
      set({ isLoadingCycles: true, error: null });
      try {
        // TODO: Implement API call for updating variable value
        // await VariablesAPI.updateVariableValue(cycleId, variableName, value);

        // Update local state
        set((state) => ({
          cycles: state.cycles.map((cycle) =>
            cycle.id === cycleId
              ? {
                  ...cycle,
                  variables: cycle.variables.map((variable) =>
                    variable.name === variableName
                      ? { ...variable, value }
                      : variable
                  ),
                }
              : cycle
          ),
          isLoadingCycles: false,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        set({
          isLoadingCycles: false,
          error: formatApiError(error),
        });
      }
    },

    // Local state management
    setCycles: (cycles) => set({ cycles, lastUpdated: Date.now() }),
    setSwirlData: (data) => set({ swirlData: data, lastUpdated: Date.now() }),
    setBlowchart: (data) => set({ blowchart: data, lastUpdated: Date.now() }),

    setPagination: (pagination) => set({ pagination }),

    setError: (error) => set({ error }),

    refreshData: async () => {
      set({ isLoading: true, error: null });

      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const updatedCycles = get().cycles.map((cycle) => ({
          ...cycle,
          variables: cycle.variables.map((variable) => ({
            ...variable,
            status:
              Math.random() > 0.1
                ? variable.status
                : (["healthy", "warning", "critical"] as const)[
                    Math.floor(Math.random() * 3)
                  ],
          })),
        }));

        set({
          cycles: updatedCycles,
          isLoading: false,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        set({
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to refresh data",
        });
      }
    },

    resetData: () => {
      set({
        cycles: [],
        swirlData: initialSwirlData,
        blowchart: blowchartValues,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null,
        pagination: null,
      });
    },

    getCycleById: (id) => get().cycles.find((cycle) => cycle.id === id) || null,

    getCyclesByTurbine: (turbine) =>
      get().cycles.filter((cycle) => cycle.turbine === turbine),

    getCyclesByDateRange: (from, to) =>
      get().cycles.filter((cycle) => cycle.date >= from && cycle.date <= to),

    getCyclesByStatus: (status) =>
      get().cycles.filter((cycle) =>
        cycle.variables.some((variable) => variable.status === status)
      ),

    getSwirlDataByCycle: (cycleId) =>
      get().swirlData.find((entry) => entry.cycle === cycleId)?.swirlData ??
      null,

    getVariablesByGroup: (cycleId, group) => {
      const cycle = get().getCycleById(cycleId);
      return (
        cycle?.variables.filter((variable) => variable.group === group) || []
      );
    },

    getHealthySummary: () => {
      const cycles = get().cycles;
      const allVariables = cycles.flatMap((cycle) => cycle.variables);

      return {
        total: allVariables.length,
        healthy: allVariables.filter((v) => v.status === "healthy").length,
        warning: allVariables.filter((v) => v.status === "warning").length,
        critical: allVariables.filter((v) => v.status === "critical").length,
      };
    },

    getRecentCycles: (limit = 10) => {
      return [...get().cycles]
        .sort((a, b) => {
          const dateCompare =
            new Date(b.date).getTime() - new Date(a.date).getTime();
          return dateCompare !== 0 ? dateCompare : b.start - a.start;
        })
        .slice(0, limit);
    },

    searchCycles: (query) => {
      const searchTerm = query.toLowerCase();
      return get().cycles.filter(
        (cycle) =>
          cycle.name.toLowerCase().includes(searchTerm) ||
          cycle.turbine.toLowerCase().includes(searchTerm) ||
          cycle.id.toLowerCase().includes(searchTerm)
      );
    },
  }))
);
