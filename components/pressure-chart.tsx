"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

// Mock API function - replace with your actual API call
const getBandData = async (
  id: string,
  can: number,
  band: BandType
): Promise<{ bandData: BandDataItem[] }> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate mock data
  const mockData: BandDataItem[] = Array.from({ length: 20 }, (_, i) => ({
    datetime: new Date(Date.now() - (19 - i) * 60000).toISOString(),
    value: Math.random() * 100 + 50,
  }));

  return { bandData: mockData };
};

export default function PressureChart() {
  const [data, setData] = useState<BandDataItem[]>([]);
  const [band, setBand] = useState<BandType>("blowout");
  const [can, setCan] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBandData("215", can, band)
      .then((res: { bandData: BandDataItem[] }) => {
        setData(res.bandData);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("데이터 로드 실패:", err);
        setData([]);
        setLoading(false);
      });
  }, [band, can]);

  if (!data.length && !loading) return null;

  const times = data.map((d) => d.datetime);
  const values = data.map((d) => d.value);

  const series = [
    {
      name: `${can}번 CAN - ${band.toUpperCase()}`,
      data: values,
    },
  ];

  const options: ApexOptions = {
    chart: {
      id: "pressure-chart",
      toolbar: { show: true },
      type: "line",
      background: "transparent",
    },
    xaxis: {
      categories: times,
      type: "datetime",
      labels: {
        rotate: -45,
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    plotOptions: {
      bar: { columnWidth: "50%" },
    },
    legend: {
      position: "top",
      labels: {
        colors: "#64748b",
      },
    },
    colors: ["#10b981"],
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 3,
    },
    yaxis: {
      title: {
        text: "압력 (PSI)",
        style: {
          color: "#64748b",
          fontSize: "14px",
          fontWeight: 500,
        },
      },
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: "light",
      x: { format: "yyyy-MM-dd HH:mm:ss" },
      y: {
        formatter: (val?: number) => (val ?? 0).toFixed(6),
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 4,
      colors: ["#10b981"],
      strokeColors: "#ffffff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
  };

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
                  onClick={() => setBand(tab.value)}
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
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
              <span className="text-sm font-medium text-slate-700">
                CAN 선택:
              </span>
              <Select
                value={can.toString()}
                onValueChange={(value) => setCan(Number(value))}
              >
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
                <span className="text-sm">데이터 로딩 중...</span>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Chart
                options={options}
                series={series}
                type="line"
                height={300}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
