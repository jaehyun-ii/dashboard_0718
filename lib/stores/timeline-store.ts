import { create } from "zustand";
import { CycleInfo } from "../data";
import { CyclesAPI, formatApiError } from "../api/cycles-api";

const fmt = (d: Date) => d.toISOString().slice(0, 10);

const mondayOf = (d: Date) => {
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d;
};


interface TimelineState {
  currentDate: string;
  currentTime: number;
  selectedCycle: CycleInfo | null;
  scrollTo: { date: string; time: number } | null;
  selectedDateRange: { from: string; to: string };
  cycles: CycleInfo[];
  isLoading: boolean;
  error: string | null;
}

interface TimelineActions {
  setScrollTo: (v: TimelineState["scrollTo"]) => void;
  setSelectedCycle: (c: CycleInfo | null) => void;
  navigateToDateTime: (date: string, time: number) => void;
  searchAndNavigateToCycle: (query: string) => void;
  navigateToMostRecent: () => void;
  navigateDate: (dir: "prev" | "next") => void;
  setCurrentTime: (time: number) => void;
  setCurrentDate: (date: string) => void;
  resetTimeline: () => void;
  
  // API actions
  fetchCyclesNavigation: (baseTime: string, direction: 'previous' | 'next' | 'current') => Promise<void>;
  fetchCyclesByCycleNumber: (cycleNumber: number) => Promise<void>;
  fetchCyclesByDateTime: (dateTime: string) => Promise<void>;
  fetchRecentCycles: () => Promise<void>;
  setCycles: (cycles: CycleInfo[]) => void;
  setError: (error: string | null) => void;
}

interface TimelineStore extends TimelineState, TimelineActions {
  isInCurrentWeek: (date: string) => boolean;
  getCurrentWeekCycles: () => CycleInfo[];
  getVisibleTimeRange: () => { start: number; end: number };
  getMostRecentCycle: () => CycleInfo | null;
}

const getInitialDateRange = () => {
  // This will be updated when cycles/recent API is called
  const today = new Date();
  const monday = mondayOf(new Date(today));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: fmt(monday), to: fmt(sunday) };
};

