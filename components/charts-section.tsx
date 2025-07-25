"use client";

import {
  BarChart,
  LineChart,
  Table,
  TrendingUp,
  Vibrate,
  Flame,
  Zap,
  Cpu,
} from "lucide-react";
import { useUIStore } from "@/lib/stores";
import { SwirlChart } from "./swirl-chart";
import TemperatureDeviationChart from "./temperature-deviation-chart";
import BlowGraph from "./blow-graph";
import ModeChart from "./mode-chart";
const groupDisplayData = {
  연소: {
    title: "연소 분석",
    description: "화염, 온도 및 연료 관련 데이터",
    icon: Flame,
    gradient: "from-orange-500 to-red-600",
    charts: [
      { title: "배기 온도", type: "선형 차트", icon: LineChart },
      { title: "온도 편차", type: "막대 차트", icon: BarChart },
      { title: "연소 동압", type: "막대 차트", icon: BarChart },
      { title: "연료 모드", type: "데이터 테이블", icon: Table },
    ],
  },
  진동: {
    title: "진동 분석",
    description: "진동 및 베어링 관련 데이터",
    icon: Vibrate,
    gradient: "from-emerald-500 to-teal-600",
    charts: [
      { title: "진동 추세 (mm/s)", type: "선형 차트", icon: LineChart },
      { title: "베어링 온도", type: "선형 차트", icon: LineChart },
      { title: "축 속도 (RPM)", type: "데이터 테이블", icon: Table },
    ],
  },

  전기: {
    title: "전기 분석",
    description: "전력 관련 데이터",
    icon: Zap,
    gradient: "from-blue-500 to-indigo-600",
    charts: [
      { title: "전압 변동", type: "선형 차트", icon: LineChart },
      { title: "전력 소비", type: "막대 차트", icon: BarChart },
      { title: "주파수 안정성", type: "데이터 테이블", icon: Table },
    ],
  },
  단위기기: {
    title: "장치 분석",
    description: "펌프 관련 데이터",
    icon: Cpu,
    gradient: "from-purple-500 to-pink-600",
    charts: [
      { title: "CPU 및 메모리 사용량", type: "선형 차트", icon: LineChart },
      { title: "디스크 I/O 성능", type: "막대 차트", icon: BarChart },
      { title: "네트워크 처리량", type: "데이터 테이블", icon: Table },
    ],
  },
  default: {
    title: "분석 대시보드",
    description: "상세 차트를 보려면 이상탐지 변수 카테고리를 선택하세요.",
    icon: TrendingUp,
    gradient: "from-slate-500 to-slate-600",
    charts: [
      { title: "Chart A", type: "선형 차트", icon: LineChart },
      { title: "Chart B", type: "막대 차트", icon: BarChart },
      { title: "Table C", type: "데이터 테이블", icon: Table },
    ],
  },
};

export function ChartsSection() {
  const { selectedVariableGroup } = useUIStore();

  const handleChartClick = (chart: any) => {
    alert(`Opening ${chart.title} for ${selectedVariableGroup} group.`);
  };

  const displayData =
    groupDisplayData[selectedVariableGroup as keyof typeof groupDisplayData] ||
    groupDisplayData.default;
  const { icon: GroupIcon, gradient } = displayData;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}
          >
            <GroupIcon size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-800">
              {displayData.title}
            </h2>
            <p className="text-slate-600">{displayData.description}</p>
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-4 xl:grid-cols-${displayData.charts.length} gap-6 max-w-full`}
      >
        {displayData.charts.map((chart) => (
          <div
            key={chart.title}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group"
            onClick={() => handleChartClick(chart)}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <chart.icon size={28} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-base font-medium text-slate-500 uppercase tracking-wide">
                  {chart.type}
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 mb-8 ">
              {chart.title}
            </h3>
            {chart.title === "배기 온도" ? (
              <SwirlChart showControls={false} cycleId={"215"} />
            ) : (
              <div></div>
            )}
            {chart.title === "온도 편차" ? (
              <TemperatureDeviationChart />
            ) : (
              <div></div>
            )}
            {chart.title === "연소 동압" ? <BlowGraph /> : <div></div>}
            {chart.title === "연료 모드" ? <ModeChart /> : <div></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
