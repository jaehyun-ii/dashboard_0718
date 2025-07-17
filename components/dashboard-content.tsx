"use client"

import { DateRangeSelector } from "@/components/date-range-selector"
import { TimelineNavigationControls } from "@/components/timeline-navigation-controls"
import { EnhancedTimelineView } from "@/components/enhanced-timeline-view"
import { VariableStatusCards } from "@/components/variable-status-cards"
import { ChartsSection } from "@/components/charts-section"
import { VariableTooltip } from "@/components/variable-tooltip"

export function DashboardContent() {
  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto max-w-full">
      <DateRangeSelector />
      <TimelineNavigationControls />
      <EnhancedTimelineView />
      <VariableStatusCards />
      <ChartsSection />
      <VariableTooltip />
    </div>
  )
}
