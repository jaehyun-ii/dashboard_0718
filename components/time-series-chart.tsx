"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useDataStore } from "@/lib/stores";

interface TimeSeriesChartProps {
  selectedTime?: number;
  dataKey: string;
  title: string;
  color?: string;
  showEmphasisLine?: boolean;
}

// Generate sample time-series data
const generateTimeSeriesData = (selectedTime: number = 8) => {
  const data = [];
  for (let hour = 0; hour <= 24; hour += 0.5) {
    const baseValue = 50 + Math.sin(hour * 0.5) * 20;
    const noise = (Math.random() - 0.5) * 10;
    const emphasizedValue =
      Math.abs(hour - selectedTime) < 2 ? baseValue * 1.1 : baseValue;

    data.push({
      time: hour,
      timeLabel: `${Math.floor(hour).toString().padStart(2, "0")}:${(
        (hour % 1) *
        60
      )
        .toString()
        .padStart(2, "0")}`,
      value: emphasizedValue + noise,
    });
  }
  return data;
};

export const TimeSeriesChart = React.memo<TimeSeriesChartProps>(
  ({
    selectedTime = 8,
    dataKey = "value",
    title,
    color = "#3b82f6",
    showEmphasisLine = true,
  }) => {
    const data = useMemo(
      () => generateTimeSeriesData(selectedTime),
      [selectedTime]
    );

    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="timeLabel"
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
              tickFormatter={(value, index) => {
                // Show every 4th label to avoid crowding
                return index % 8 === 0 ? value : "";
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelStyle={{ color: "#1e293b" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {showEmphasisLine && (
              <ReferenceLine
                x={`${Math.floor(selectedTime).toString().padStart(2, "0")}:${(
                  (selectedTime % 1) *
                  60
                )
                  .toString()
                  .padStart(2, "0")}`}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: "선택 시간",
                  position: "top",
                  fill: "#ef4444",
                  fontSize: 12,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

TimeSeriesChart.displayName = "TimeSeriesChart";
