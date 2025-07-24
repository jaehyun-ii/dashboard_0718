"use client";

import { useState } from "react";
import { useDataStore } from "@/lib/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";

export function ReportPage() {
  const data = useDataStore();
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const healthSummary = data.getHealthySummary();
  const totalCycles = data.cycles.length;

  const periods = [
    { id: "day", label: "일간" },
    { id: "week", label: "주간" },
    { id: "month", label: "월간" },
    { id: "quarter", label: "분기" },
  ];

  const reports = [
    {
      id: "health-summary",
      title: "시스템 건강도 요약",
      description: "전체 변수의 상태별 분포 및 트렌드",
      icon: TrendingUp,
      data: healthSummary,
    },
    {
      id: "cycle-analysis",
      title: "사이클 분석 보고서",
      description: "사이클별 성능 분석 및 비교",
      icon: Calendar,
      data: { totalCycles, avgDuration: "4.2시간" },
    },
    {
      id: "turbine-performance",
      title: "터빈 성능 보고서",
      description: "터빈별 운영 효율성 및 문제점 분석",
      icon: FileText,
      data: { turbineCount: 4, efficiency: "94.2%" },
    },
  ];

  const handleDownloadReport = (reportId: string) => {
    console.log(
      `Downloading report: ${reportId} for period: ${selectedPeriod}`
    );
    // 실제 구현에서는 여기서 PDF 생성 또는 데이터 내보내기를 수행
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-6xl font-bold text-slate-800">보고서</h1>
        <p className="text-2xl text-slate-600 mt-3">
          시스템 성능 및 운영 현황 보고서
        </p>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle>보고서 기간 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period.id)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">{report.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-xl mb-4">
                  {report.description}
                </p>

                {/* Report Data Preview */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  {report.id === "health-summary" && (
                    <div className="grid grid-cols-2 gap-2 text-xl">
                      <div>정상: {(report.data as any).healthy}</div>
                      <div>경고: {(report.data as any).warning}</div>
                      <div>위험: {(report.data as any).critical}</div>
                      <div>전체: {(report.data as any).total}</div>
                    </div>
                  )}
                  {report.id === "cycle-analysis" && (
                    <div className="text-xl">
                      <div>총 사이클: {(report.data as any).totalCycles}</div>
                      <div>
                        평균 지속시간: {(report.data as any).avgDuration}
                      </div>
                    </div>
                  )}
                  {report.id === "turbine-performance" && (
                    <div className="text-xl">
                      <div>터빈 수: {(report.data as any).turbineCount}</div>
                      <div>평균 효율: {(report.data as any).efficiency}</div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleDownloadReport(report.id)}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  다운로드
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>보고서 요약 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">
                {totalCycles}
              </div>
              <div className="text-xl text-slate-600">총 사이클 수</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600">
                {((healthSummary.healthy / healthSummary.total) * 100).toFixed(
                  1
                )}
                %
              </div>
              <div className="text-xl text-slate-600">정상 비율</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600">
                {data.lastUpdated
                  ? new Date(data.lastUpdated).toLocaleDateString()
                  : "N/A"}
              </div>
              <div className="text-xl text-slate-600">마지막 업데이트</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
