"use client";

import { useDashboardStore } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function BlowChartGraph() {
  const blowchart = useDashboardStore((s) => s.blowchart);

  const canEntries = Object.entries(blowchart).sort((a, b) => {
    const aNum = parseInt(a[0].replace("can", ""));
    const bNum = parseInt(b[0].replace("can", ""));
    return aNum - bNum;
  });

  const categories = canEntries.map(([key]) => key.toUpperCase());
  const values = canEntries.map(([, value]) => value); // 8자리 값 그대로 사용

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false, // ✅ 막대 위 텍스트 제거
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
      },
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
          colors: "#475569",
        },
      },
    },
    yaxis: {
      title: {
        text: "Blowout 값",
        style: { color: "#64748b", fontSize: "14px" },
      },
      labels: {
        style: {
          colors: "#64748b",
          fontSize: "12px",
        },
        formatter: (val: number) => val.toFixed(4), // ✅ y축 눈금은 4자리
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toFixed(8), // ✅ 툴팁은 8자리
      },
    },
    grid: {
      borderColor: "#e2e8f0",
      strokeDashArray: 4,
    },
    colors: ["#10b981"],
  };

  const series = [
    {
      name: "Blowout",
      data: values,
    },
  ];

  return (
    <>
      {" "}
      <Chart options={options} series={series} type="bar" height={350} />
    </>
  );
}
