export type VariableStatus = "healthy" | "warning" | "critical";
export type VariableGroup = "진동" | "연소" | "전기" | "단위기기";

export interface VariableInfo {
  name: string;
  value: string;
  status: VariableStatus;
  group: VariableGroup;
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
  [key: string]: number;
}

export interface ChartInfo {
  title: string;
  type: string;
  icon: any;
}

export interface TimelineClickEvent {
  cycle: CycleInfo;
  event: React.MouseEvent;
}

export interface ChartClickEvent {
  chart: ChartInfo;
  event: React.MouseEvent;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
}

export interface CycleAnalysisData {
  totalCycles: number;
  avgDuration: string;
}

export interface TurbinePerformanceData {
  turbineCount: number;
  efficiency: string;
}

export type ReportData = HealthSummary | CycleAnalysisData | TurbinePerformanceData;

export interface Report {
  id: string;
  title: string;
  description: string;
  icon: any;
  data: ReportData;
}

// Seeded random number generator for consistent SSR/CSR
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

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

const makeVars = (cycle: string): VariableInfo[] => {
  const rng = new SeededRandom(parseInt(cycle) || 1);
  return [
    { name: "압축기", value: "", status: "healthy", group: "연소" },
    {
      name: "연료공급",
      value: "",
      status: rng.next() > 0.2 ? "healthy" : "critical",
      group: "연소",
    },
    { name: "연소기", value: "", status: "healthy", group: "연소" },
    { name: "배기가스", value: "", status: "warning", group: "연소" },
    {
      name: "축 진동",
      value: "",
      status: rng.next() > 0.3 ? "healthy" : "warning",
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
};

const makeCycles = (n: number): CycleInfo[] => {
  const rng = new SeededRandom(12345); // Fixed seed for consistency
  return Array.from({ length: n }, (_, i) => {
    const date = dates[Math.floor(rng.next() * dates.length)];
    const start = Math.floor(rng.next() * 10) * 2;
    const dur = (Math.floor(rng.next() * 4) + 2) * 2;
    return {
      id: `cycle${i + 1}`,
      name: `Cycle ${i + 1}`,
      turbine: turbines[Math.floor(rng.next() * turbines.length)],
      date,
      start,
      end: Math.min(start + dur, 24),
      color: colors[i % colors.length],
      variables: makeVars(`${i + 1}`),
    };
  });
};

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

export const blowchartValues: Blowchart = {
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