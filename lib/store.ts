import { create } from "zustand";

/* ----------------------------------------------------------------
  타입 정의
---------------------------------------------------------------- */
export interface VariableInfo {
  name: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  group: "진동" | "연소" | "전기" | "단위기기";
}

export interface CycleInfo {
  id: string;
  name: string;
  turbine: string;
  date: string; // YYYY-MM-DD
  start: number; // 시작 시간(0~22, 2시간 단위)
  end: number; // 종료 시간
  color: string; // tailwind gradient
  variables: VariableInfo[];
}

/* ----------------------------------------------------------------
  더미 데이터 생성 유틸
---------------------------------------------------------------- */
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const turbines = ["Turbine A", "Turbine B", "Turbine C", "Turbine D"];
const colors = [
  "from-emerald-500 to-emerald-600",
  "from-orange-500 to-red-700",
];

// 날짜 배열 생성(90일)
const dates = Array.from({ length: 90 }, (_, i) => {
  const d = new Date("2025-07-01");
  d.setDate(d.getDate() + i);
  return fmt(d);
});

// 변수 더미
const makeVars = (cycle: string): VariableInfo[] => [
  // 연소 그룹
  {
    name: "압축기",
    value: "",
    status: "healthy",
    group: "연소",
  },
  {
    name: "연료공급",
    value: "",
    status: Math.random() > 0.2 ? "healthy" : "critical",
    group: "연소",
  },
  {
    name: "연소기",
    value: "",
    status: "healthy",
    group: "연소",
  },
  {
    name: "배기가스",
    value: "",
    status: "warning",
    group: "연소",
  },
  // 진동 그룹
  {
    name: "축 진동",
    value: "",
    status: Math.random() > 0.3 ? "healthy" : "warning",
    group: "진동",
  },
  {
    name: "베어링 진동",
    value: "",
    status: "healthy",
    group: "진동",
  },
  {
    name: "메탈 온도",
    value: "",
    status: "healthy",
    group: "진동",
  },
  {
    name: "윤활 제어",
    value: "",
    status: "healthy",
    group: "진동",
  },

  // 전기 그룹
  {
    name: "발전기",
    value: "",
    status: "healthy",
    group: "전기",
  },
  {
    name: "차단기",
    value: "",
    status: "healthy",
    group: "전기",
  },
  {
    name: "펌프",
    value: "",
    status: "warning",
    group: "전기",
  },
  {
    name: "스타터",
    value: "",
    status: "healthy",
    group: "전기",
  },

  // 단위기기 그룹
  {
    name: "윤활 펌프",
    value: "",
    status: "healthy",
    group: "단위기기",
  },
  {
    name: "베어링 펌프",
    value: "",
    status: "healthy",
    group: "단위기기",
  },
  {
    name: "유압오일 펌프",
    value: "",
    status: "healthy",
    group: "단위기기",
  },
  {
    name: "씰 펌프",
    value: "",
    status: "healthy",
    group: "단위기기",
  },
];

// 사이클 더미
const makeCycles = (n: number): CycleInfo[] =>
  Array.from({ length: n }, (_, i) => {
    const date = dates[Math.floor(Math.random() * dates.length)];
    const start = Math.floor(Math.random() * 10) * 2;
    const dur = (Math.floor(Math.random() * 4) + 2) * 2;
    return {
      id: `cycle${i + 1}`,
      name: `Cycle ${i + 1}`,
      turbine: turbines[Math.floor(Math.random() * turbines.length)],
      date,
      start,
      end: Math.min(start + dur, 24),
      color: colors[i % colors.length],
      variables: makeVars(`${i + 1}`),
    };
  });

export const timelineData = {
  dates,
  turbines,
  cycles: makeCycles(53),
};

// 데모를 위한 Cycle 26 고정
timelineData.cycles.push({
  id: "cycle26",
  name: "Cycle 26",
  turbine: "Turbine B",
  date: "2025-07-17",
  start: 6,
  end: 10,
  color: "from-orange-500 to-red-500",
  variables: makeVars("26"),
});

/* ----------------------------------------------------------------
  주 상태 관리
---------------------------------------------------------------- */
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
}

interface DashboardState {
  /* 타임라인 */
  timeline: TimelineState;
  setScrollTo: (v: TimelineState["scrollTo"]) => void;
  setSelectedCycle: (c: CycleInfo | null) => void;
  navigateToDateTime: (date: string, time: number) => void;
  searchAndNavigateToCycle: (query: string) => void;
  navigateToMostRecent: () => void;
  navigateDate: (dir: "prev" | "next") => void;

  /* 날짜 범위 */
  selectedDateRange: { from: string; to: string };

