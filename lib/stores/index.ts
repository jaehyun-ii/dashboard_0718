import React from "react";
import { useTimelineStore } from "./timeline-store";
import { useUIStore } from "./ui-store";
import { useDataStore } from "./data-store";
import { useReportsStore } from "./reports-store";
import { CycleInfo, VariableInfo } from "../data";

// Store coordination manager - handles inter-store communication
class StoreCoordinator {
  public subscriptions: (() => void)[] = [];
  public isInitialized = false;

  private prevState = {
    timelineSelectedCycle: null as CycleInfo | null,
    uiSelectedCycleInfo: null as CycleInfo | null,
    dataCycles: [] as CycleInfo[],
  };

  initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initialize previous state
    this.prevState.timelineSelectedCycle = useTimelineStore.getState().selectedCycle;
    this.prevState.uiSelectedCycleInfo = useUIStore.getState().selectedCycleInfo;
    this.prevState.dataCycles = useDataStore.getState().cycles;

    // Timeline -> UI synchronization
    const unsubscribeTimeline = useTimelineStore.subscribe((state) => {
      const currentSelectedCycle = state.selectedCycle;
      if (currentSelectedCycle !== this.prevState.timelineSelectedCycle) {
        this.prevState.timelineSelectedCycle = currentSelectedCycle;
        if (currentSelectedCycle) {
          const uiState = useUIStore.getState();
          if (uiState.selectedCycleInfo?.id !== currentSelectedCycle.id) {
            uiState.setSelectedCycleInfo(currentSelectedCycle);
          }
        }
      }
    });

    // UI -> Timeline synchronization
    const unsubscribeUI = useUIStore.subscribe((state) => {
      const currentSelectedCycleInfo = state.selectedCycleInfo;
      if (currentSelectedCycleInfo !== this.prevState.uiSelectedCycleInfo) {
        this.prevState.uiSelectedCycleInfo = currentSelectedCycleInfo;
        const timelineState = useTimelineStore.getState();
        if (
          currentSelectedCycleInfo &&
          currentSelectedCycleInfo.id !== timelineState.selectedCycle?.id
        ) {
          timelineState.setSelectedCycle(currentSelectedCycleInfo);
          timelineState.navigateToDateTime(
            currentSelectedCycleInfo.date,
            currentSelectedCycleInfo.start
          );
        }
      }
    });

    // Data -> Timeline/UI synchronization  
    const unsubscribeData = useDataStore.subscribe((state) => {
      const currentCycles = state.cycles;
      if (currentCycles !== this.prevState.dataCycles) {
        this.prevState.dataCycles = currentCycles;
        const timelineState = useTimelineStore.getState();
        const uiState = useUIStore.getState();
        const currentSelected = timelineState.selectedCycle;
        
        if (currentSelected) {
          const updatedCycle = currentCycles.find(c => c.id === currentSelected.id);
          if (updatedCycle && updatedCycle !== currentSelected) {
            timelineState.setSelectedCycle(updatedCycle);
            uiState.setSelectedCycleInfo(updatedCycle);
          }
        }
      }
    });

    this.subscriptions.push(unsubscribeTimeline, unsubscribeUI, unsubscribeData);
  }

  destroy() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.isInitialized = false;
    // Clear references to prevent memory leaks
    this.prevState = {
      timelineSelectedCycle: null,
      uiSelectedCycleInfo: null,
      dataCycles: [],
    };
  }
}

// Global coordinator instance
let storeCoordinator: StoreCoordinator | null = null;

// Initialize store coordination (call once in app)
export const initializeStoreCoordination = () => {
  if (!storeCoordinator) {
    storeCoordinator = new StoreCoordinator();
  }
  storeCoordinator.initialize();
  return storeCoordinator;
};

// Cleanup store coordination
export const destroyStoreCoordination = () => {
  if (storeCoordinator) {
    storeCoordinator.destroy();
    storeCoordinator = null;
  }
};

// Hook for initializing store coordination with proper cleanup
export const useStoreCoordination = () => {
  React.useEffect(() => {
    const coordinator = initializeStoreCoordination();
    
    // Development-only: Add window cleanup for hot reload
    if (process.env.NODE_ENV === 'development') {
      (window as any).__destroyStoreCoordination = destroyStoreCoordination;
    }
    
    return () => {
      // Cleanup when component unmounts
      destroyStoreCoordination();
    };
  }, []);
};

// Development helper to check for memory leaks
export const getStoreCoordinationStatus = () => {
  return {
    isInitialized: storeCoordinator?.isInitialized ?? false,
    subscriptionCount: storeCoordinator?.subscriptions.length ?? 0,
  };
};

