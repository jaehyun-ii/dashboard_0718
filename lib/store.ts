// @deprecated - Use individual stores from './stores' directory instead
// This file is kept for backward compatibility and will be removed in a future version

export { 
  timelineData,
} from './data';

// Re-export types for backward compatibility
export type {
  VariableInfo,
  CycleInfo,
  SwirlSensor,
  SwirlDatum,
  SwirlDataEntry,
  Blowchart,
} from './data';

// Re-export new stores
export {
  useTimelineStore,
  useUIStore,
  useDataStore,
  useCombinedStore,
  useStoreActions,
  useStoreSelectors,
} from './stores';

// Provide a migration helper
export const useDashboardStore = () => {
  console.warn(
    'useDashboardStore is deprecated. Use individual stores (useTimelineStore, useUIStore, useDataStore) or useCombinedStore instead.'
  );
  
  const { useTimelineStore, useUIStore, useDataStore } = require('./stores');
  const timeline = useTimelineStore();
  const ui = useUIStore();
  const data = useDataStore();
  
  // Return a legacy-compatible interface
  return {
    // Timeline state
    timeline: {
      currentDate: timeline.currentDate,
      currentTime: timeline.currentTime,
      selectedCycle: timeline.selectedCycle,
      scrollTo: timeline.scrollTo,
    },
    selectedDateRange: timeline.selectedDateRange,
    
    // UI state
    sidebarOpen: ui.sidebarOpen,
    activeMenuItem: ui.activeMenuItem,
    selectedRegion: ui.selectedRegion,
    selectedCC: ui.selectedCC,
    selectedVariableGroup: ui.selectedVariableGroup,
    selectedVariableInfo: ui.selectedVariableInfo,
    selectedCycleInfo: ui.selectedCycleInfo,
    showCycleDetails: ui.showCycleDetails,
    
    // Data state
    swirlData: data.swirlData,
    blowchart: data.blowchart,
    
    // Actions
    setScrollTo: timeline.setScrollTo,
    setSelectedCycle: timeline.setSelectedCycle,
    setSidebarOpen: ui.setSidebarOpen,
    setActiveMenuItem: ui.setActiveMenuItem,
    setSelectedRegion: ui.setSelectedRegion,
    setSelectedCC: ui.setSelectedCC,
    setSelectedVariableGroup: ui.setSelectedVariableGroup,
    setSelectedVariableInfo: ui.setSelectedVariableInfo,
    setSelectedCycleInfo: ui.setSelectedCycleInfo,
    setShowCycleDetails: ui.setShowCycleDetails,
    navigateToDateTime: timeline.navigateToDateTime,
    searchAndNavigateToCycle: timeline.searchAndNavigateToCycle,
    navigateDate: timeline.navigateDate,
    navigateToMostRecent: timeline.navigateToMostRecent,
    setSwirlData: data.setSwirlData,
    getSwirlDataByCycle: data.getSwirlDataByCycle,
    setBlowchart: data.setBlowchart,
  };
};
