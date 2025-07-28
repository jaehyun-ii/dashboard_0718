"use client";

import type React from "react";

import { Activity, Thermometer, Zap, Gauge } from "lucide-react";
import type { VariableInfo } from "@/lib/data";

const getVariableIcon = (group: string) => {
  switch (group) {
    case "진동":
      return Activity;
    case "연소":
      return Thermometer;
    case "전기":
      return Zap;
    case "단위기기":
      return Gauge;
    default:
      return Activity;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "healthy":
      return "bg-emerald-500 shadow-emerald-500/50";
    case "warning":
      return "bg-orange-500 shadow-orange-500/50";
    case "critical":
      return "bg-red-500 shadow-red-500/50";
    default:
      return "bg-slate-500 shadow-slate-500/50";
  }
};

interface CycleVariablesPanelProps {
  variables: VariableInfo[];
  onVariableClick: (variable: VariableInfo, event: React.MouseEvent) => void;
}

export function CycleVariablesPanel({
  variables,
  onVariableClick,
}: CycleVariablesPanelProps) {
  if (!variables || variables.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
      <h4 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <Activity size={16} className="text-blue-600" />
        System Variables ({variables.length})
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variables.map((variable) => {
          const IconComponent = getVariableIcon(variable.group);

          return (
            <div
              key={variable.name}
              onClick={(e) => onVariableClick(variable, e)}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                <IconComponent size={16} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-base font-medium text-slate-800 truncate">
                  {variable.name}
                </div>
                <div className="text-sm text-slate-600">{variable.value}</div>
              </div>

              <div
                className={`w-3 h-3 rounded-full ${getStatusColor(
                  variable.status
                )} animate-pulse`}
                title={variable.status}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
