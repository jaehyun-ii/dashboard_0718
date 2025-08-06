"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useTimelineStore } from "@/lib/stores";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush,
} from "recharts";

export interface DeviationChartProps {
  selectedTime?: number;
  apiData?: any;
  className?: string;
}

// 온도 변수별 색상 정의
const TEMPERATURE_COLORS = {
  TTXSP1: "#ef4444", // 빨간색
  TTXSP2: "#f97316", // 주황색
  TTXSP3: "#eab308", // 노란색
  TTXSP4: "#22c55e", // 초록색
  TTXSPL: "#8b5cf6", // 보라색 (제한값)
};

// 데이터 추출용 (TTXM 포함)
const ALL_TEMPERATURE_VARIABLES = {
  TTXSP1: "#ef4444", // 빨간색
  TTXSP2: "#f97316", // 주황색
  TTXSP3: "#eab308", // 노란색
  TTXSP4: "#22c55e", // 초록색
  TTXM: "#3b82f6", // 파란색 (평균) - 데이터는 추출하지만 차트에서 제외
  TTXSPL: "#8b5cf6", // 보라색 (제한값)
};

// 변수별 한국어 레이블
const TEMPERATURE_LABELS = {
  TTXSP1: "온도 SP1",
  TTXSP2: "온도 SP2",
  TTXSP3: "온도 SP3",
  TTXSP4: "온도 SP4",
  TTXM: "평균 온도",
  TTXSPL: "온도 제한값",
};

