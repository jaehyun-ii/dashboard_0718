"use client";

import { OptimizedTimelineView } from "@/components/optimized-timeline-view";
import { VariableStatusCards } from "@/components/variable-status-cards";
import { ChartsSection } from "@/components/charts-section";

export function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-shrink-0">
        <OptimizedTimelineView />
      </div>
      <div className="flex-1 p-6 space-y-6 overflow-y-auto py-0">
        <VariableStatusCards />
        <ChartsSection />
      </div>
    </div>
  );
}