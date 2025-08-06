"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useTimelineStore, useUIStore } from "@/lib/stores";
import { Vibrate, Flame, Zap, Cpu } from "lucide-react";
import type { VariableInfo } from "@/lib/data";
import { CyclesAPI } from "@/lib/api/cycles-api";

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
    setCombustionApiData,
    combustionApiData,
    // 분리된 API 데이터 관리
    setSwirlChartApiData,
    setTemperatureDeviationApiData,
    setCombustionPressureApiData,
    swirlChartApiData,
    temperatureDeviationApiData,
    combustionPressureApiData,
  } = ui;

  const [isLoadingCombustionData, setIsLoadingCombustionData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 변수 그룹 한국어를 영어로 매핑
  const mapVariableGroupToEnglish = (koreanGroup: string): string => {
    switch (koreanGroup) {
      case "진동":
        return "vibration";
      case "연소":
        return "combustion";
      case "전기":
        return "electrical";
      case "단위기기":
        return "unit_device";
      default:
        return koreanGroup.toLowerCase();
    }
  };

  // 분 단위 시간을 ISO datetime 문자열로 변환
  const formatTimeToISO = (date: string, minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${date}T${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:00Z`;
  };

  const handleGroupClick = async (groupTitle: string) => {
    setSelectedVariableGroup(groupTitle);

    // API 호출을 위한 데이터 준비
    if (timeline.selectedCycle) {
      const { date, start, end } = timeline.selectedCycle;
      const startTime = formatTimeToISO(date, start);
      const endTime = formatTimeToISO(date, end);
      const variableGroupEng = mapVariableGroupToEnglish(groupTitle);

      try {
        setIsLoadingCombustionData(true);
        setApiError(null);

        const response = await CyclesAPI.GetSwirlChartData(startTime, endTime);

        if (response.success) {
          // 여기에서 필요한 경우 응답 데이터를 상태에 저장할 수 있습니다
        } else {
          console.error("API 호출 실패:", response.error);
          setApiError(response.error || "API 호출에 실패했습니다");
        }
      } catch (error) {
        console.error("API 호출 중 오류:", error);
        setApiError("API 호출 중 오류가 발생했습니다");
      } finally {
        setIsLoadingCombustionData(false);
      }
    }
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

  // Auto-fetch data when cycle or variable group changes
  useEffect(() => {
    if (timeline.selectedCycle && selectedVariableGroup) {
      const fetchVariableGroupData = async () => {
        const { date, start, end } = timeline.selectedCycle!;
        const startTime = formatTimeToISO(date, start);
        const endTime = formatTimeToISO(date, end);

        try {
          setIsLoadingCombustionData(true);
          setApiError(null);

          // 연소 그룹이 선택되었을 때 세 가지 차트 데이터 모두 호출
          if (selectedVariableGroup === "연소") {
            // 1. Swirl Chart (배기 온도) 데이터
            const swirlResponse = await CyclesAPI.GetSwirlChartSpecificData(
              startTime,
              endTime
            );

            if (swirlResponse.success) {
              setSwirlChartApiData(swirlResponse.data);
            } else {
              console.error("Swirl Chart API 호출 실패:", swirlResponse.error);
            }

            // 2. 온도 편차 차트 데이터
            const temperatureResponse =
              await CyclesAPI.GetTemperatureDeviationData(startTime, endTime);

            if (temperatureResponse.success) {
              setTemperatureDeviationApiData(temperatureResponse.data);
            } else {
              console.error(
                "Temperature Deviation API 호출 실패:",
                temperatureResponse.error
              );
            }

            // 3. 연소 동압 차트 데이터
            const pressureResponse = await CyclesAPI.GetCombustionPressureData(
              startTime,
              endTime
            );

            if (pressureResponse.success) {
              setCombustionPressureApiData(pressureResponse.data);
            } else {
              console.error(
                "Combustion Pressure API 호출 실패:",
                pressureResponse.error
              );
            }

            // 하위 호환성을 위해 Swirl 데이터를 기본 combustionApiData에도 저장
            if (swirlResponse.success) {
              setCombustionApiData(swirlResponse.data);
            }
          } else {
            // 다른 그룹은 기존 방식 사용
            const response = await CyclesAPI.GetSwirlChartData(
              startTime,
              endTime
            );

            if (response.success) {
              setCombustionApiData(response.data);
            } else {
              console.error("기존 API 호출 실패:", response.error);
              setApiError(response.error || "API 호출에 실패했습니다");
            }
          }
        } catch (error) {
          console.error("자동 API 호출 중 오류:", error);
          setApiError("API 호출 중 오류가 발생했습니다");
        } finally {
          setIsLoadingCombustionData(false);
        }
      };

      fetchVariableGroupData();
    }
  }, [timeline.selectedCycle, selectedVariableGroup]);

  if (!timeline.selectedCycle) {
    return (
      <div className="mt-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
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
        <h2 className="text-4xl font-bold text-slate-800 ">이상탐지 변수</h2>
        {/* 선택된 사이클 정보 출력 */}
        <div className="flex items-center">
          <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-medium ml-3">
            변수 표시 대상: {timeline.selectedCycle?.name || "없음"}
          </div>
          {/* API 로딩 상태 표시 */}
          {isLoadingCombustionData && (
            <div className="ml-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent mr-2"></div>
              API 호출 중...
            </div>
          )}
          {/* API 에러 상태 표시 */}
          {apiError && (
            <div className="ml-3 px-3 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              오류: {apiError}
            </div>
          )}
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
                    <h3 className="font-bold text-slate-800 text-2xl capitalize">
                      {groupTitle}
                    </h3>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-base font-semibold border ${statusBadgeColors[overallStatus]}`}
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
                      <div className="text-lg font-medium text-slate-700 truncate">
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
