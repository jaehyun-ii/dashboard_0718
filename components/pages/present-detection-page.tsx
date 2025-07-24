"use client";

import { useDataStore } from "@/lib/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export function PresentDetectionPage() {
  const data = useDataStore();
  const healthSummary = data.getHealthySummary();
  const recentCycles = data.getRecentCycles(10);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">현재 감지</h1>
        <p className="text-slate-600 mt-2">실시간 시스템 상태 및 이상 감지 현황</p>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">전체 변수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{healthSummary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">정상</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthSummary.healthy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">경고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{healthSummary.warning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">위험</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{healthSummary.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cycles */}
      <Card>
        <CardHeader>
          <CardTitle>최근 사이클</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentCycles.map((cycle) => {
              const criticalCount = cycle.variables.filter(v => v.status === "critical").length;
              const warningCount = cycle.variables.filter(v => v.status === "warning").length;
              const overallStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "healthy";

              return (
                <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(overallStatus)}
                    <div>
                      <div className="font-medium">{cycle.name}</div>
                      <div className="text-sm text-slate-600">{cycle.turbine} - {cycle.date}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-600">
                      {cycle.start}:00 - {cycle.end}:00
                    </div>
                    <div className="text-xs text-slate-500">
                      위험: {criticalCount}, 경고: {warningCount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}