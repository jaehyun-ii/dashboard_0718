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
  date: string;
  start: number;
  end: number;
  color: string;
  variables: VariableInfo[];
}

export interface SwirlSensor {
  name: string;
  value: number;
}

export interface SwirlDatum {
  datetime: string;
  output: number;
  sensors: SwirlSensor[];
}

export interface SwirlDataEntry {
  cycle: string;
  swirlData: SwirlDatum[];
}

export interface Blowchart {
  [key: string]: number; // can1~can14
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

const dates = Array.from({ length: 90 }, (_, i) => {
  const d = new Date("2025-07-01");
  d.setDate(d.getDate() + i);
  return fmt(d);
});

const makeVars = (cycle: string): VariableInfo[] => [
  { name: "압축기", value: "", status: "healthy", group: "연소" },
  {
    name: "연료공급",
    value: "",
    status: Math.random() > 0.2 ? "healthy" : "critical",
    group: "연소",
  },
  { name: "연소기", value: "", status: "healthy", group: "연소" },
  { name: "배기가스", value: "", status: "warning", group: "연소" },
  {
    name: "축 진동",
    value: "",
    status: Math.random() > 0.3 ? "healthy" : "warning",
    group: "진동",
  },
  { name: "베어링 진동", value: "", status: "healthy", group: "진동" },
  { name: "메탈 온도", value: "", status: "healthy", group: "진동" },
  { name: "윤활 제어", value: "", status: "healthy", group: "진동" },
  { name: "발전기", value: "", status: "healthy", group: "전기" },
  { name: "차단기", value: "", status: "healthy", group: "전기" },
  { name: "펌프", value: "", status: "warning", group: "전기" },
  { name: "스타터", value: "", status: "healthy", group: "전기" },
  { name: "윤활 펌프", value: "", status: "healthy", group: "단위기기" },
  { name: "베어링 펌프", value: "", status: "healthy", group: "단위기기" },
  { name: "유압오일 펌프", value: "", status: "healthy", group: "단위기기" },
  { name: "씰 펌프", value: "", status: "healthy", group: "단위기기" },
];

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

const mondayOf = (d: Date) => {
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d;
};

/* ----------------------------------------------------------------
  Blowchart 초기값
---------------------------------------------------------------- */
const blowchartValues: Blowchart = {
  can1: 0.000602628,
  can2: 0.000288516,
  can3: 0.002008296,
  can4: 0.000280384,
  can5: 0.000292252,
  can6: 0.000385734,
  can7: 0.000127051,
  can8: 0.00010946,
  can9: 0.000181385,
  can10: 0.000175555,
  can11: 0.000114472,
  can12: 0.000100567,
  can13: 0.000116268,
  can14: 0.000127051,
};

/* ----------------------------------------------------------------
  Zustand Store
---------------------------------------------------------------- */
interface TimelineState {
  currentDate: string;
  currentTime: number;
  selectedCycle: CycleInfo | null;
  scrollTo: { date: string; time: number } | null;
}

interface DashboardState {
  timeline: TimelineState;
  setScrollTo: (v: TimelineState["scrollTo"]) => void;
  setSelectedCycle: (c: CycleInfo | null) => void;
  navigateToDateTime: (date: string, time: number) => void;
  searchAndNavigateToCycle: (query: string) => void;
  navigateToMostRecent: () => void;
  navigateDate: (dir: "prev" | "next") => void;

  selectedDateRange: { from: string; to: string };

  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  activeMenuItem: string;
  setActiveMenuItem: (id: string) => void;

  selectedRegion: string;
  setSelectedRegion: (v: string) => void;
  selectedCC: string;
  setSelectedCC: (v: string) => void;

  selectedVariableGroup: string;
  setSelectedVariableGroup: (group: string) => void;
  selectedVariableInfo: VariableInfo | null;
  setSelectedVariableInfo: (variable: VariableInfo | null) => void;

  selectedCycleInfo: CycleInfo | null;
  setSelectedCycleInfo: (cycle: CycleInfo | null) => void;

  showCycleDetails: boolean;
  setShowCycleDetails: (show: boolean) => void;

  swirlData: SwirlDataEntry[];
  setSwirlData: (data: SwirlDataEntry[]) => void;
  getSwirlDataByCycle: (cycleId: string) => SwirlDatum[] | null;

  blowchart: Blowchart;
  setBlowchart: (data: Blowchart) => void;
}

const getMostRecentCycle = (): CycleInfo | null => {
  if (timelineData.cycles.length === 0) return null;
  return [...timelineData.cycles].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    return dateCompare !== 0 ? dateCompare : b.start - a.start;
  })[0];
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  timeline: {
    currentDate: dates[dates.length - 1],
    currentTime: 8,
    selectedCycle: null,
    scrollTo: null,
  },

  selectedDateRange: (() => {
    const mostRecentDate = new Date(`${dates[dates.length - 1]}T00:00:00Z`);
    const monday = mondayOf(new Date(mostRecentDate));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: fmt(monday), to: fmt(sunday) };
  })(),

  sidebarOpen: true,
  activeMenuItem: "dashboard",

  selectedRegion: "",
  selectedCC: "",

  selectedVariableGroup: "연소",
  selectedVariableInfo: null,

  selectedCycleInfo: null,
  showCycleDetails: false,
  setShowCycleDetails: (show) => set({ showCycleDetails: show }),

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

  navigateToDateTime: (date, time) => {
    const monday = mondayOf(new Date(`${date}T00:00:00Z`));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    set((s) => ({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      timeline: { ...s.timeline, scrollTo: { date, time } },
    }));
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
    set((s) => ({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      timeline: {
        ...s.timeline,
        selectedCycle: found,
        scrollTo: { date: found.date, time: found.start },
      },
    }));
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
    const mostRecentDate = dates[dates.length - 1];
    const mostRecentCycle = getMostRecentCycle();
    const monday = mondayOf(new Date(`${mostRecentDate}T00:00:00Z`));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    set((s) => ({
      selectedDateRange: { from: fmt(monday), to: fmt(sunday) },
      timeline: {
        ...s.timeline,
        currentDate: mostRecentDate,
        selectedCycle: mostRecentCycle,
        scrollTo: mostRecentCycle
          ? { date: mostRecentCycle.date, time: mostRecentCycle.start }
          : null,
      },
    }));
  },

  swirlData: [
    {
      cycle: "215",
      swirlData: [
        {
          datetime: "2023-11-15 17:30:53",
          output: 0.15,
          sensors: Array.from({ length: 27 }, (_, i) => ({
            name: `T${i + 1}`,
            value: 10 + Math.random() * 5,
          })),
        },
      ],
    },
  ],

  setSwirlData: (data) => set({ swirlData: data }),
  getSwirlDataByCycle: (cycleId) =>
    get().swirlData.find((entry) => entry.cycle === cycleId)?.swirlData ?? null,

  blowchart: blowchartValues,
  setBlowchart: (data) => set({ blowchart: data }),
}));
