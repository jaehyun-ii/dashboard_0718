import { create } from "zustand";
import { persist } from "zustand/middleware";
import { VariableInfo, CycleInfo } from "../data";

interface UIState {
  sidebarOpen: boolean;
  activeMenuItem: string;
  selectedRegion: string;
  selectedCC: string;
  selectedVariableGroup: string;
  selectedVariableInfo: VariableInfo | null;
  selectedCycleInfo: CycleInfo | null;
  showCycleDetails: boolean;
  
  modals: {
    cycleDetails: boolean;
    variableDetails: boolean;
    settings: boolean;
  };
  
  filters: {
    turbineFilter: string[];
    statusFilter: string[];
    dateFilter: { enabled: boolean; range: number };
  };
  
  viewPreferences: {
    theme: "light" | "dark" | "system";
    compactMode: boolean;
    showMinimap: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
}

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveMenuItem: (id: string) => void;
  setSelectedRegion: (region: string) => void;
  setSelectedCC: (cc: string) => void;
  setSelectedVariableGroup: (group: string) => void;
  setSelectedVariableInfo: (variable: VariableInfo | null) => void;
  setSelectedCycleInfo: (cycle: CycleInfo | null) => void;
  setShowCycleDetails: (show: boolean) => void;
  toggleCycleDetails: () => void;
  
  openModal: (modal: keyof UIState["modals"]) => void;
  closeModal: (modal: keyof UIState["modals"]) => void;
  toggleModal: (modal: keyof UIState["modals"]) => void;
  closeAllModals: () => void;
  
  setTurbineFilter: (turbines: string[]) => void;
  setStatusFilter: (statuses: string[]) => void;
  setDateFilter: (enabled: boolean, range?: number) => void;
  clearFilters: () => void;
  
  updateViewPreferences: (prefs: Partial<UIState["viewPreferences"]>) => void;
  resetViewPreferences: () => void;
  
  resetUIState: () => void;
}

interface UIStore extends UIState, UIActions {
  isModalOpen: (modal: keyof UIState["modals"]) => boolean;
  hasActiveFilters: () => boolean;
  getFilteredTurbines: (allTurbines: string[]) => string[];
}

const defaultViewPreferences: UIState["viewPreferences"] = {
  theme: "system",
  compactMode: false,
  showMinimap: true,
  autoRefresh: false,
  refreshInterval: 30000,
};

const defaultFilters: UIState["filters"] = {
  turbineFilter: [],
  statusFilter: [],
  dateFilter: { enabled: false, range: 7 },
};

const defaultModals: UIState["modals"] = {
  cycleDetails: false,
  variableDetails: false,
  settings: false,
};

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      activeMenuItem: "dashboard",
      selectedRegion: "",
      selectedCC: "",
      selectedVariableGroup: "연소",
      selectedVariableInfo: null,
      selectedCycleInfo: null,
      showCycleDetails: false,
      modals: defaultModals,
      filters: defaultFilters,
      viewPreferences: defaultViewPreferences,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setActiveMenuItem: (id) => set({ activeMenuItem: id }),
      
      setSelectedRegion: (region) => set({ selectedRegion: region }),
      
      setSelectedCC: (cc) => set({ selectedCC: cc }),
      
      setSelectedVariableGroup: (group) => set({ selectedVariableGroup: group }),
      
      setSelectedVariableInfo: (variable) => set({ selectedVariableInfo: variable }),
      
      setSelectedCycleInfo: (cycle) => set({ selectedCycleInfo: cycle }),
      
      setShowCycleDetails: (show) => set({ showCycleDetails: show }),
      
      toggleCycleDetails: () => set((state) => ({ showCycleDetails: !state.showCycleDetails })),

      openModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: true }
      })),
      
      closeModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: false }
      })),
      
      toggleModal: (modal) => set((state) => ({
        modals: { ...state.modals, [modal]: !state.modals[modal] }
      })),
      
      closeAllModals: () => set({ modals: defaultModals }),

      setTurbineFilter: (turbines) => set((state) => ({
        filters: { ...state.filters, turbineFilter: turbines }
      })),
      
      setStatusFilter: (statuses) => set((state) => ({
        filters: { ...state.filters, statusFilter: statuses }
      })),
      
      setDateFilter: (enabled, range = 7) => set((state) => ({
        filters: { ...state.filters, dateFilter: { enabled, range } }
      })),
      
      clearFilters: () => set({ filters: defaultFilters }),

      updateViewPreferences: (prefs) => set((state) => ({
        viewPreferences: { ...state.viewPreferences, ...prefs }
      })),
      
      resetViewPreferences: () => set({ viewPreferences: defaultViewPreferences }),
      
      resetUIState: () => set({
        sidebarOpen: true,
        activeMenuItem: "dashboard",
        selectedRegion: "",
        selectedCC: "",
        selectedVariableGroup: "연소",
        selectedVariableInfo: null,
        selectedCycleInfo: null,
        showCycleDetails: false,
        modals: defaultModals,
        filters: defaultFilters,
      }),

      isModalOpen: (modal) => get().modals[modal],
      
      hasActiveFilters: () => {
        const { filters } = get();
        return (
          filters.turbineFilter.length > 0 ||
          filters.statusFilter.length > 0 ||
          filters.dateFilter.enabled
        );
      },
      
      getFilteredTurbines: (allTurbines) => {
        const { filters } = get();
        return filters.turbineFilter.length > 0 
          ? filters.turbineFilter 
          : allTurbines;
      },
    }),
    {
      name: "dashboard-ui-storage",
      partialize: (state) => ({
        viewPreferences: state.viewPreferences,
        sidebarOpen: state.sidebarOpen,
        activeMenuItem: state.activeMenuItem,
        selectedVariableGroup: state.selectedVariableGroup,
      }),
    }
  )
);