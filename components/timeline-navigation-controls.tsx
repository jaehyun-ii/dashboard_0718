"use client"

import { Calendar, Clock, Search, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { useDashboardStore } from "@/lib/store"
import { timelineData } from "@/lib/store"
import { useState } from "react"

export function TimelineNavigationControls() {
  const {
    timeline,
    setTimelineCurrentDate,
    setTimelineCurrentTime,
    setAutoScrolling,
    setScrollSpeed,
    navigateToDateTime,
    navigateToCycle,
  } = useDashboardStore()

  const [searchCycle, setSearchCycle] = useState("")
  const [selectedDate, setSelectedDate] = useState(timeline.currentDate)
  const [selectedTime, setSelectedTime] = useState(timeline.currentTime)

  const handleDateTimeNavigation = () => {
    navigateToDateTime(selectedDate, selectedTime)
  }

  const handleCycleSearch = () => {
    if (searchCycle) {
      navigateToCycle(searchCycle)
    }
  }

  const toggleAutoScroll = () => {
    setAutoScrolling(!timeline.autoScrolling)
  }

  const handleSpeedChange = (speed: number) => {
    setScrollSpeed(speed)
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        {/* Date & Time Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timelineData.dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 12 }, (_, i) => i * 2).map((hour) => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDateTimeNavigation}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/25"
          >
            Navigate
          </button>
        </div>

        {/* Cycle Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Search size={20} className="text-emerald-600" />
            <input
              type="text"
              placeholder="Cycle number..."
              value={searchCycle}
              onChange={(e) => setSearchCycle(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32"
            />
          </div>
          <button
            onClick={handleCycleSearch}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-emerald-500/25"
          >
            Find Cycle
          </button>
        </div>

        {/* Auto-scroll Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTimelineCurrentTime(Math.max(0, timeline.currentTime - 2))}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Step backward"
          >
            <SkipBack size={20} className="text-slate-600" />
          </button>

          <button
            onClick={toggleAutoScroll}
            className={`p-3 rounded-xl transition-all duration-200 ${
              timeline.autoScrolling
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-red-500/25"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-green-500/25"
            }`}
            title={timeline.autoScrolling ? "Pause auto-scroll" : "Start auto-scroll"}
          >
            {timeline.autoScrolling ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={() => setTimelineCurrentTime(Math.min(22, timeline.currentTime + 2))}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Step forward"
          >
            <SkipForward size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Speed:</span>
            <select
              value={timeline.scrollSpeed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Current Position Indicator */}
      <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Date</div>
              <div className="text-lg font-bold text-slate-800">{timeline.currentDate}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Current Time</div>
              <div className="text-lg font-bold text-slate-800">{timeline.currentTime}:00</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeline.autoScrolling && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Auto-scrolling at {timeline.scrollSpeed}x</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
