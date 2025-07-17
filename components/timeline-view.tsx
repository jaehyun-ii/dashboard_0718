"use client"

import { useDashboardStore } from "@/lib/store"
import { useRef } from "react"

const turbines = ["Turbine A", "Turbine B", "Turbine C", "Turbine D"]

const cycles = [
  { id: "cycle1", name: "Cycle 1", turbine: "Turbine A", start: 4, end: 12, color: "from-blue-500 to-blue-600" },
  { id: "cycle2", name: "Cycle 2", turbine: "Turbine B", start: 2, end: 16, color: "from-blue-500 to-blue-600" },
  { id: "cycle3", name: "Cycle 3", turbine: "Turbine C", start: 12, end: 20, color: "from-orange-500 to-red-500" },
]

export function TimelineView() {
  const { setSelectedCycleInfo, selectedDateRange } = useDashboardStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCycleClick = (cycle: any) => {
    setSelectedCycleInfo(cycle)
  }

  // Generate 2-hour intervals (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22)
  const timeIntervals = Array.from({ length: 12 }, (_, i) => i * 2)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Timeline Schedule</h2>
          <p className="text-slate-600">Interactive timeline-based scheduling view</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
          <div className="flex items-center gap-4">
            <span>🖱️ Clickable cycles</span>
            <span>↔️ Horizontally scrollable</span>
          </div>
        </div>
      </div>

      {/* Date Header */}
      <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        <div className="text-center">
          <div className="text-sm font-medium text-slate-600 mb-1">DATE</div>
          <div className="text-lg font-bold text-slate-800">
            {selectedDateRange.from} {selectedDateRange.to}
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
        {/* Time Header */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
          <div className="flex">
            <div className="w-32 p-4 font-semibold text-slate-700 border-r border-slate-300 bg-slate-200">Turbines</div>
            <div
              ref={scrollRef}
              className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200"
            >
              <div className="flex min-w-[1200px]">
                <div className="text-center p-2 text-sm font-medium text-slate-600 border-b border-slate-300 bg-slate-100">
                  TIME
                </div>
                {timeIntervals.map((hour) => (
                  <div
                    key={hour}
                    className="flex-1 text-center p-4 font-semibold text-slate-700 border-r border-slate-300 min-w-[100px]"
                  >
                    {hour}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="bg-white">
          {turbines.map((turbine, index) => (
            <div key={turbine} className="flex border-b border-slate-200 last:border-b-0">
              <div className="w-32 p-4 font-medium text-slate-700 border-r border-slate-200 bg-slate-50 flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                {turbine}
              </div>

              <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200">
                <div className="relative h-16 min-w-[1200px] bg-gradient-to-r from-slate-50 to-white">
                  {/* Hour Grid Lines */}
                  {timeIntervals.map((hour, idx) => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-r border-slate-200"
                      style={{ left: `${(idx / timeIntervals.length) * 100}%` }}
                    />
                  ))}

                  {/* Cycles */}
                  {cycles
                    .filter((cycle) => cycle.turbine === turbine)
                    .map((cycle) => (
                      <div
                        key={cycle.id}
                        className={`absolute top-2 bottom-2 bg-gradient-to-r ${cycle.color} rounded-lg cursor-pointer flex items-center justify-center text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg shadow-md border border-white/20`}
                        style={{
                          left: `${(cycle.start / 24) * 100}%`,
                          width: `${((cycle.end - cycle.start) / 24) * 100}%`,
                        }}
                        onClick={() => handleCycleClick(cycle)}
                        title={`${cycle.name}: ${cycle.start}:00 - ${cycle.end}:00`}
                      >
                        <div className="text-center">
                          <div className="font-bold">{cycle.name}</div>
                          <div className="text-xs opacity-90">
                            {cycle.start}:00-{cycle.end}:00
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-600">
          <span>←</span>
          <span>Scroll horizontally to view more time intervals</span>
          <span>→</span>
        </div>
      </div>
    </div>
  )
}
