"use client";

import React, { useMemo } from "react";
import { useDataStore } from "@/lib/stores";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";

interface BlowchartData {
  name: string;
  value: number;
}

const BlowChartGraph = React.memo(() => {
  const blowchart = useDataStore((s) => s.blowchart);

  const chartData = useMemo((): BlowchartData[] => {
    return Object.entries(blowchart)
      .sort((a, b) => {
        const aNum = parseInt(a[0].replace("can", ""));
        const bNum = parseInt(b[0].replace("can", ""));
        return aNum - bNum;
      })
      .map(([key, value]) => ({
        name: key.toUpperCase(),
        value: value,
      }));
  }, [blowchart]);

  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as any;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-gray-600">
            Blowout: {payload[0].value?.toFixed(8)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 14, fill: "#475569" }}
        />
        <YAxis
          tick={{ fontSize: 14, fill: "#64748b" }}
          tickFormatter={(value) => value.toFixed(4)}
          label={{
            value: "Blowout 값",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fill: "#64748b", fontSize: 16 },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          stroke="none"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

BlowChartGraph.displayName = "BlowChartGraph";

export default BlowChartGraph;
