"use client";

import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useTimelineStore, useUIStore } from "@/lib/stores";

const regions = ["신인천", "Region B", "Region C", "Region D"];
const ccOptions = ["1 CC", "2 CC", "3 CC", "4 CC"];

export function DateRangeSelector() {
  const timeline = useTimelineStore();
  const ui = useUIStore();

  const { selectedDateRange, navigateDate } = timeline;

  const { selectedRegion, selectedCC, setSelectedRegion, setSelectedCC } = ui;

  const handleDateToggle = () => {
    console.log("Date button clicked - opening date picker");
  };

  const handleTimeToggle = () => {
    console.log("Time button clicked - opening time picker");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 max-w-full">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => navigateDate("prev")}
            className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200 flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 min-w-0">
            <Calendar size={20} className="text-blue-600 flex-shrink-0" />
            <div className="text-center min-w-0">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Date Range
              </div>
              <div className="text-base md:text-xl font-bold text-slate-800 truncate">
                {selectedDateRange.from} - {selectedDateRange.to}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateDate("next")}
            className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200 flex-shrink-0"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDateToggle}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
          >
            <Calendar size={16} />
            <span className="hidden sm:inline">Date</span>
          </button>

          <button
            onClick={handleTimeToggle}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
          >
            <Clock size={16} />
            <span className="hidden sm:inline">Time</span>
          </button>

          <select
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-emerald-500/25 border-none outline-none cursor-pointer min-w-0"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="">Region</option>
            {regions.map((region) => (
              <option
                key={region}
                value={region}
                className="bg-white text-slate-800"
              >
                {region}
              </option>
            ))}
          </select>

          <select
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl text-base font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-orange-500/25 border-none outline-none cursor-pointer min-w-0"
            value={selectedCC}
            onChange={(e) => setSelectedCC(e.target.value)}
          >
            <option value="">CC</option>
            {ccOptions.map((cc) => (
              <option key={cc} value={cc} className="bg-white text-slate-800">
                {cc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
