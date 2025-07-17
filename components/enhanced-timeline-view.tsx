"use client";

import type React from "react";
import { useDashboardStore, timelineData } from "@/lib/store";
import { useRef, useState } from "react";

export function EnhancedTimelineView() {
  const { timeline, setSelectedCycle } = useDashboardStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Grab and scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const onMouseLeaveOrUp = () => {
    if (!scrollContainerRef.current) return;
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = "grab";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll faster
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCycleClick = (cycle: any) => {
    setSelectedCycle(cycle);
  };

  // Generate time grid for layout
  const timeGrid = timelineData.dates.flatMap((date) =>
    Array.from({ length: 12 }, (_, i) => ({ date, hour: i * 2 }))
  );
  const totalWidth = timeGrid.length * 100;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Timeline Schedule
          </h2>
          <p className="text-slate-600">
            Drag to scroll, click cycles to view details below.
          </p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
          <span>🖱️ Click cycles • 👆 Drag to scroll</span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 max-w-full">
        <div className="flex min-w-0">
          {/* Fixed Turbine Column */}
          <div className="w-32 flex-shrink-0 bg-slate-200 border-r border-slate-300">
            <div className="h-16 flex items-center p-4 font-semibold text-slate-700 border-b border-slate-300">
              Turbines
            </div>
            {timelineData.turbines.map((turbine) => (
              <div
                key={turbine}
                className="h-20 flex items-center p-4 font-medium text-slate-700 border-t border-slate-300 bg-slate-50"
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3"></div>
                <span className="truncate">{turbine}</span>
              </div>
            ))}
          </div>

          {/* Scrollable Timeline Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto cursor-grab min-w-0 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200"
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeaveOrUp}
            onMouseUp={onMouseLeaveOrUp}
            onMouseMove={onMouseMove}
            style={{ maxWidth: "calc(100vw - 200px)" }}
          >
            <div
              style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
            >
              {/* Time Header */}
              <div className="flex h-16 border-b border-slate-300">
                {timeGrid.map(({ date, hour }, index) => (
                  <div
                    key={`${date}-${hour}`}
                    className="w-[100px] flex-shrink-0 text-center p-2 font-semibold text-slate-700 border-r border-slate-300 bg-slate-100"
                  >
                    <div className="text-xs text-slate-500 mb-1">
                      {index % 12 === 0 ? date.slice(-5) : ""}
                    </div>
                    <div className="text-sm">{hour}:00</div>
                  </div>
                ))}
              </div>

              {/* Cycle Rows */}
              {timelineData.turbines.map((turbine) => (
                <div
                  key={turbine}
                  className="relative h-20 border-t border-slate-200"
                >
                  {/* Grid lines */}
                  {timeGrid.map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 w-px bg-slate-200"
                      style={{ left: `${(index + 1) * 100}px` }}
                    />
                  ))}
                  {/* Cycles for this turbine */}
                  {timelineData.cycles
                    .filter((c) => c.turbine === turbine)
                    .map((cycle) => {
                      const dateIndex = timelineData.dates.indexOf(cycle.date);
                      const startPosition =
                        (dateIndex * 12 + cycle.start / 2) * 100;
                      const width = ((cycle.end - cycle.start) / 2) * 100;
                      const isSelected =
                        timeline.selectedCycle?.id === cycle.id;

                      return (
                        <div
                          key={cycle.id}
                          className={`absolute top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r ${
                            cycle.color
                          } rounded-lg flex items-center justify-center text-white text-xs font-semibold transition-all duration-200 shadow-md border border-white/20 cursor-pointer ${
                            isSelected
                              ? "ring-4 ring-blue-400 ring-opacity-75 scale-105 shadow-2xl z-10"
                              : "hover:scale-105 hover:shadow-lg"
                          }`}
                          style={{
                            left: `${startPosition}px`,
                            width: `${width}px`,
                          }}
                          onClick={() => handleCycleClick(cycle)}
                          title={`${cycle.name}: ${cycle.date} ${cycle.start}:00 - ${cycle.end}:00`}
                        >
                          <div className="text-center px-2">
                            <div className="font-bold truncate">
                              {cycle.name}
                            </div>
                            <div className="text-xs opacity-90">
                              {cycle.start}:00-{cycle.end}:00
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Cycle Info */}
      {timeline.selectedCycle && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <span className="font-semibold text-slate-800">Selected: </span>
              <span className="text-blue-700 font-bold">
                {timeline.selectedCycle.name}
              </span>
              <span className="text-slate-600 ml-2">
                on {timeline.selectedCycle.turbine} (
                {timeline.selectedCycle.date})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