// Simple hook that just returns the stores without coordination logic
export const useStores = () => {
  return {
    timeline: useTimelineStore(),
    ui: useUIStore(),
    data: useDataStore(),
    reports: useReportsStore(),
  };
};

export const useStoreActions = () => {
  const stores = useStores();

  const selectCycle = (cycle: CycleInfo | null) => {
    // Store coordination will handle synchronization automatically
    stores.timeline.setSelectedCycle(cycle);
    if (cycle) {
      stores.timeline.navigateToDateTime(cycle.date, cycle.start);
    }
  };

  const navigateToMostRecentCycle = () => {
    const recentCycles = stores.data.getRecentCycles(1);
    if (recentCycles.length > 0) {
      selectCycle(recentCycles[0]);
    }
    stores.timeline.navigateToMostRecent();
  };

  const searchAndNavigate = (query: string) => {
    const foundCycles = stores.data.searchCycles(query);
    if (foundCycles.length > 0) {
      selectCycle(foundCycles[0]);
    } else {
      stores.timeline.searchAndNavigateToCycle(query);
    }
  };

  const openCycleDetails = (cycle: CycleInfo) => {
    selectCycle(cycle);
    stores.ui.setShowCycleDetails(true);
    stores.ui.openModal("cycleDetails");
  };

  const refreshAllData = async () => {
    stores.data.setLoading(true);
    try {
      await stores.data.refreshData();
      // Store coordination will handle synchronization automatically
    } finally {
      stores.data.setLoading(false);
    }
  };

  const resetAllStores = () => {
    stores.timeline.resetTimeline();
    stores.ui.resetUIState();
    stores.data.resetData();
  };

  const getFilteredCycles = () => {
    let filteredCycles = stores.data.cycles;

    if (stores.ui.hasActiveFilters()) {
      const { filters } = stores.ui;

      if (filters.turbineFilter.length > 0) {
        filteredCycles = filteredCycles.filter((cycle) =>
          filters.turbineFilter.includes(cycle.turbine)
        );
      }

      if (filters.statusFilter.length > 0) {
        filteredCycles = filteredCycles.filter((cycle) =>
          cycle.variables.some((variable) =>
            filters.statusFilter.includes(variable.status)
          )
        );
      }

      if (filters.dateFilter.enabled) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.dateFilter.range);
        const cutoffString = cutoffDate.toISOString().slice(0, 10);

        filteredCycles = filteredCycles.filter(
          (cycle) => cycle.date >= cutoffString
        );
      }
    }

    return filteredCycles;
  };

  const getCurrentWeekData = () => {
    const weekCycles = stores.timeline.getCurrentWeekCycles();
    const filteredCycles = getFilteredCycles();

    return weekCycles.filter((cycle) =>
      filteredCycles.some((filtered) => filtered.id === cycle.id)
    );
  };

  return {
    selectCycle,
    navigateToMostRecentCycle,
    searchAndNavigate,
    openCycleDetails,
    refreshAllData,
    resetAllStores,
    getFilteredCycles,
    getCurrentWeekData,
  };
};

export const useStoreSelectors = () => {
  const stores = useStores();

  const selectedCycleData = stores.timeline.selectedCycle
    ? {
        cycle: stores.timeline.selectedCycle,
        swirlData: stores.data.getSwirlDataByCycle(stores.timeline.selectedCycle.id),
        variablesByGroup: Object.fromEntries(
          (["진동", "연소", "전기", "단위기기"] as const).map((group) => [
            group,
            stores.data.getVariablesByGroup(stores.timeline.selectedCycle!.id, group),
          ])
        ),
      }
    : null;

  const dashboardSummary = {
    totalCycles: stores.data.cycles.length,
    healthSummary: stores.data.getHealthySummary(),
    recentCycles: stores.data.getRecentCycles(5),
    currentWeekCycles: stores.timeline.getCurrentWeekCycles(),
    hasActiveFilters: stores.ui.hasActiveFilters(),
    isLoading: stores.data.isLoading,
    lastUpdated: new Date(stores.data.lastUpdated).toLocaleString(),
  };

  const navigationState = {
    canNavigatePrev: stores.timeline.selectedDateRange.from > stores.data.cycles[0]?.date,
    canNavigateNext:
      stores.timeline.selectedDateRange.to < stores.data.cycles[stores.data.cycles.length - 1]?.date,
    currentWeek: stores.timeline.selectedDateRange,
    timeRange: stores.timeline.getVisibleTimeRange(),
  };

  return {
    selectedCycleData,
    dashboardSummary,
    navigationState,
    ...stores,
  };
};

export * from "./timeline-store";
export * from "./ui-store";
export * from "./data-store";
export * from "./reports-store";
export * from "./middleware";
