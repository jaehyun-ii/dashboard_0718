"use client";

import type React from "react";
import { useEffect } from "react";
import { useTimelineStore, useUIStore } from "@/lib/stores";
import { Vibrate, Flame, Zap, Cpu } from "lucide-react";
import type { VariableInfo } from "@/lib/data";

const getGroupDetails = (group: string) => {
  switch (group) {
    case "진동":
      return { icon: Vibrate, gradient: "from-emerald-500 to-teal-600" };
    case "연소":
      return { icon: Flame, gradient: "from-orange-500 to-red-600" };
    case "전기":
      return { icon: Zap, gradient: "from-blue-500 to-indigo-600" };
    case "단위기기":
      return { icon: Cpu, gradient: "from-purple-500 to-pink-600" };
    default:
      return { icon: Vibrate, gradient: "from-slate-500 to-slate-600" };
  }
};

const statusBadgeColors: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const statusDotColors: Record<string, string> = {
  healthy: "bg-emerald-500",
  warning: "bg-orange-500",
  critical: "bg-red-500",
};

const getStatusText = (status: string) => {
  switch (status) {
    case "healthy":
      return "정상";
    case "warning":
      return "경고";
    case "critical":
      return "위험";
    default:
      return status;
  }
};

export function VariableStatusCards() {
  const timeline = useTimelineStore();
  const ui = useUIStore();
  const {
    selectedVariableGroup,
    setSelectedVariableGroup,
    setSelectedVariableInfo,
  } = ui;

  const handleGroupClick = (groupTitle: string) => {
    setSelectedVariableGroup(groupTitle);
  };

  const handleVariableClick = (variable: VariableInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVariableInfo(variable);
  };

  // Auto-select first variable group when a new cycle is selected
  useEffect(() => {
    if (timeline.selectedCycle && timeline.selectedCycle.variables.length > 0) {
      const firstGroup = timeline.selectedCycle.variables[0].group;
      if (
        !selectedVariableGroup ||
        !timeline.selectedCycle.variables.some(
          (v) => v.group === selectedVariableGroup
        )
      ) {
        setSelectedVariableGroup(firstGroup);
      }
    }
  }, [timeline.selectedCycle, selectedVariableGroup, setSelectedVariableGroup]);

  if (!timeline.selectedCycle) {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          이상탐지 변수
        </h2>
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500">
            타임라인에서 사이클을 선택하여 이상탐지 변수를 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  const groupedVariables = (timeline.selectedCycle?.variables ?? []).reduce(
    (acc, variable) => {
      (acc[variable.group] = acc[variable.group] || []).push(variable);
      return acc;
    },
    {} as Record<string, VariableInfo[]>
  );

  return (
    <div className="mt-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 ">이상탐지 변수</h2>
        {/* 선택된 사이클 정보 출력 */}
        <div className="flex">
          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium ml-3">
            변수 표시 대상: {timeline.selectedCycle?.name || "없음"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 max-w-full">
        {Object.entries(groupedVariables).map(([groupTitle, variables]) => {
          const { icon: Icon, gradient } = getGroupDetails(groupTitle);
          const overallStatus = variables.some((v) => v.status === "critical")
            ? "critical"
            : variables.some((v) => v.status === "warning")
            ? "warning"
            : "healthy";
          const isSelected = selectedVariableGroup === groupTitle;

          return (
            <div
              key={groupTitle}
              className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? "border-blue-500 ring-4 ring-blue-500/20 scale-105 shadow-2xl"
                  : "border-slate-200 hover:shadow-xl hover:scale-[1.02]"
              }`}
              onClick={() => handleGroupClick(groupTitle)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg capitalize">
                      {groupTitle}
                    </h3>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadgeColors[overallStatus]}`}
                >
                  {getStatusText(overallStatus).toUpperCase()}
                </span>
              </div>

              {/* 4가지 요소를 2x2 그리드로 배치 */}
              <div className="grid grid-cols-2 gap-2">
                {variables.slice(0, 4).map((variable) => (
                  <div
                    key={variable.name}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors duration-200"
                    onClick={(e) => handleVariableClick(variable, e)}
                    title={variable.name}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">
                        {variable.name}
                      </div>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        statusDotColors[variable.status]
                      } shadow-sm`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
