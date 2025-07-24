"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/lib/stores";

interface TempRecord {
  label: string;
  value: number;
  diff: number;
  barValue?: number;
}

interface MedianInfo {
  label: string;
  value: number;
}

const CustomTooltip = (props: TooltipProps<number, string>) => {
  const { active, payload, label } = props as any;
  if (active && payload?.length) {
    const data = payload[0].payload as TempRecord;
    return (
      <div className="rounded-lg border bg-background p-2 text-sm shadow-sm">
        <div className="font-bold">{label}</div>
        <div>
          <span className="font-medium">측정값:</span> {data.value.toFixed(2)}
        </div>
        <div className={data.diff >= 0 ? "text-destructive" : "text-primary"}>
          <span className="font-medium">중앙값과의 차이:</span>{" "}
          {data.diff >= 0 ? "+" : ""}
          {data.diff.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

const DualSideChart = ({
  data,
  spec,
  medianInfo,
}: {
  data: TempRecord[];
  spec: number;
  medianInfo: MedianInfo;
}) => {
  const max = Math.max(...data.map((d) => Math.abs(d.diff)), spec);

  const greaterThanMedian = data
    .filter((d) => d.diff > 0)
    .sort((a, b) => b.diff - a.diff);

  const lessThanMedian = data
    .filter((d) => d.diff < 0)
    .map((d) => ({ ...d, barValue: Math.abs(d.diff) }))
    .sort((a, b) => (b.barValue ?? 0) - (a.barValue ?? 0));

  const maxItems = Math.max(greaterThanMedian.length, lessThanMedian.length);
  const chartHeight = maxItems * 20;

  return (
    <div
      className="flex justify-center mt-16"
      style={{ height: `${chartHeight}px` }}
    >
      <div className="flex-1 min-w-0 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={lessThanMedian} barCategoryGap={0}>
            <XAxis type="number" domain={[0, max]} reversed hide />
            <YAxis
              type="category"
              dataKey="label"
              width={45}
              tick={{
                fontSize: 11,
                fill: "hsl(var(--foreground))",
                textAnchor: "end",
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="barValue" barSize={34} radius={[4, 0, 0, 4]}>
              {lessThanMedian.map((_, i) => (
                <Cell key={`cell-${i}`} fill="hsl(var(--primary))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-full flex flex-col items-center justify-center w-20 px-2">
        <span className="text-xs text-muted-foreground">중앙값</span>
        <span className="font-bold text-sm text-foreground">
          {medianInfo.label}
        </span>
        <Separator className="my-1 w-3/4" />
        <span className="font-bold text-sm text-foreground">
          {medianInfo.value.toFixed(2)}
        </span>
      </div>

      <div className="flex-1 min-w-0 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={greaterThanMedian}
            barCategoryGap={0}
          >
            <XAxis type="number" domain={[0, max]} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={45}
              orientation="right"
              tick={{
                fontSize: 11,
                fill: "hsl(var(--foreground))",
                textAnchor: "start",
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="diff" barSize={34} radius={[0, 4, 4, 0]}>
              {greaterThanMedian.map((_, i) => (
                <Cell key={`cell-${i}`} fill="hsl(var(--destructive))" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function TemperatureDeviationChart() {
  const swirl = useDataStore((s) => s.getSwirlDataByCycle("215"));

  const record = useMemo(() => {
    const sensors = swirl?.[0]?.sensors;
    if (!sensors) return null;
    return Object.fromEntries(sensors.map((s) => [s.name, s.value]));
  }, [swirl]);

  const { chartData, medianInfo } = useMemo(() => {
    if (!record) return { chartData: [], medianInfo: null };

    const tempKeys = Object.keys(record).filter((k) => k.startsWith("T"));
    if (tempKeys.length === 0) return { chartData: [], medianInfo: null };

    const tempsWithLabels = tempKeys
      .map((k) => ({ label: k, value: Number(record[k]) }))
      .sort((a, b) => a.value - b.value);

    const medianIndex = Math.floor(tempsWithLabels.length / 2);
    const medianItem = tempsWithLabels[medianIndex];
    const medianValue = medianItem.value;

    const dataForChart: TempRecord[] = tempsWithLabels
      .filter((_, idx) => idx !== medianIndex)
      .map((d) => ({
        ...d,
        value: Number(d.value.toFixed(2)),
        diff: d.value - medianValue,
      }));

    return { chartData: dataForChart, medianInfo: medianItem };
  }, [record]);

  const spec = 0;

  return (
    <>
      {record && chartData.length > 0 && medianInfo ? (
        <DualSideChart data={chartData} spec={spec} medianInfo={medianInfo} />
      ) : (
        <p>표시할 온도 데이터가 없습니다.</p>
      )}
    </>
  );
}