export const DeviationChart = React.memo<DeviationChartProps>(
  ({ selectedTime, apiData, className = "" }) => {
    const { selectedCycle } = useTimelineStore();
    const [hoveredTime, setHoveredTime] = useState<number | null>(null);
    const [visibleSeries, setVisibleSeries] = useState<Record<string, boolean>>(
      Object.keys(TEMPERATURE_COLORS).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    // 시간 포맷팅 헬퍼 함수
    const formatMinutesToTime = useCallback((minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    }, []);

    // API 데이터에서 온도 편차 데이터 추출 및 시계열 변환
    const chartData = useMemo(() => {
      if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        return [];
      }

      // 시계열 데이터를 차트용 포맷으로 변환
      const processedData = apiData.map((dataPoint, index) => {
        // 사이클 시간 기반으로 실제 시간 계산
        let actualTime = 0;
        if (selectedCycle) {
          const cycleDuration = selectedCycle.end - selectedCycle.start; // 분 단위
          const timeProgress = index / (apiData.length - 1); // 0-1 범위
          actualTime = selectedCycle.start + cycleDuration * timeProgress; // 분 단위
        }

        const result: any = {
          index,
          time: index, // 데이터 인덱스
          actualTime, // 실제 시간 (분 단위)
          timeFormatted: formatMinutesToTime(actualTime), // hh:mm 형식
        };

        // 6개 온도 변수 추출 - API 데이터 구조에 맞게 11G_ 접두사 사용
        Object.keys(ALL_TEMPERATURE_VARIABLES).forEach((variable) => {
          // API 데이터 구조: [0]["11G_TTXM"] 형식
          const possibleKeys = [
            `11G_${variable}:`, // 콜론 포함
            `11G_${variable}`, // 콜론 없음
            `${variable}:`, // 접두사 없음 + 콜론
            variable, // 접두사 없음
          ];
          let value = 0;

          for (const key of possibleKeys) {
            if (dataPoint[key] !== undefined) {
              value = typeof dataPoint[key] === "number" ? dataPoint[key] : 0;
              break;
            }
          }

          result[variable] = value;
        });

        return result;
      });

      // API 키들이 실제로 어떻게 되어있는지 확인
      if (apiData.length > 0) {
        // TTXM 관련 키들 찾기
        const ttxmKeys = Object.keys(apiData[0]).filter(
          (key) => key.includes("TTXM") || key.includes("TTXSP")
        );
      }

      return processedData;
    }, [apiData, selectedCycle]);

    // 통계 계산
    const statistics = useMemo(() => {
      if (!chartData.length) return null;

      const stats: any = {};
      Object.keys(ALL_TEMPERATURE_VARIABLES).forEach((variable) => {
        const values = chartData.map((d) => d[variable]).filter((v) => v > 0);
        if (values.length > 0) {
          stats[variable] = {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
          };
        }
      });

      return stats;
    }, [chartData]);

    // 커스텀 툴팁
    const CustomTooltip = useCallback(
      ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-gray-800 mb-2">
              데이터 포인트: {label + 1}/{chartData.length}
            </p>
            {payload.map((entry: any) => (
              <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {
                    TEMPERATURE_LABELS[
                      entry.dataKey as keyof typeof TEMPERATURE_LABELS
                    ]
                  }
                  :
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {entry.value.toFixed(1)}°C
                </span>
              </div>
            ))}
          </div>
        );
      },
      [chartData.length]
    );
    // 시리즈 가시성 토글 함수
    const toggleSeries = useCallback(
      (variable: string) => {
        setVisibleSeries((prev) => ({ ...prev, [variable]: !prev[variable] }));
      },
      [setVisibleSeries]
    );

    if (!chartData.length) {
      return (
        <div className={`flex items-center justify-center h-64 ${className}`}>
          <div className="text-center">
            <div className="text-gray-400 mb-2">온도 편차 데이터 없음</div>
            <div className="text-sm text-gray-500">
              {selectedCycle
                ? "API에서 데이터를 가져오는 중..."
                : "사이클을 선택하세요"}
            </div>
            {/* 디버깅 정보 */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <div><strong>디버깅 정보:</strong></div>
              <div>API Data: {apiData ? (Array.isArray(apiData) ? `Array(${apiData.length})` : typeof apiData) : 'null'}</div>
              <div>Selected Cycle: {selectedCycle ? selectedCycle.name : 'null'}</div>
              <div>Selected Time: {selectedTime}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full space-y-4 ${className}`}>
        {/* 데이터 시리즈 토글 버튼들 */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="text-sm font-medium text-slate-600 mb-3">
            데이터 시리즈 표시/숨김
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TEMPERATURE_COLORS).map(([variable, color]) => (
              <button
                key={variable}
                onClick={() => toggleSeries(variable)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  visibleSeries[variable]
                    ? "text-white shadow-md transform scale-105"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                style={{
                  backgroundColor: visibleSeries[variable] ? color : undefined,
                  borderColor: color,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: visibleSeries[variable]
                        ? "white"
                        : color,
                      borderColor: visibleSeries[variable] ? "white" : color,
                    }}
                  />
                  <span>
                    {
                      TEMPERATURE_LABELS[
                        variable as keyof typeof TEMPERATURE_LABELS
                      ]
                    }
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 메인 차트 */}
        <div
          className="bg-white rounded-lg p-4 border"
          style={{ height: "400px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              {/* 브러시 (시간 범위 선택) */}
              <Brush dataKey="timeFormatted" height={30} stroke="#8884d8" />
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="timeFormatted"
                stroke="#64748b"
                fontSize={12}
                interval="preserveStartEnd"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${value}°C`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) =>
                  TEMPERATURE_LABELS[value as keyof typeof TEMPERATURE_LABELS]
                }
                wrapperStyle={{ fontSize: "12px" }}
              />

              {/* 각 온도 변수별 라인 - 가시성에 따라 렌더링 */}
              {Object.entries(TEMPERATURE_COLORS).map(([variable, color]) =>
                visibleSeries[variable] ? (
                  <Line
                    key={variable}
                    type="monotone"
                    dataKey={variable}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                    name={variable}
                  />
                ) : null
              )}
              {console.log("selectedTime", selectedTime)}
              {/* 현재 선택된 시간 표시 */}
              {selectedTime !== undefined && (
                <ReferenceLine
                  x={formatMinutesToTime(selectedTime)}
                  stroke="#ef4444" // 빨간색
                  strokeWidth={2} // 굵은 실선
                  strokeDasharray={undefined} // 실선
                  ifOverflow="visible"
                  label={{
                    value: "현재",
                    position: "top",
                    fontSize: 14,
                    fill: "#ef4444",
                    fontWeight: "bold",
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

DeviationChart.displayName = "DeviationChart";

export default DeviationChart;
