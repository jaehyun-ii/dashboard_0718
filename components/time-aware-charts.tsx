"use client";

import React from "react";
import TemperatureDeviationChart from "./temperature-deviation-chart";
import BlowGraph from "./blow-graph";
import ModeChart from "./mode-chart";
import { TimeSeriesChart } from "./time-series-chart";

interface TimeAwareChartProps {
  selectedTime?: number;
}

export const TimeAwareTemperatureChart = React.memo<TimeAwareChartProps>(({ selectedTime = 8 }) => {
  // Show the original temperature deviation chart (static) 
  // but with a time-aware overlay or indication
  return (
    <div className="space-y-4">
      <TemperatureDeviationChart />
      {/* Add a small indicator showing the selected time */}
      <div className="text-center text-sm text-slate-600">
        분석 시점: {Math.floor(selectedTime).toString().padStart(2, '0')}:
        {((selectedTime % 1) * 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
});

export const TimeAwareBlowGraph = React.memo<TimeAwareChartProps>(({ selectedTime = 8 }) => {
  // Show a time-series version of the blow data with emphasis line
  return (
    <TimeSeriesChart 
      selectedTime={selectedTime}
      dataKey="value"
      title="연소 동압 시계열"
      color="#f97316"
      showEmphasisLine={true}
    />
  );
});

export const TimeAwareModeChart = React.memo<TimeAwareChartProps>(({ selectedTime = 8 }) => {
  // Show the original mode chart with time indication
  return (
    <div className="space-y-4">
      <ModeChart />
      <div className="text-center text-sm text-slate-600">
        모드 상태 확인 시점: {Math.floor(selectedTime).toString().padStart(2, '0')}:
        {((selectedTime % 1) * 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
});

TimeAwareTemperatureChart.displayName = "TimeAwareTemperatureChart";
TimeAwareBlowGraph.displayName = "TimeAwareBlowGraph";
TimeAwareModeChart.displayName = "TimeAwareModeChart";