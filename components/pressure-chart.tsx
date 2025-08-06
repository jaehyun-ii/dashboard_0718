"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { cn } from "@/lib/utils";

interface BandDataItem {
  datetime: string;
  value: number;
}

type BandType = "blowout" | "low" | "mid" | "high" | "screech";

const bandTabs: { label: string; value: BandType }[] = [
  { label: "Blowout", value: "blowout" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "mid" },
  { label: "High", value: "high" },
  { label: "Screech", value: "screech" },
];

interface ChartDataItem {
  time: string;
  value: number;
  formattedTime: string;
}

interface PressureChartProps {
  selectedTime?: number;
  apiData?: any; // Adjust type as needed
}

const PressureChart = React.memo(
  ({ selectedTime, apiData }: PressureChartProps) => {
    const [data, setData] = useState<BandDataItem[]>([]);
    const [band, setBand] = useState<BandType>("blowout");
    const [can, setCan] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleBandChange = useCallback((newBand: BandType) => {
      setBand(newBand);
    }, []);

    const handleCanChange = useCallback((value: string) => {
      setCan(Number(value));
    }, []);

    useEffect(() => {
      setLoading(true);
    }, [band, can]);

    const chartData = useMemo((): ChartDataItem[] => {
      return data.map((item) => ({
        time: new Date(item.datetime).getTime().toString(),
        value: item.value,
        formattedTime: new Date(item.datetime).toLocaleString("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
    }, [data]);

    const CustomTooltip = (props: TooltipProps<number, string>) => {
      const { active, payload, label } = props as any;
      if (active && payload && payload.length) {
        const data = payload[0];
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900">
              {new Date(Number(label)).toLocaleString("ko-KR")}
            </p>
            <p className="text-sm text-gray-600">
              압력: {data.value?.toFixed(6)} PSI
            </p>
          </div>
        );
      }
      return null;
    };

    if (!data.length && !loading) return null;

    return (
      <div className="w-full">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Band Toggle Buttons */}
              <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
                {bandTabs.map((tab) => (
                  <Button
                    key={tab.value}
                    variant={band === tab.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleBandChange(tab.value)}
                    className={cn(
                      "text-sm font-medium transition-all duration-200",
                      band === tab.value
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    )}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* CAN Selector */}
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-slate-700">
                  CAN 선택:
                </span>
                <Select value={can.toString()} onValueChange={handleCanChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}번
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  <span className="text-base">데이터 로딩 중...</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20,
                  }}
                >
                  <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(time) =>
                      new Date(Number(time)).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    label={{
                      value: "압력 (PSI)",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fill: "#64748b",
                        fontSize: 14,
                      },
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#64748b" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name={`${can}번 CAN - ${band.toUpperCase()}`}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
);

PressureChart.displayName = "PressureChart";

export default PressureChart;
