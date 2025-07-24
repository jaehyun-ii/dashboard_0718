import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { CycleInfo, VariableInfo, SwirlDataEntry, SwirlDatum, Blowchart, timelineData, blowchartValues } from "../data";

interface DataState {
  cycles: CycleInfo[];
  swirlData: SwirlDataEntry[];
  blowchart: Blowchart;
  isLoading: boolean;
  lastUpdated: number;
  error: string | null;
}

interface DataActions {
  setCycles: (cycles: CycleInfo[]) => void;
  addCycle: (cycle: CycleInfo) => void;
  updateCycle: (id: string, updates: Partial<CycleInfo>) => void;
  deleteCycle: (id: string) => void;
  
  setSwirlData: (data: SwirlDataEntry[]) => void;
  addSwirlData: (entry: SwirlDataEntry) => void;
  updateSwirlData: (cycleId: string, data: SwirlDatum[]) => void;
  
  setBlowchart: (data: Blowchart) => void;
  updateBlowchartValue: (key: string, value: number) => void;
  
  updateVariableStatus: (cycleId: string, variableName: string, status: VariableInfo["status"]) => void;
  updateVariableValue: (cycleId: string, variableName: string, value: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  refreshData: () => Promise<void>;
  loadInitialData: () => void;
  resetData: () => void;
}

interface DataStore extends DataState, DataActions {
  getCycleById: (id: string) => CycleInfo | null;
  getCyclesByTurbine: (turbine: string) => CycleInfo[];
  getCyclesByDateRange: (from: string, to: string) => CycleInfo[];
  getCyclesByStatus: (status: VariableInfo["status"]) => CycleInfo[];
  
  getSwirlDataByCycle: (cycleId: string) => SwirlDatum[] | null;
  getVariablesByGroup: (cycleId: string, group: VariableInfo["group"]) => VariableInfo[];
  
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

const initialSwirlData: SwirlDataEntry[] = [
  {
    cycle: "215",
    swirlData: [
      {
        datetime: "2023-11-15 17:30:53",
        output: 0.15,
        sensors: (() => {
          const rng = seededRandom(215);
          return Array.from({ length: 27 }, (_, i) => ({
            name: `T${i + 1}`,
            value: 10 + rng() * 5,
          }));
        })(),
      },
    ],
  },
];

export const useDataStore = create<DataStore>()(
  subscribeWithSelector((set, get) => ({
    cycles: timelineData.cycles,
    swirlData: initialSwirlData,
    blowchart: blowchartValues,
    isLoading: false,
    lastUpdated: Date.now(),
    error: null,

    setCycles: (cycles) => set({ cycles, lastUpdated: Date.now() }),
    
    addCycle: (cycle) => set((state) => ({
      cycles: [...state.cycles, cycle],
      lastUpdated: Date.now(),
    })),
    
    updateCycle: (id, updates) => set((state) => ({
      cycles: state.cycles.map(cycle =>
        cycle.id === id ? { ...cycle, ...updates } : cycle
      ),
      lastUpdated: Date.now(),
    })),
    
    deleteCycle: (id) => set((state) => ({
      cycles: state.cycles.filter(cycle => cycle.id !== id),
      lastUpdated: Date.now(),
    })),

    setSwirlData: (data) => set({ swirlData: data, lastUpdated: Date.now() }),
    
    addSwirlData: (entry) => set((state) => ({
      swirlData: [...state.swirlData, entry],
      lastUpdated: Date.now(),
    })),
    
    updateSwirlData: (cycleId, data) => set((state) => ({
      swirlData: state.swirlData.map(entry =>
        entry.cycle === cycleId ? { ...entry, swirlData: data } : entry
      ),
      lastUpdated: Date.now(),
    })),

    setBlowchart: (data) => set({ blowchart: data, lastUpdated: Date.now() }),
    
    updateBlowchartValue: (key, value) => set((state) => ({
      blowchart: { ...state.blowchart, [key]: value },
      lastUpdated: Date.now(),
    })),

    updateVariableStatus: (cycleId, variableName, status) => set((state) => ({
      cycles: state.cycles.map(cycle =>
        cycle.id === cycleId
          ? {
              ...cycle,
              variables: cycle.variables.map(variable =>
                variable.name === variableName
                  ? { ...variable, status }
                  : variable
              ),
            }
          : cycle
      ),
      lastUpdated: Date.now(),
    })),
    
    updateVariableValue: (cycleId, variableName, value) => set((state) => ({
      cycles: state.cycles.map(cycle =>
        cycle.id === cycleId
          ? {
              ...cycle,
              variables: cycle.variables.map(variable =>
                variable.name === variableName
                  ? { ...variable, value }
                  : variable
              ),
            }
          : cycle
      ),
      lastUpdated: Date.now(),
    })),

    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),

    refreshData: async () => {
      set({ isLoading: true, error: null });
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedCycles = get().cycles.map(cycle => ({
          ...cycle,
          variables: cycle.variables.map(variable => ({
            ...variable,
            status: Math.random() > 0.1 
              ? variable.status 
              : ["healthy", "warning", "critical"][Math.floor(Math.random() * 3)] as VariableInfo["status"]
          }))
        }));
        
        set({ 
          cycles: updatedCycles, 
          isLoading: false, 
          lastUpdated: Date.now() 
        });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: error instanceof Error ? error.message : "Failed to refresh data" 
        });
      }
    },
    
    loadInitialData: () => {
      set({
        cycles: timelineData.cycles,
        swirlData: initialSwirlData,
        blowchart: blowchartValues,
        lastUpdated: Date.now(),
        error: null,
      });
    },
    
    resetData: () => {
      set({
        cycles: timelineData.cycles,
        swirlData: initialSwirlData,
        blowchart: blowchartValues,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null,
      });
    },

    getCycleById: (id) => get().cycles.find(cycle => cycle.id === id) || null,
    
    getCyclesByTurbine: (turbine) => get().cycles.filter(cycle => cycle.turbine === turbine),
    
    getCyclesByDateRange: (from, to) => get().cycles.filter(cycle => 
      cycle.date >= from && cycle.date <= to
    ),
    
    getCyclesByStatus: (status) => get().cycles.filter(cycle =>
      cycle.variables.some(variable => variable.status === status)
    ),

    getSwirlDataByCycle: (cycleId) =>
      get().swirlData.find(entry => entry.cycle === cycleId)?.swirlData ?? null,
    
    getVariablesByGroup: (cycleId, group) => {
      const cycle = get().getCycleById(cycleId);
      return cycle?.variables.filter(variable => variable.group === group) || [];
    },

    getHealthySummary: () => {
      const cycles = get().cycles;
      const allVariables = cycles.flatMap(cycle => cycle.variables);
      
      return {
        total: allVariables.length,
        healthy: allVariables.filter(v => v.status === "healthy").length,
        warning: allVariables.filter(v => v.status === "warning").length,
        critical: allVariables.filter(v => v.status === "critical").length,
      };
    },
    
    getRecentCycles: (limit = 10) => {
      return [...get().cycles]
        .sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          return dateCompare !== 0 ? dateCompare : b.start - a.start;
        })
        .slice(0, limit);
    },
    
    searchCycles: (query) => {
      const searchTerm = query.toLowerCase();
      return get().cycles.filter(cycle =>
        cycle.name.toLowerCase().includes(searchTerm) ||
        cycle.turbine.toLowerCase().includes(searchTerm) ||
        cycle.id.toLowerCase().includes(searchTerm)
      );
    },
  }))
);