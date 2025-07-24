"use client";

import { useState, useMemo } from "react";
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
}

export function SwirlChart({
  cycleId,
  formulaInput = 0,
  rotation,
  showControls = true,
}: SwirlChartProps) {
  const swirl = useDataStore((s) => s.getSwirlDataByCycle(cycleId));
  const data = swirl?.[0]?.sensors.map((s) => s.value) ?? DEFAULT_DATA;

  const [formula, setFormula] = useState<1 | 2 | 3>(1);

  const maxVal = Math.max(...data);
  const scaled = data.map((v) => (v / maxVal) * 100);

  const computedDeg = useMemo(() => {
    switch (formula) {
      case 1:
        return equation1(formulaInput);
      case 2:
        return equation2(formulaInput);
      case 3:
      default:
        return equation3(formulaInput);
    }
  }, [formulaInput, formula]);

  const rot = rotation ?? computedDeg ?? 84;
  const polarLen = scaled.length;
  const angleStep = (2 * Math.PI) / polarLen;

  const [hover, setHover] = useState<{
    val: number;
    px: number;
    py: number;
  } | null>(null);

  return (
    <div>
      <svg viewBox="0 0 500 500">
        {Array.from({ length: 10 }, (_, i) => (
          <circle
            key={i}
            cx={250}
            cy={250}
            r={(i + 1) * 20}
            stroke="#ccc"
            fill="none"
          />
        ))}
        {Array.from({ length: polarLen }, (_, i) => {
          const theta = i * angleStep;
          const x1 = 250 + 200 * Math.cos(theta);
          const y1 = 250 + 200 * Math.sin(theta);
          const x2 = 250 - 200 * Math.cos(theta);
          const y2 = 250 - 200 * Math.sin(theta);
          return (
            <line
              key={i}
              x1={x1.toFixed(2)}
              y1={y1.toFixed(2)}
              x2={x2.toFixed(2)}
              y2={y2.toFixed(2)}
              stroke="#ddd"
            />
          );
        })}
        {scaled.map((_, i) => {
          const theta = (rot * Math.PI) / 180 + angleStep * i;
          const lx = 250 + 210 * Math.cos(theta);
          const ly = 250 + 210 * Math.sin(theta);
          return (
            <text
              key={`lbl-${i}`}
              x={lx.toFixed(2)}
              y={ly.toFixed(2)}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="gray"
            >
              {i + 1}
            </text>
          );
        })}
        {Array.from({ length: 14 }).map((_, i) => {
          const n = 14;
          const angle = (2 * Math.PI * i) / n + Math.PI * 0.65;
          const r = (200 * Math.sin(Math.PI / n)) / (1 + Math.sin(Math.PI / n));
          const centerRadius = r / Math.sin(Math.PI / n);
          const cx = 250 + centerRadius * Math.cos(angle);
          const cy = 250 + centerRadius * Math.sin(angle);
          return (
            <g key={i}>
              <circle
                cx={cx.toFixed(2)}
                cy={cy.toFixed(2)}
                r={r.toFixed(2)}
                stroke="blue"
                fill="none"
              />
              <text
                x={cx.toFixed(2)}
                y={cy.toFixed(2)}
                fontSize="14"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="blue"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        <polyline
          fill="none"
          stroke="#e11d48"
          strokeWidth={2}
          strokeLinejoin="round"
          points={[
            ...scaled.map((v, i) => {
              const theta = (rot * Math.PI) / 180 + angleStep * i;
              const r = (v / 100) * 200;
              return `${250 + r * Math.cos(theta)},${
                250 + r * Math.sin(theta)
              }`;
            }),
            (() => {
              const r0 = (scaled[0] / 100) * 200;
              const theta0 = (rot * Math.PI) / 180;
              return `${250 + r0 * Math.cos(theta0)},${
                250 + r0 * Math.sin(theta0)
              }`;
            })(),
          ].join(" ")}
        />
        {scaled.map((v, i) => {
          const theta = (rot * Math.PI) / 180 + angleStep * i;
          const r = (v / 100) * 200;
          const cx = 250 + r * Math.cos(theta);
          const cy = 250 + r * Math.sin(theta);
          return (
            <circle
              key={`pt-${i}`}
              cx={cx.toFixed(2)}
              cy={cy.toFixed(2)}
              r={3}
              fill="#e11d48"
              onMouseEnter={() => setHover({ val: data[i], px: cx, py: cy })}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
        {hover && (
          <g transform={`translate(${hover.px + 10}, ${hover.py - 10})`}>
            <rect x={-22} y={-18} width={44} height={22} rx={4} fill="#000" />
            <text x={0} y={-6} fill="#fff" fontSize={12} textAnchor="middle">
              {hover.val.toFixed(2)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