const getDateRangeFromCycles = (cycles: CycleInfo[]) => {
  if (cycles.length === 0) {
    return getInitialDateRange();
  }
  
  // Get the latest date from cycles to show the week containing the most recent cycle
  const dates = cycles.map(cycle => cycle.date).sort();
  const lastDate = dates[dates.length - 1];
  
  // Use the week containing the most recent cycle
  const monday = mondayOf(new Date(`${lastDate}T00:00:00Z`));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return { from: fmt(monday), to: fmt(sunday) };
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  currentDate: fmt(new Date()),
  currentTime: 8,
  selectedCycle: null,
  scrollTo: null,
  selectedDateRange: getInitialDateRange(),
  cycles: [],
  isLoading: false,
  error: null,

  setScrollTo: (v) => set({ scrollTo: v }),
  
  setSelectedCycle: (c) => set({ selectedCycle: c }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setCurrentDate: (date) => set({ currentDate: date }),
  
  resetTimeline: () => set({
    currentDate: fmt(new Date()),
    currentTime: 8,
    selectedCycle: null,
    scrollTo: null,
    selectedDateRange: getInitialDateRange(),
    cycles: [],
    isLoading: false,
    error: null,
  }),

  navigateToDateTime: async (date, time) => {
    const dateTime = `${date}T${String(time).padStart(2, '0')}:00:00Z`;
    await get().fetchCyclesByDateTime(dateTime);
    
    set({
      scrollTo: { date, time },
      currentDate: date,
      currentTime: time,
    });
  },

  searchAndNavigateToCycle: async (q) => {
    const m = q.trim().match(/(\d+)/);
    if (!m) return;
    
    const cycleNumber = parseInt(m[1], 10);
    await get().fetchCyclesByCycleNumber(cycleNumber);
  },

  navigateDate: async (dir) => {
    const currentRange = get().selectedDateRange;
    const baseTime = dir === "prev" ? `${currentRange.from}T00:00:00Z` : `${currentRange.to}T23:59:59Z`;
    const direction = dir === "prev" ? "previous" : "next";
    
    await get().fetchCyclesNavigation(baseTime, direction);
  },

  navigateToMostRecent: async () => {
    await get().fetchRecentCycles();
  },

  isInCurrentWeek: (date) => {
    const { from, to } = get().selectedDateRange;
    return date >= from && date <= to;
  },

  getCurrentWeekCycles: () => {
    const { from, to } = get().selectedDateRange;
    return get().cycles.filter(cycle => 
      cycle.date >= from && cycle.date <= to
    );
  },

  getVisibleTimeRange: () => {
    const selectedCycle = get().selectedCycle;
    
    // 선택된 사이클이 있으면 해당 사이클의 시간 범위를 정확히 사용 (분 단위)
    if (selectedCycle) {
      return {
        start: selectedCycle.start,
        end: selectedCycle.end,
      };
    }

    // 선택된 사이클이 없으면 현재 주의 모든 사이클 범위 사용 (분 단위)
    const cycles = get().getCurrentWeekCycles();
    if (cycles.length === 0) return { start: 0, end: 24 * 60 }; // 0-1440분 (24시간)
    
    const minStart = Math.min(...cycles.map(c => c.start));
    const maxEnd = Math.max(...cycles.map(c => c.end));
    
    return {
      start: Math.max(0, minStart - 120), // 2시간(120분) 여유
      end: Math.min(24 * 60, maxEnd + 120), // 2시간(120분) 여유, 최대 24시간
    };
  },

  getMostRecentCycle: () => {
    const cycles = get().cycles;
    if (cycles.length === 0) return null;
    return [...cycles].sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      return dateCompare !== 0 ? dateCompare : b.start - a.start;
    })[0];
  },

  // API actions
  fetchCyclesNavigation: async (baseTime, direction) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CyclesAPI.fetchCyclesNavigation({ base_time: baseTime, direction });
      const cycles = response.data.cycles;
      
      if (cycles.length > 0) {
        // Calculate date range based on the cycles data
        const dateRange = getDateRangeFromCycles(cycles);
        
        set({
          cycles,
          selectedDateRange: dateRange,
          isLoading: false,
        });
      } else {
        set({
          cycles: [],
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: formatApiError(error),
      });
    }
  },

  fetchCyclesByCycleNumber: async (cycleNumber) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CyclesAPI.fetchCyclesByCycleNumber(cycleNumber);
      const cycles = response.data.cycles;
      
      if (cycles.length > 0) {
        const found = cycles.find(c => c.name === `Cycle ${cycleNumber}`);
        // Calculate date range based on the cycles data
        const dateRange = getDateRangeFromCycles(cycles);
        
        set({
          cycles,
          selectedDateRange: dateRange,
          selectedCycle: found || null,
          scrollTo: found ? { date: found.date, time: found.start } : null,
          currentDate: found?.date || cycles[0].date,
          currentTime: found?.start || 8,
          isLoading: false,
        });
      } else {
        set({
          cycles: [],
          selectedCycle: null,
          scrollTo: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: formatApiError(error),
      });
    }
  },

  fetchCyclesByDateTime: async (dateTime) => {
    set({ isLoading: true, error: null });
    try {
      const response = await CyclesAPI.fetchCyclesByDateTime({ date_time: dateTime });
      const cycles = response.data.cycles;
      
      if (cycles.length > 0) {
        // Calculate date range based on the cycles data
        const dateRange = getDateRangeFromCycles(cycles);
        
        set({
          cycles,
          selectedDateRange: dateRange,
          isLoading: false,
        });
      } else {
        set({
          cycles: [],
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: formatApiError(error),
      });
    }
  },

  fetchRecentCycles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await CyclesAPI.fetchRecentCycles();
      const cycles = response.data.cycles;
      
      if (cycles.length > 0) {
        const mostRecentCycle = [...cycles].sort((a, b) => {
          const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
          return dateCompare !== 0 ? dateCompare : b.start - a.start;
        })[0];
        
        // Calculate date range based on the cycles data
        const dateRange = getDateRangeFromCycles(cycles);
        
        set({
          cycles,
          selectedDateRange: dateRange,
          currentDate: mostRecentCycle.date,
          currentTime: mostRecentCycle.start,
          selectedCycle: mostRecentCycle,
          scrollTo: { date: mostRecentCycle.date, time: mostRecentCycle.start },
          isLoading: false,
        });
      } else {
        // If no cycles, keep current date range but clear cycles
        set({
          cycles: [],
          selectedCycle: null,
          scrollTo: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: formatApiError(error),
      });
    }
  },

  setCycles: (cycles) => set({ cycles }),
  
  setError: (error) => set({ error }),
}));