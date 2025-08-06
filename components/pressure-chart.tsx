"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTimelineStore, useUIStore } from "@/lib/stores";
import { CyclesAPI } from "@/lib/api/cycles-api";
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

export interface PressureChartProps {
  selectedTime?: number;
  apiData?: any;
  className?: string;
}

// 밴드 타입별 색상 정의 (백엔드 API 값과 일치)
const BAND_COLORS = {
  low: "#ef4444", // 빨간색
  mid: "#f97316", // 주황색
  high: "#eab308", // 노란색
  blowout: "#22c55e", // 초록색
  screech: "#3b82f6", // 파란색
};

// 밴드별 한국어 레이블
const BAND_LABELS = {
  low: "저주파 (A1)",
  mid: "중주파 (A2)",
  high: "고주파 (A3)",
  blowout: "블로우아웃 (A4)",
  screech: "스크리치 (A6)",
};

// 밴드 타입에 따른 A 번호 매핑
const BAND_TO_A_NUMBER = {
  low: "A1",
  mid: "A2",
  high: "A3",
  blowout: "A4",
  screech: "A6",
};

export const PressureChart = React.memo<PressureChartProps>(
  ({ selectedTime, className = "" }) => {
    const { selectedCycle } = useTimelineStore();
    const { setCombustionPressureApiData } = useUIStore();
    const [selectedBandType, setSelectedBandType] = useState<string>("low");
    const [currentApiData, setCurrentApiData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 시간 포맷팅 헬퍼 함수
    const formatMinutesToTime = useCallback((minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.floor(minutes % 60);
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;
    }, []);

    // 분 단위 시간을 ISO datetime 문자열로 변환
    const formatTimeToISO = useCallback(
      (date: string, minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${date}T${hours.toString().padStart(2, "0")}:${mins
          .toString()
          .padStart(2, "0")}:00Z`;
      },
      []
    );

    // bandType 변경 시 API 호출
    const fetchPressureData = useCallback(
      async (bandType: string) => {
        if (!selectedCycle) return;

        const { date, start, end } = selectedCycle;
        const startTime = formatTimeToISO(date, start);
        const endTime = formatTimeToISO(date, end);

        console.log(`연소동압 API 호출: ${bandType}`);
        console.log(`사이클 시간: ${startTime} ~ ${endTime}`);

        try {
          setIsLoading(true);
          const response = await CyclesAPI.GetCombustionPressureData(
            startTime,
            endTime,
            bandType
          );

          if (response.success) {
            console.log(`${bandType} API 호출 성공:`, response.data);
            setCurrentApiData(response.data);
            setCombustionPressureApiData(response.data);
          } else {
            console.error(`${bandType} API 호출 실패:`, response.error);
            setCurrentApiData(null);
          }
        } catch (error) {
          console.error(`${bandType} API 호출 중 오류:`, error);
          setCurrentApiData(null);
        } finally {
          setIsLoading(false);
        }
      },
      [selectedCycle, formatTimeToISO, setCombustionPressureApiData]
    );

    // 밴드 타입 변경 핸들러
    const handleBandTypeChange = useCallback(
      (bandType: string) => {
        setSelectedBandType(bandType);
        fetchPressureData(bandType);
      },
      [fetchPressureData]
    );

    // 사이클 변경 시 현재 선택된 밴드 타입으로 API 호출
    useEffect(() => {
      if (selectedCycle) {
        fetchPressureData(selectedBandType);
      }
    }, [selectedCycle, selectedBandType, fetchPressureData]);

    // API 데이터에서 압력 데이터 추출 및 센서별 차트 데이터 변환
    const chartData = useMemo(() => {
      console.log("=== Pressure Chart Data Processing ===");
      console.log("Raw apiData:", currentApiData);
      console.log("Selected time:", selectedTime);
      console.log("Selected cycle:", selectedCycle);
      console.log("Selected band type:", selectedBandType);

      if (
        !currentApiData ||
        !Array.isArray(currentApiData) ||
        currentApiData.length === 0
      ) {
        console.log("No pressure API data available");
        return [];
      }

      // 현재 선택된 시간에 해당하는 데이터 포인트 찾기
      let timeIndex = 0;
      if (selectedTime !== undefined && selectedCycle) {
        const cycleDuration = selectedCycle.end - selectedCycle.start;
        const timeFromStart = selectedTime - selectedCycle.start;
        const cycleProgress =
          cycleDuration > 0
            ? Math.max(0, Math.min(1, timeFromStart / cycleDuration))
            : 0;
        timeIndex = Math.floor(cycleProgress * (currentApiData.length - 1));
      }

      // 해당 시점의 데이터 포인트 가져오기
      const currentDataPoint = currentApiData[timeIndex];
      console.log(
        `Using data point at index ${timeIndex} for time ${selectedTime}`
      );

      // 선택된 밴드 타입에 따른 A 번호
      const aBandNumber =
        BAND_TO_A_NUMBER[selectedBandType as keyof typeof BAND_TO_A_NUMBER];

      // 센서별 데이터 생성 (x축: 센서 번호 1-14, y축: 압력값)
      const sensorData = [];
      for (let sensorNumber = 1; sensorNumber <= 14; sensorNumber++) {
        const keyPattern = `11G_A_96KP${sensorNumber
          .toString()
          .padStart(2, "0")}_${aBandNumber}`;
        const rawValue = currentDataPoint[keyPattern];
        const pressure = typeof rawValue === "number" ? rawValue * 1000 : 0; // 스케일링

        sensorData.push({
          sensorNumber,
          pressure,
          rawValue: rawValue || 0,
        });
      }

      console.log(`Selected band: ${selectedBandType} (${aBandNumber})`);
      console.log("Sensor data:", sensorData);
      console.log(
        "Average pressure:",
        sensorData.reduce((sum, item) => sum + item.pressure, 0) /
          sensorData.length
      );

      return sensorData;
    }, [currentApiData, selectedCycle, selectedBandType, selectedTime]);

    // 통계 계산을 위한 현재 차트 데이터
    const currentPressureValue = useMemo(() => {
      if (!chartData.length) return 0;
      return (
        chartData.reduce((sum, item) => sum + item.pressure, 0) /
        chartData.length
      );
    }, [chartData]);

    // 통계 계산 - 원본 값 기준
    const statistics = useMemo(() => {
      if (!chartData.length) return null;

      const rawValues = chartData.map((d) => d.rawValue);
      const pressureValues = chartData.map((d) => d.pressure);

      return {
        min: Math.min(...rawValues),
        max: Math.max(...rawValues),
        avg: rawValues.reduce((a, b) => a + b, 0) / rawValues.length,
        current: currentPressureValue,
        // 스케일된 값들 (차트 표시용)
        scaledMin: Math.min(...pressureValues),
        scaledMax: Math.max(...pressureValues),
        scaledAvg: pressureValues.reduce((a, b) => a + b, 0) / pressureValues.length,
      };
    }, [chartData, currentPressureValue]);

    // 커스텀 툴팁
    const CustomTooltip = useCallback(
      ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-gray-800 mb-2">
              센서 번호: {label}
            </p>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    BAND_COLORS[selectedBandType as keyof typeof BAND_COLORS],
                }}
              />
              <span className="text-sm font-medium text-gray-700">
                {BAND_LABELS[selectedBandType as keyof typeof BAND_LABELS]}:
              </span>
              <span className="text-sm font-bold text-gray-900">
                {payload[0].value.toFixed(3)} mPa
              </span>
            </div>
          </div>
        );
      },
      [selectedBandType]
    );

    if (!chartData.length && !isLoading) {
      return (
        <div className={`flex items-center justify-center h-64 ${className}`}>
          <div className="text-center">
            <div className="text-gray-400 mb-2">연소동압 데이터 없음</div>
            <div className="text-sm text-gray-500">
              {selectedCycle
                ? "API에서 데이터를 가져오는 중..."
                : "사이클을 선택하세요"}
            </div>
            {/* 디버깅 정보 */}
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <div>
                <strong>디버깅 정보:</strong>
              </div>
              <div>
                Current API Data:{" "}
                {currentApiData
                  ? Array.isArray(currentApiData)
                    ? `Array(${currentApiData.length})`
                    : typeof currentApiData
                  : "null"}
              </div>
              <div>Selected Band Type: {selectedBandType}</div>
              <div>
                Selected Cycle: {selectedCycle ? selectedCycle.name : "null"}
              </div>
              <div>Selected Time: {selectedTime}</div>
              <div>Is Loading: {isLoading.toString()}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`w-full space-y-4 ${className}`}>
        {/* 밴드 타입 선택 버튼들 */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="text-sm font-medium text-slate-600 mb-3">
            밴드 타입 선택
            {isLoading && (
              <span className="ml-2 text-xs text-blue-600">(로딩 중...)</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BAND_COLORS).map(([bandType, color]) => (
              <button
                key={bandType}
                onClick={() => handleBandTypeChange(bandType)}
                disabled={isLoading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  selectedBandType === bandType
                    ? "text-white shadow-md transform scale-105"
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor:
                    selectedBandType === bandType ? color : undefined,
                  borderColor: color,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor:
                        selectedBandType === bandType ? "white" : color,
                      borderColor:
                        selectedBandType === bandType ? "white" : color,
                    }}
                  />
                  <span>
                    {BAND_LABELS[bandType as keyof typeof BAND_LABELS]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* 통계 정보 */}
          {statistics && (
            <div className="mt-3 space-y-3">
              {/* 스케일링 정보 */}
              <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                <div className="text-xs font-medium text-blue-700 mb-1">
                  📊 데이터 스케일링 정보
                </div>
                <div className="text-xs text-blue-600">
                  • 원본 API 값: {statistics.min.toFixed(6)} ~ {statistics.max.toFixed(6)}
                </div>
                <div className="text-xs text-blue-600">
                  • 차트 표시값: {statistics.scaledMin.toFixed(3)} ~ {statistics.scaledMax.toFixed(3)} mPa (원본 × 1000)
                </div>
              </div>
              
              {/* 통계값 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-md p-2 text-center">
                  <div className="text-xs text-slate-500">최소값 (원본)</div>
                  <div className="text-sm font-bold text-blue-600">
                    {statistics.min.toFixed(6)}
                  </div>
                </div>
                <div className="bg-white rounded-md p-2 text-center">
                  <div className="text-xs text-slate-500">평균값 (원본)</div>
                  <div className="text-sm font-bold text-green-600">
                    {statistics.avg.toFixed(6)}
                  </div>
                </div>
                <div className="bg-white rounded-md p-2 text-center">
                  <div className="text-xs text-slate-500">최대값 (원본)</div>
                  <div className="text-sm font-bold text-red-600">
                    {statistics.max.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 메인 차트 */}
        <div
          className="bg-white rounded-lg p-4 border"
          style={{ height: "400px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <div className="text-gray-600">데이터 로딩 중...</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="sensorNumber"
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "센서 번호",
                    position: "insideBottom",
                    offset: -10,
                    style: { textAnchor: "middle", fontSize: 12 },
                  }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `${value.toFixed(2)}`}
                  label={{
                    value: `압력 (mPa) - ${
                      BAND_LABELS[selectedBandType as keyof typeof BAND_LABELS]
                    }`,
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: 12 },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={() =>
                    BAND_LABELS[selectedBandType as keyof typeof BAND_LABELS]
                  }
                  wrapperStyle={{ fontSize: "12px" }}
                />

                {/* 압력 데이터 라인 */}
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke={
                    BAND_COLORS[selectedBandType as keyof typeof BAND_COLORS]
                  }
                  strokeWidth={3}
                  dot={{
                    fill: BAND_COLORS[
                      selectedBandType as keyof typeof BAND_COLORS
                    ],
                    strokeWidth: 2,
                    r: 4,
                  }}
                  isAnimationActive={false}
                  connectNulls={false}
                  name="pressure"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }
);

PressureChart.displayName = "PressureChart";

export default PressureChart;
