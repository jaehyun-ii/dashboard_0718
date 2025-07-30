import { create } from "zustand";
import { CycleInfo, timelineData } from "../data";

const fmt = (d: Date) => d.toISOString().slice(0, 10);

const mondayOf = (d: Date) => {
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d;
};

const getMostRecentCycle = (): CycleInfo | null => {
  if (timelineData.cycles.length === 0) return null;
  return [...timelineData.cycles].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateCompare !== 0 ? dateCompare : b.start - a.start;
  })[0];
};

interface TimelineState {
  currentDate: string;
  currentTime: number;
  selectedCycle: CycleInfo | null;
  scrollTo: { date: string; time: number } | null;
  selectedDateRange: { from: string; to: string };
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
}

interface TimelineStore extends TimelineState, TimelineActions {
  isInCurrentWeek: (date: string) => boolean;
  getCurrentWeekCycles: () => CycleInfo[];
  getVisibleTimeRange: () => { start: number; end: number };
}

const getInitialDateRange = () => {
  const mostRecentDate = new Date(`${timelineData.dates[timelineData.dates.length - 1]}T00:00:00Z`);
  const monday = mondayOf(new Date(mostRecentDate));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { from: fmt(monday), to: fmt(sunday) };
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  currentDate: timelineData.dates[timelineData.dates.length - 1],
  currentTime: 8,
  selectedCycle: null,
  scrollTo: null,
  selectedDateRange: getInitialDateRange(),

  setScrollTo: (v) => set({ scrollTo: v }),
  
  setSelectedCycle: (c) => set({ selectedCycle: c }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setCurrentDate: (date) => set({ currentDate: date }),
  
  resetTimeline: () => set({
    currentDate: timelineData.dates[timelineData.dates.length - 1],
    currentTime: 8,
    selectedCycle: null,
    scrollTo: null,
    selectedDateRange: getInitialDateRange(),
  }),

  navigateToDateTime: (date, time) => {
    const monday = mondayOf(new Date(`${date}T00:00:00Z`));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    set({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      scrollTo: { date, time },
      currentDate: date,
      currentTime: time,
    });
  },

  searchAndNavigateToCycle: (q) => {
    const m = q.trim().match(/(\d+)/);
    const found = m
      ? timelineData.cycles.find((c) => c.name === `Cycle ${m[1]}`)
      : null;
    if (!found) return;
    
    const monday = mondayOf(new Date(`${found.date}T00:00:00Z`));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    set({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      selectedCycle: found,
      scrollTo: { date: found.date, time: found.start },
      currentDate: found.date,
      currentTime: found.start,
    });
  },

  navigateDate: (dir) => {
    const shift = dir === "prev" ? -7 : 7;
    const from = new Date(`${get().selectedDateRange.from}T00:00:00Z`);
    from.setDate(from.getDate() + shift);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    set({ selectedDateRange: { from: fmt(from), to: fmt(to) } });
  },

  navigateToMostRecent: () => {
    const mostRecentDate = timelineData.dates[timelineData.dates.length - 1];
    const mostRecentCycle = getMostRecentCycle();
    const monday = mondayOf(new Date(`${mostRecentDate}T00:00:00Z`));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    set({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      currentDate: mostRecentDate,
      selectedCycle: mostRecentCycle,
      scrollTo: mostRecentCycle
        ? { date: mostRecentCycle.date, time: mostRecentCycle.start }
        : null,
    });
  },

  isInCurrentWeek: (date) => {
    const { from, to } = get().selectedDateRange;
    return date >= from && date <= to;
  },

  getCurrentWeekCycles: () => {
    const { from, to } = get().selectedDateRange;
    return timelineData.cycles.filter(cycle => 
      cycle.date >= from && cycle.date <= to
    );
  },

  getVisibleTimeRange: () => {
    const selectedCycle = get().selectedCycle;
    
    // 선택된 사이클이 있으면 해당 사이클의 시간 범위를 정확히 사용
    if (selectedCycle) {
      return {
        start: selectedCycle.start,
        end: selectedCycle.end,
      };
    }

    // 선택된 사이클이 없으면 현재 주의 모든 사이클 범위 사용
    const cycles = get().getCurrentWeekCycles();
    if (cycles.length === 0) return { start: 0, end: 24 };
    
    const minStart = Math.min(...cycles.map(c => c.start));
    const maxEnd = Math.max(...cycles.map(c => c.end));
    
    return {
      start: Math.max(0, minStart - 2),
      end: Math.min(24, maxEnd + 2),
    };
  },
}));