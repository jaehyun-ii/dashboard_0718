"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useDataStore, useTimelineStore } from "@/lib/stores";

/* ------------------------------------------------------------------
  Utility equations used to compute rotation in degrees
------------------------------------------------------------------ */
function equation1(x: number) {
  return x < 93 ? (-68 / 90) * x + 195 : (-84.8 / 70) * x + 236.142857;
}
function equation2(x: number) {
  return -0.0037 * x * x - 0.2435 * x + 168.77;
}
function equation3(x: number) {
  if (x <= 20) return -x + 173;
  if (x <= 40) return (-16 / 20) * x + 169;
  if (x <= 50) return (-7 / 10) * x + 165;
  if (x <= 70) return (-6 / 10) * x + 160;
  if (x <= 80) return (-7 / 10) * x + 167;
  if (x <= 90) return (-8 / 10) * x + 175;
  if (x <= 110) return (-32 / 20) * x + 247;
  if (x <= 120) return (-8 / 10) * x + 159;
  if (x <= 130) return (-4 / 10) * x + 111;
  if (x <= 160) return (-9 / 30) * x + 98;
  if (x <= 190) return (-6 / 30) * x + 82;
  return 0;
}

/* ------------------------------------------------------------------
  Default demo data used when no data prop is supplied
------------------------------------------------------------------ */

const DEFAULT_DATA = [
  98, 96, 94, 91, 89, 86, 84, 81, 79, 76, 74, 71, 69, 66, 64, 61, 59, 56, 54,
  51, 49, 46, 44, 41, 39, 36, 34,
];

export interface SwirlChartProps {
  cycleId: string;
  formulaInput?: number;
  rotation?: number;
  showControls?: boolean;
  className?: string;
  selectedTime?: number;
  apiData?: any; // API 데이터 추가
}

