"use client"

import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { OptimizedTimelineView } from "@/components/optimized-timeline-view"
import { VariableStatusCards } from "@/components/variable-status-cards"
import { ChartsSection } from "@/components/charts-section"
import { CycleDetailsModal } from "@/components/cycle-details-modal"
import { VariableDetailsModal } from "@/components/variable-details-modal"
import { VariableTooltip } from "@/components/variable-tooltip"
import { useDashboardStore } from "@/lib/store"

export default function DashboardPage() {
  const { sidebarOpen } = useDashboardStore()

  return (
    <div className="flex h-screen bg-gray-50 max-w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        <div className="flex-1 flex flex-col min-h-0">
          {/* The timeline view should not shrink, allowing the content below to take the remaining space */}
          <div className="flex-shrink-0">
            <OptimizedTimelineView />
          </div>
          {/* This container will now correctly take up the remaining space and scroll */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto py-0">
            <VariableStatusCards />
            <ChartsSection />
          </div>
        </div>
      </div>

      {/* Modals */}
      <CycleDetailsModal />
      <VariableDetailsModal />
      <VariableTooltip />
    </div>
  )
}
