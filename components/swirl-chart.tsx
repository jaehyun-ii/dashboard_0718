"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useDataStore } from "@/lib/stores";

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

    // Extract T1-T27 data from API and compute 11G_DWATT
    const extractApiData = useMemo(() => {
      if (!apiData) return null;
      
      // T1-T27 변수들을 추출 (11G_TTXD1_1 ~ 11G_TTXD1_27)
      const temperatureData: number[] = [];
      for (let i = 1; i <= 27; i++) {
        const variableName = `11G_TTXD1_${i}`;
        const value = apiData[variableName];
        temperatureData.push(typeof value === 'number' ? value : 0);
      }
      
      // 11G_DWATT 계산 (equation 변수)
      const dwatt = apiData['11G_DWATT'] || formulaInput;
      
      return {
        temperatureData,
        dwatt
      };
    }, [apiData, formulaInput]);

    // Memoize expensive data processing
    const { data, maxVal, scaled } = useMemo(() => {
      let rawData: number[];
      
      // API 데이터가 있으면 사용, 없으면 기존 데이터 사용
      if (extractApiData && extractApiData.temperatureData.length === 27) {
        rawData = extractApiData.temperatureData;
      } else {
        rawData = swirl?.[0]?.sensors.map((s) => s.value) ?? DEFAULT_DATA;
      }
      
      // If selectedTime is provided, adjust the data based on time
      if (selectedTime !== undefined) {
        const timeModifier = Math.sin(selectedTime * 0.5) * 0.2 + 1; // Vary data by time
        rawData = rawData.map(val => val * timeModifier);
      }
      
      const maxValue = Math.max(...rawData);
      const scaledData = rawData.map((v) => (v / maxValue) * 100);

      return {
        data: rawData,
        maxVal: maxValue,
        scaled: scaledData,
      };
    }, [swirl, selectedTime, extractApiData]);

    const computedDeg = useMemo(() => {
      // API에서 DWATT 값이 있으면 사용, 없으면 formulaInput 사용
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
      const rot = rotation ?? computedDeg ?? 84;
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
      const labels = scaled.map((_, i) => {
        const theta = (rot * Math.PI) / 180 + angleStep * i;
        const lx = center + labelRadius * Math.cos(theta);
        const ly = center + labelRadius * Math.sin(theta);
        return {
          key: `lbl-${i}`,
          x: lx.toFixed(2),
          y: ly.toFixed(2),
          text: i + 1,
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
        const svgElement = event.currentTarget.closest('svg');
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
        
        const svgElement = event.currentTarget.closest('svg');
        if (!svgElement) return;
        
        const rect = svgElement.getBoundingClientRect();
        setHover(prev => prev ? {
          ...prev,
          px: event.clientX - rect.left,
          py: event.clientY - rect.top,
        } : null);
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
      <div
        ref={containerRef}
        className={`w-full h-auto ${className}`}
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
                {hover.val.toFixed(2)}
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  }
);

SwirlChart.displayName = "SwirlChart";