export const SwirlChart = React.memo(
  ({
    cycleId,
    formulaInput = 0,
    rotation,
    showControls = true,
    className = "",
    selectedTime,
    apiData,
  }: SwirlChartProps) => {
    const swirl = useDataStore((s) => s.getSwirlDataByCycle(cycleId));
    const { selectedCycle } = useTimelineStore();
    const containerRef = useRef<HTMLDivElement>(null);

    const [formula, setFormula] = useState<1 | 2 | 3>(1);
    const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

    // Handle responsive sizing
    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          const size = Math.min(width, window.innerHeight * 0.8);
          setDimensions({ width: size, height: size });
        }
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Extract T1-T27 data from API and compute 11G_DWATT for selected time
    const extractApiData = useMemo(() => {
      console.log("=== API Data Debug (Time-based) ===");
      console.log("Raw apiData:", apiData);
      console.log("Selected time:", selectedTime);
      console.log("Selected cycle:", selectedCycle);

      if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
        console.log("No API time-series data available");
        return null;
      }

      // 선택된 시간에 해당하는 데이터 포인트 찾기
      let timeIndex = 0;
      
      if (selectedTime !== undefined && selectedCycle) {
        // 사이클 진행률 계산 (0-1)
        const cycleDuration = selectedCycle.end - selectedCycle.start;
        const timeFromStart = selectedTime - selectedCycle.start;
        const cycleProgress = cycleDuration > 0 ? Math.max(0, Math.min(1, timeFromStart / cycleDuration)) : 0;
        
        // API 데이터 배열에서 해당 시점의 인덱스 계산
        timeIndex = Math.floor(cycleProgress * (apiData.length - 1));
        console.log(`Cycle progress: ${(cycleProgress * 100).toFixed(1)}%, Time index: ${timeIndex}/${apiData.length - 1}`);
      }

      // 해당 시점의 데이터 객체 가져오기
      const dataObj = apiData[timeIndex];
      console.log(`Selected data object (index ${timeIndex}):`, dataObj);

      if (!dataObj || typeof dataObj !== "object") {
        console.log("No valid data object found at selected time");
        return null;
      }

      // T1-T27 변수들을 추출
      const temperatureData: number[] = [];
      for (let i = 1; i <= 27; i++) {
        const possibleNames = [
          `11G_TTXD1_${i}:`, // 콜론 포함
          `11G_TTXD1_${i}`, // 콜론 없음
        ];

        let value = 0;
        let foundKey = "";

        for (const name of possibleNames) {
          if (dataObj[name] !== undefined) {
            value = typeof dataObj[name] === "number" ? dataObj[name] : 0;
            foundKey = name;
            break;
          }
        }

        if (i <= 3) { // 처음 3개만 로그
          console.log(`T${i} - Found key: ${foundKey}, value: ${value}`);
        }
        temperatureData.push(value);
      }

      // 11G_DWATT 값 추출
      const dwattPossibleNames = ["11G_DWATT:", "11G_DWATT"];
      let dwatt = formulaInput;
      let dwattFoundKey = "";

      for (const name of dwattPossibleNames) {
        if (dataObj[name] !== undefined) {
          dwatt = typeof dataObj[name] === "number" ? dataObj[name] : formulaInput;
          dwattFoundKey = name;
          break;
        }
      }

      console.log(`DWATT - Found key: ${dwattFoundKey}, value: ${dwatt}`);

      const result = {
        temperatureData,
        dwatt,
        timeIndex,
        totalDataPoints: apiData.length,
      };

      console.log("Final time-based extracted data:", result);
      console.log("=== End API Data Debug ===");

      return result;
    }, [apiData, formulaInput, selectedTime, selectedCycle]);

    // Memoize expensive data processing with enhanced time-based filtering
    const { data, maxVal, scaled } = useMemo(() => {
      let baseData: number[];

      // API 데이터가 있으면 사용, 없으면 기존 데이터 사용
      if (extractApiData && extractApiData.temperatureData.length === 27) {
        baseData = extractApiData.temperatureData;
        // API 데이터가 모두 0인 경우 DEFAULT_DATA 사용
        if (baseData.every((val) => val === 0)) {
          baseData = DEFAULT_DATA;
        }
      } else {
        baseData = swirl?.[0]?.sensors.map((s) => s.value) ?? DEFAULT_DATA;
      }

      // 기본 데이터가 여전히 문제가 있는 경우 DEFAULT_DATA로 fallback
      if (
        baseData.length === 0 ||
        baseData.every((val) => val === 0 || isNaN(val))
      ) {
        baseData = DEFAULT_DATA;
      }

      // Python 코드와 동일: API에서 가져온 실제 데이터를 그대로 사용
      // Python: tw_values.append(cell_value) - 엑셀 값을 그대로 사용
      let processedData = [...baseData];

      const maxValue = Math.max(...processedData);

      // 원본 Python 코드와 동일한 방식: 원본 값을 그대로 사용하여 polar chart에 표시
      // 스케일링은 차트의 반지름 계산에서만 적용 (0에서 maxValue 범위를 0-100%로 매핑)
      let scaledData: number[];
      if (maxValue > 0) {
        // Python 코드처럼 원본 값을 최대값으로 정규화 (0-100% 범위)
        scaledData = processedData.map((v) => (v / maxValue) * 100);
      } else {
        // 데이터가 없는 경우에만 DEFAULT_DATA 사용
        const defaultMax = Math.max(...DEFAULT_DATA);
        scaledData = DEFAULT_DATA.map((v) => (v / defaultMax) * 100);
        // 실제 원본 데이터도 DEFAULT_DATA로 업데이트
        processedData = [...DEFAULT_DATA];
      }

      return {
        data: processedData,
        maxVal: maxValue,
        scaled: scaledData,
      };
    }, [swirl, extractApiData]);

    const computedDeg = useMemo(() => {
      // Python 코드와 동일: API에서 DWATT 값(11G_DWATT)을 사용하거나 formulaInput 사용
      // Python: x = float(x_cell.value) - 엑셀에서 값을 그대로 가져와서 수식에 적용
      const inputValue = extractApiData?.dwatt ?? formulaInput;

      switch (formula) {
        case 1:
          return equation1(inputValue);
        case 2:
          return equation2(inputValue);
        case 3:
        default:
          return equation3(inputValue);
      }
    }, [formulaInput, formula, extractApiData]);

    // Memoize trigonometric calculations with responsive scaling
    const chartElements = useMemo(() => {
      // Python 코드와 일치: 회전각 적용 방식
      // Python: ax1.set_theta_offset(np.radians(-rotation_angle+84))
      const rotationAngle = rotation ?? computedDeg ?? 84;
      const rot = -rotationAngle + 84; // Python과 동일한 공식
      const polarLen = scaled.length;
      const angleStep = (2 * Math.PI) / polarLen;

      // Use responsive center and radius based on container size
      const center = Math.min(dimensions.width, dimensions.height) / 2;
      const maxRadius = center * 0.8; // 80% of half the container size
      const labelRadius = maxRadius * 1.05;

      // Pre-calculate grid circles
      const gridCircles = Array.from({ length: 10 }, (_, i) => ({
        key: i,
        r: ((i + 1) / 10) * maxRadius,
      }));

      // Pre-calculate radial lines
      const radialLines = Array.from({ length: polarLen }, (_, i) => {
        const theta = i * angleStep;
        const x1 = center + maxRadius * Math.cos(theta);
        const y1 = center + maxRadius * Math.sin(theta);
        const x2 = center - maxRadius * Math.cos(theta);
        const y2 = center - maxRadius * Math.sin(theta);
        return {
          key: i,
          x1: x1.toFixed(2),
          y1: y1.toFixed(2),
          x2: x2.toFixed(2),
          y2: y2.toFixed(2),
        };
      });

      // Pre-calculate labels with responsive positioning
      // Python 코드와 일치: 레이블을 27부터 1까지 역순으로 표시
      const labels = scaled.map((_, i) => {
        const theta = (rot * Math.PI) / 180 + angleStep * i;
        const lx = center + labelRadius * Math.cos(theta);
        const ly = center + labelRadius * Math.sin(theta);
        return {
          key: `lbl-${i}`,
          x: lx.toFixed(2),
          y: ly.toFixed(2),
          text: `T${27 - i}`, // Python: f"{27 - i}번" -> T27, T26, ..., T1
        };
      });

      // Pre-calculate circles with values - responsive sizing
      const valueCircles = Array.from({ length: 14 }).map((_, i) => {
        const n = 14;
        const angle = (2 * Math.PI * i) / n + Math.PI * 0.65;
        const r =
          (maxRadius * Math.sin(Math.PI / n)) / (1 + Math.sin(Math.PI / n));
        const centerRadius = r / Math.sin(Math.PI / n);
        const cx = center + centerRadius * Math.cos(angle);
        const cy = center + centerRadius * Math.sin(angle);
        return {
          key: i,
          cx: cx.toFixed(2),
          cy: cy.toFixed(2),
          r: r.toFixed(2),
          value: i < scaled.length ? scaled[i].toFixed(1) : "0",
        };
      });

      // Pre-calculate polyline points with responsive scaling
      const polylinePoints = [
        ...scaled.map((v, i) => {
          const theta = (rot * Math.PI) / 180 + angleStep * i;
          const r = (v / 100) * maxRadius;
          return `${center + r * Math.cos(theta)},${
            center + r * Math.sin(theta)
          }`;
        }),
        (() => {
          const r0 = (scaled[0] / 100) * maxRadius;
          const theta0 = (rot * Math.PI) / 180;
          return `${center + r0 * Math.cos(theta0)},${
            center + r0 * Math.sin(theta0)
          }`;
        })(),
      ].join(" ");

      // Pre-calculate data points with responsive scaling
      const dataPoints = scaled.map((v, i) => {
        const theta = (rot * Math.PI) / 180 + angleStep * i;
        const r = (v / 100) * maxRadius;
        const cx = center + r * Math.cos(theta);
        const cy = center + r * Math.sin(theta);
        return {
          key: `pt-${i}`,
          cx: cx.toFixed(2),
          cy: cy.toFixed(2),
          value: data[i],
          rawCx: cx,
          rawCy: cy,
        };
      });

      return {
        gridCircles,
        radialLines,
        labels,
        valueCircles,
        polylinePoints,
        dataPoints,
        rot,
        polarLen,
        angleStep,
        center,
        maxRadius,
      };
    }, [scaled, rotation, computedDeg, dimensions]);

    const [hover, setHover] = useState<{
      val: number;
      px: number;
      py: number;
    } | null>(null);

    const handleMouseEnter = useCallback(
      (value: number, event: React.MouseEvent) => {
        const svgElement = event.currentTarget.closest("svg");
        if (!svgElement) return;

        const rect = svgElement.getBoundingClientRect();
        setHover({
          val: value,
          px: event.clientX - rect.left,
          py: event.clientY - rect.top,
        });
      },
      []
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        if (!hover) return;

        const svgElement = event.currentTarget.closest("svg");
        if (!svgElement) return;

        const rect = svgElement.getBoundingClientRect();
        setHover((prev) =>
          prev
            ? {
                ...prev,
                px: event.clientX - rect.left,
                py: event.clientY - rect.top,
              }
            : null
        );
      },
      [hover]
    );

    const handleMouseLeave = useCallback(() => {
      setHover(null);
    }, []);

    // Calculate responsive font sizes
    const baseFontSize = Math.max(8, dimensions.width / 50);
    const labelFontSize = Math.max(10, dimensions.width / 40);
    const tooltipFontSize = Math.max(10, dimensions.width / 42);

    return (
      <div className={`w-full space-y-4 ${className}`}>
        {/* API 데이터 값 표시 섹션 */}
        <div className="bg-slate-50 rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-4">
            {/* DWATT 값 */}
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-500 mb-1">
                11G_DWATT (회전각 입력)
              </div>
              <div className="text-lg font-bold text-blue-600">
                {extractApiData?.dwatt?.toFixed(2) ??
                  formulaInput?.toFixed(2) ??
                  "0.00"}
              </div>
            </div>

            {/* 회전각 결과 */}
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="text-xs font-medium text-slate-500 mb-1">
                계산된 회전각
              </div>
              <div className="text-lg font-bold text-green-600">
                {computedDeg.toFixed(2)}°
              </div>
            </div>
          </div>

          {/* T1-T27 온도값들 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-slate-500">
                11G_TTXD1_1 ~ 11G_TTXD1_27 (T1 ~ T27 센서값)
              </div>
              <div className="text-xs text-slate-400">
                최대: {maxVal.toFixed(1)}°C | 평균:{" "}
                {(data.reduce((a, b) => a + b, 0) / data.length).toFixed(1)}°C
                {extractApiData && (
                  <span className="ml-2 text-blue-600 font-medium">
                    | 데이터: {extractApiData.timeIndex + 1}/{extractApiData.totalDataPoints}
                  </span>
                )}
              </div>
            </div>

            {/* 컴팩트한 센서값 표시 */}
            <div className="bg-white rounded-md p-3 shadow-sm">
              <div className="grid grid-cols-9 gap-1 text-xs">
                {data.map((value, index) => {
                  const sensorNum = 27 - index;
                  const isHot = value > maxVal * 0.8; // 상위 20%는 빨간색
                  const isCold = value < maxVal * 0.3; // 하위 30%는 파란색

                  return (
                    <div
                      key={index}
                      className={`rounded px-1 py-1 text-center border transition-colors hover:scale-105 cursor-pointer ${
                        isHot
                          ? "bg-red-50 border-red-200 text-red-800"
                          : isCold
                          ? "bg-blue-50 border-blue-200 text-blue-800"
                          : "bg-gray-50 border-gray-200 text-gray-800"
                      }`}
                      title={`T${sensorNum}: ${value.toFixed(1)}°C`}
                    >
                      <div className="font-medium text-[9px] leading-tight">
                        T{sensorNum}
                      </div>
                      <div className="font-mono text-[10px] font-bold leading-tight">
                        {value.toFixed(0)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Swirl Chart */}
        <div
          ref={containerRef}
          className="w-full h-auto"
          style={{ maxWidth: "100%", aspectRatio: "1" }}
        >
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full"
            style={{ maxWidth: "100%", height: "auto" }}
          >
            {/* Grid circles */}
            {chartElements.gridCircles.map((circle) => (
              <circle
                key={circle.key}
                cx={chartElements.center}
                cy={chartElements.center}
                r={circle.r}
                stroke="#ccc"
                fill="none"
                strokeWidth={dimensions.width / 500} // Responsive stroke width
              />
            ))}

            {/* Radial lines */}
            {chartElements.radialLines.map((line) => (
              <line
                key={line.key}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#ddd"
                strokeWidth={dimensions.width / 1000} // Responsive stroke width
              />
            ))}

            {/* Labels */}
            {chartElements.labels.map((label) => (
              <text
                key={label.key}
                x={label.x}
                y={label.y}
                fontSize={baseFontSize}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="gray"
              >
                {label.text}
              </text>
            ))}

            {/* Value circles */}
            {chartElements.valueCircles.map((circle) => (
              <g key={circle.key}>
                <circle
                  cx={circle.cx}
                  cy={circle.cy}
                  r={circle.r}
                  stroke="blue"
                  fill="none"
                  strokeWidth={dimensions.width / 500}
                />
                <text
                  x={circle.cx}
                  y={circle.cy}
                  fontSize={labelFontSize}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="blue"
                >
                  {parseInt(circle.key.toString()) + 1}
                </text>
              </g>
            ))}

            {/* Data line */}
            <polyline
              fill="none"
              stroke="#e11d48"
              strokeWidth={Math.max(1, dimensions.width / 250)} // Responsive stroke width
              strokeLinejoin="round"
              points={chartElements.polylinePoints}
            />

            {/* Data points */}
            {chartElements.dataPoints.map((point) => (
              <circle
                key={point.key}
                cx={point.cx}
                cy={point.cy}
                r={Math.max(2, dimensions.width / 167)} // Responsive radius
                fill="#e11d48"
                onMouseEnter={(e) => handleMouseEnter(point.value, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: "pointer" }}
              />
            ))}

            {/* Enhanced Tooltip */}
            {hover && (
              <g transform={`translate(${hover.px + 15}, ${hover.py - 25})`}>
                {/* Tooltip shadow */}
                <rect
                  x={-35}
                  y={-28}
                  width={70}
                  height={40}
                  rx={8}
                  fill="#000"
                  fillOpacity={0.1}
                  transform="translate(2, 2)"
                />
                {/* Tooltip background */}
                <rect
                  x={-35}
                  y={-28}
                  width={70}
                  height={40}
                  rx={8}
                  fill="#1e293b"
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
                {/* Tooltip arrow */}
                <path
                  d="M -8 12 L 0 20 L 8 12 Z"
                  fill="#1e293b"
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
                {/* Tooltip label */}
                <text
                  x={0}
                  y={-15}
                  fill="#94a3b8"
                  fontSize={Math.max(8, tooltipFontSize * 0.8)}
                  textAnchor="middle"
                  fontWeight="500"
                >
                  센서 값
                </text>
                {/* Tooltip value */}
                <text
                  x={0}
                  y={-2}
                  fill="#ffffff"
                  fontSize={Math.max(10, tooltipFontSize)}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {hover.val.toFixed(1)}°C
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  }
);

SwirlChart.displayName = "SwirlChart";
