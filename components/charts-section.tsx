"use client";

import React, { useMemo, useCallback } from "react";
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
import { ChartInfo } from "@/lib/data";
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
      //1열 1/3 차지
      { title: "배기 온도", type: "선형 차트", icon: LineChart },
      //1열 1/3 차지
      { title: "연소 동압", type: "막대 차트", icon: BarChart },
      //1열 1/3 차지
      { title: "온도 편차", type: "막대 차트", icon: BarChart },
      //2얄 전체 차지
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

// Memoized chart renderer component
const ChartRenderer = React.memo(({ title }: { title: string }) => {
  switch (title) {
    case "배기 온도":
      return <SwirlChart showControls={false} cycleId="215" />;
    case "온도 편차":
      return <TemperatureDeviationChart />;
    case "연소 동압":
      return <BlowGraph />;
    case "연료 모드":
      return <ModeChart />;
    default:
      return (
        <div className="h-48 flex items-center justify-center text-gray-500">
          차트 준비 중...
        </div>
      );
  }
});

ChartRenderer.displayName = "ChartRenderer";

export const ChartsSection = React.memo(() => {
  const { selectedVariableGroup } = useUIStore();

  const handleChartClick = useCallback(
    (chart: ChartInfo) => {
      alert(`Opening ${chart.title} for ${selectedVariableGroup} group.`);
    },
    [selectedVariableGroup]
  );

  const { displayData, GroupIcon, gradient } = useMemo(() => {
    const data =
      groupDisplayData[
        selectedVariableGroup as keyof typeof groupDisplayData
      ] || groupDisplayData.default;
    return {
      displayData: data,
      GroupIcon: data.icon,
      gradient: data.gradient,
    };
  }, [selectedVariableGroup]);

  // 연소 그룹에 대한 특별한 레이아웃 렌더링
  const renderCombustionLayout = () => {
    const charts = displayData.charts;
    
    return (
      <div className="space-y-6">
        {/* 첫 번째 행: 3개 차트가 1/3씩 차지 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {charts.slice(0, 3).map((chart, index) => (
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
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {chart.type}
                  </div>
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 md:mb-8">
                {chart.title}
              </h3>
              <ChartRenderer title={chart.title} />
            </div>
          ))}
        </div>
        
        {/* 두 번째 행: 연료 모드 차트가 전체 너비 차지 */}
        {charts.length > 3 && (
          <div className="w-full">
            <div
              className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              onClick={() => handleChartClick(charts[3])}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {React.createElement(charts[3].icon, { size: 28, className: "text-white" })}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    {charts[3].type}
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-8">
                {charts[3].title}
              </h3>
              <ChartRenderer title={charts[3].title} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // 기본 그리드 레이아웃 렌더링
  const renderDefaultLayout = () => {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-full">
        {displayData.charts.map((chart, index) => (
          <div
            key={chart.title}
            className={`bg-white rounded-2xl p-6 shadow-lg border border-slate-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${
              displayData.charts.length === 3 && index === 2 ? "md:col-span-2" : ""
            }`}
            onClick={() => handleChartClick(chart)}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <chart.icon size={28} className="text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  {chart.type}
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              {chart.title}
            </h3>
            <ChartRenderer title={chart.title} />
          </div>
        ))}
      </div>
    );
  };

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
            <h2 className="text-3xl font-bold text-slate-800">
              {displayData.title}
            </h2>
            <p className="text-slate-600">{displayData.description}</p>
          </div>
        </div>
      </div>
      
      {/* 큰 박스 (외부 컨테이너) */}
      <div className="bg-slate-50 rounded-3xl p-8 shadow-xl border border-slate-300">
        {/* 연소 그룹일 때 특별한 레이아웃, 아니면 기본 레이아웃 */}
        {selectedVariableGroup === "연소" 
          ? renderCombustionLayout() 
          : renderDefaultLayout()
        }
      </div>
    </div>
  );
});

ChartsSection.displayName = "ChartsSection";