  /* UI */
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  activeMenuItem: string;
  setActiveMenuItem: (id: string) => void;

  /* 필터 */
  selectedRegion: string;
  setSelectedRegion: (v: string) => void;
  selectedCC: string;
  setSelectedCC: (v: string) => void;

  /* 변수 그룹 */
  selectedVariableGroup: string;
  setSelectedVariableGroup: (group: string) => void;
  selectedVariableInfo: VariableInfo | null;
  setSelectedVariableInfo: (variable: VariableInfo | null) => void;

  /* 사이클 상세 정보 */
  selectedCycleInfo: CycleInfo | null;
  setSelectedCycleInfo: (cycle: CycleInfo | null) => void;

  /* 사이클 상세 보기 UI */
  showCycleDetails: boolean;
  setShowCycleDetails: (show: boolean) => void;
}

const getMostRecentCycle = (): CycleInfo | null => {
  if (timelineData.cycles.length === 0) return null;

  // Sort cycles by date (most recent first), then by start time
  const sortedCycles = [...timelineData.cycles].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.start - a.start;
  });
  return sortedCycles[0] ?? null;
};
export const useDashboardStore = create<DashboardState>((set) => ({
  /* 초기 타임라인 */
  timeline: {
    currentDate: dates[dates.length - 1], // Use the most recent date
    currentTime: 8,
    selectedCycle: null,
    scrollTo: null,
  },

  /* 일주일(월~일) 범위 - Use the most recent week */
  selectedDateRange: (() => {
    const mostRecentDate = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
    const monday = mondayOf(new Date(mostRecentDate));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: fmt(monday), to: fmt(sunday) };
  })(),

  /* UI 상태 */
  sidebarOpen: true,
  activeMenuItem: "dashboard",

  /* 필터 */
  selectedRegion: "",
  selectedCC: "",

  /* 변수 그룹 */
  selectedVariableGroup: "연소",
  selectedVariableInfo: null,

  /* 사이클 상세 정보 */
  selectedCycleInfo: null,
  showCycleDetails: false,
  setShowCycleDetails: (show: boolean) => set({ showCycleDetails: show }),
  /* setters ----------------------------------------------------- */
  setScrollTo: (v) =>
    set((s) => ({ timeline: { ...s.timeline, scrollTo: v } })),
  setSelectedCycle: (c) =>
    set((s) => ({ timeline: { ...s.timeline, selectedCycle: c } })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setActiveMenuItem: (id) => set({ activeMenuItem: id }),
  setSelectedRegion: (v) => set({ selectedRegion: v }),
  setSelectedCC: (v) => set({ selectedCC: v }),
  setSelectedVariableGroup: (group) => set({ selectedVariableGroup: group }),
  setSelectedVariableInfo: (variable) =>
    set({ selectedVariableInfo: variable }),
  setSelectedCycleInfo: (cycle) => set({ selectedCycleInfo: cycle }),

  /* 네비게이션 --------------------------------------------------- */
  navigateToDateTime: (date, time) =>
    set((s) => {
      const monday = mondayOf(new Date(`${date}T00:00:00Z`));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
        timeline: { ...s.timeline, scrollTo: { date, time } },
      };
    }),

  searchAndNavigateToCycle: (q) =>
    set((s) => {
      const m = q.trim().match(/(\d+)/);
      const found = m
        ? timelineData.cycles.find((c) => c.name === `Cycle ${m[1]}`)
        : null;
      if (!found) return s;
      const monday = mondayOf(new Date(`${found.date}T00:00:00Z`));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
        timeline: {
          ...s.timeline,
          selectedCycle: found,
          scrollTo: { date: found.date, time: found.start },
        },
      };
    }),

  navigateDate: (dir) =>
    set((s) => {
      const shift = dir === "prev" ? -7 : 7;
      const from = new Date(`${s.selectedDateRange.from}T00:00:00Z`);
      from.setDate(from.getDate() + shift);
      const to = new Date(from);
      to.setDate(from.getDate() + 6);
      return { selectedDateRange: { from: fmt(from), to: fmt(to) } };
    }),

  /* 최신 데이터로 이동 */
  navigateToMostRecent: () =>
    set((s) => {
      const mostRecentDate = dates[dates.length - 1];
      const mostRecentCycle = getMostRecentCycle();
      const monday = mondayOf(new Date(`${mostRecentDate}T00:00:00Z`));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
        timeline: {
          ...s.timeline,
          currentDate: mostRecentDate,
          selectedCycle: mostRecentCycle,
          scrollTo: mostRecentCycle
            ? { date: mostRecentCycle.date, time: mostRecentCycle.start }
            : null,
        },
      };
    }),
}));
