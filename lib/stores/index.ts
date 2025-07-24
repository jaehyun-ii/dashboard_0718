import { useTimelineStore } from "./timeline-store";
import { useUIStore } from "./ui-store";
import { useDataStore } from "./data-store";
import { useEffect } from "react";

export const useCombinedStore = () => {
  const timeline = useTimelineStore();
  const ui = useUIStore();
  const data = useDataStore();

  useEffect(() => {
    let prevTimelineSelectedCycle = useTimelineStore.getState().selectedCycle;
    let prevUISelectedCycleInfo = useUIStore.getState().selectedCycleInfo;
    let prevDataCycles = useDataStore.getState().cycles;

    const unsubscribeTimeline = useTimelineStore.subscribe((state) => {
      const currentSelectedCycle = state.selectedCycle;
      if (currentSelectedCycle !== prevTimelineSelectedCycle) {
        prevTimelineSelectedCycle = currentSelectedCycle;
        if (currentSelectedCycle) {
          useUIStore.getState().setSelectedCycleInfo(currentSelectedCycle);
        }
      }
    });

    const unsubscribeUI = useUIStore.subscribe((state) => {
      const currentSelectedCycleInfo = state.selectedCycleInfo;
      if (currentSelectedCycleInfo !== prevUISelectedCycleInfo) {
        prevUISelectedCycleInfo = currentSelectedCycleInfo;
        const currentTimeline = useTimelineStore.getState();
        if (
          currentSelectedCycleInfo &&
          currentSelectedCycleInfo.id !== currentTimeline.selectedCycle?.id
        ) {
          currentTimeline.setSelectedCycle(currentSelectedCycleInfo);
          currentTimeline.navigateToDateTime(
            currentSelectedCycleInfo.date,
            currentSelectedCycleInfo.start
          );
        }
      }
    });

    const unsubscribeData = useDataStore.subscribe((state) => {
      const currentCycles = state.cycles;
      if (currentCycles !== prevDataCycles) {
        prevDataCycles = currentCycles;
        const currentTimeline = useTimelineStore.getState();
        const currentUI = useUIStore.getState();
        const currentSelected = currentTimeline.selectedCycle;
        if (currentSelected) {
          const updatedCycle = currentCycles.find(
            (c) => c.id === currentSelected.id
          );
          if (updatedCycle && updatedCycle !== currentSelected) {
            currentTimeline.setSelectedCycle(updatedCycle);
            currentUI.setSelectedCycleInfo(updatedCycle);
          }
        }
      }
    });

    return () => {
      unsubscribeTimeline();
      unsubscribeUI();
      unsubscribeData();
    };
  }, []);

  return {
    timeline,
    ui,
    data,
  };
};

export const useStoreActions = () => {
  const timeline = useTimelineStore();
  const ui = useUIStore();
  const data = useDataStore();

  const selectCycle = (cycle: (typeof data.cycles)[0] | null) => {
    timeline.setSelectedCycle(cycle);
    ui.setSelectedCycleInfo(cycle);
    if (cycle) {
      timeline.navigateToDateTime(cycle.date, cycle.start);
    }
  };

  const navigateToMostRecentCycle = () => {
    const recentCycles = data.getRecentCycles(1);
    if (recentCycles.length > 0) {
      selectCycle(recentCycles[0]);
    }
    timeline.navigateToMostRecent();
  };

  const searchAndNavigate = (query: string) => {
    const foundCycles = data.searchCycles(query);
    if (foundCycles.length > 0) {
      selectCycle(foundCycles[0]);
    } else {
      timeline.searchAndNavigateToCycle(query);
    }
  };

  const openCycleDetails = (cycle: (typeof data.cycles)[0]) => {
    selectCycle(cycle);
    ui.setShowCycleDetails(true);
    ui.openModal("cycleDetails");
  };

  const refreshAllData = async () => {
    data.setLoading(true);
    try {
      await data.refreshData();
      const currentCycle = timeline.selectedCycle;
      if (currentCycle) {
        const updatedCycle = data.getCycleById(currentCycle.id);
        if (updatedCycle) {
          selectCycle(updatedCycle);
        }
      }
    } finally {
      data.setLoading(false);
    }
  };

  const resetAllStores = () => {
    timeline.resetTimeline();
    ui.resetUIState();
    data.resetData();
  };

  const getFilteredCycles = () => {
    let filteredCycles = data.cycles;

    if (ui.hasActiveFilters()) {
      const { filters } = ui;

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
    const weekCycles = timeline.getCurrentWeekCycles();
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
  const timeline = useTimelineStore();
  const ui = useUIStore();
  const data = useDataStore();

  const selectedCycleData = timeline.selectedCycle
    ? {
        cycle: timeline.selectedCycle,
        swirlData: data.getSwirlDataByCycle(timeline.selectedCycle.id),
        variablesByGroup: Object.fromEntries(
          ["진동", "연소", "전기", "단위기기"].map((group) => [
            group,
            data.getVariablesByGroup(timeline.selectedCycle!.id, group as any),
          ])
        ),
      }
    : null;

  const dashboardSummary = {
    totalCycles: data.cycles.length,
    healthSummary: data.getHealthySummary(),
    recentCycles: data.getRecentCycles(5),
    currentWeekCycles: timeline.getCurrentWeekCycles(),
    hasActiveFilters: ui.hasActiveFilters(),
    isLoading: data.isLoading,
    lastUpdated: new Date(data.lastUpdated).toLocaleString(),
  };

  const navigationState = {
    canNavigatePrev: timeline.selectedDateRange.from > data.cycles[0]?.date,
    canNavigateNext:
      timeline.selectedDateRange.to < data.cycles[data.cycles.length - 1]?.date,
    currentWeek: timeline.selectedDateRange,
    timeRange: timeline.getVisibleTimeRange(),
  };

  return {
    selectedCycleData,
    dashboardSummary,
    navigationState,
    timeline,
    ui,
    data,
  };
};

export * from "./timeline-store";
export * from "./ui-store";
export * from "./data-store";
export * from "./middleware";
