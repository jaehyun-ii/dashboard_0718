"use client"

import type React from "react"
import { useDashboardStore, timelineData } from "@/lib/store"
import { useRef, useState, useEffect } from "react"
import { CalendarIcon, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const regions = ["지역 A", "지역 B", "지역 C", "지역 D"]
const ccOptions = ["CC 1", "CC 2", "CC 3", "CC 4"]

const getDatesInRange = (from: string, to: string): string[] => {
  const dates: string[] = []
  const currentDate = new Date(`${from}T00:00:00Z`)
  const endDate = new Date(`${to}T00:00:00Z`)
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().slice(0, 10))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  return dates
}

export function OptimizedTimelineView() {
  const {
    timeline,
    selectedRegion,
    selectedCC,
    setSelectedCycle,
    setSelectedRegion,
    setSelectedCC,
    setScrollTo,
    searchAndNavigateToCycle,
    navigateToDateTime,
    navigateToMostRecent,
    selectedDateRange,
    navigateDate,
  } = useDashboardStore()

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(timeline.currentDate))
  const [selectedTime, setSelectedTime] = useState(timeline.currentTime)
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true)

  const currentWeekDates = getDatesInRange(selectedDateRange.from, selectedDateRange.to)
  const timeGrid = currentWeekDates.flatMap((date) => Array.from({ length: 12 }, (_, i) => ({ date, hour: i * 2 })))
  const totalWidth = timeGrid.length * 100

  const cyclesForWeek = timelineData.cycles.filter((cycle) => {
    const cycleDate = new Date(`${cycle.date}T00:00:00Z`)
    const fromDate = new Date(`${selectedDateRange.from}T00:00:00Z`)
    const toDate = new Date(`${selectedDateRange.to}T00:00:00Z`)
    return cycleDate >= fromDate && cycleDate <= toDate
  })

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = "grabbing"
  }

  const onMouseLeaveOrUp = () => {
    if (!scrollContainerRef.current) return
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = "grab"
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = x - startX
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleCycleClick = (cycle: any) => setSelectedCycle(cycle)
  const handleDateTimeNavigation = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      navigateToDateTime(formattedDate, selectedTime)
    }
  }
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) searchAndNavigateToCycle(searchQuery)
  }

  useEffect(() => {
    if (timeline.scrollTo && scrollContainerRef.current) {
      const { date, time } = timeline.scrollTo
      const targetIndex = timeGrid.findIndex((gridItem) => gridItem.date === date && gridItem.hour === time)

      if (targetIndex !== -1) {
        // This is the updated calculation.
        // It scrolls the container so the left edge of the target column
        // aligns with the left edge of the scroll container.
        const newScrollLeft = targetIndex * 100
        scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" })
      }
      setScrollTo(null)
    }
  }, [timeline.scrollTo, timeGrid, setScrollTo])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0
    }
  }, [selectedDateRange])

  useEffect(() => {
    navigateToMostRecent()
  }, [navigateToMostRecent])

  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm p-4 space-y-4 py-4 px-6">
      {/* Timeline Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-2xl">타임라인 스케줄</h2>
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            {isTimelineExpanded ? (
              <>
                <span>접기</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>펼치기</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {isTimelineExpanded && (
          <>
            {/* Controls Layout - 왼쪽: 선택 컨트롤, 중앙: 주기, 오른쪽: 검색 */}
            <div className="flex items-center justify-between mb-4 gap-4">
              {/* Left Controls - 지역, CC, 날짜, 시간, Navigate */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md border-none outline-none cursor-pointer appearance-none"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">지역</option>
                  {regions.map((region) => (
                    <option key={region} value={region} className="bg-white text-slate-800">
                      {region}
                    </option>
                  ))}
                </select>
                <select
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md border-none outline-none cursor-pointer appearance-none"
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "min-w-[180px] w-auto justify-start text-left font-normal whitespace-nowrap",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "날짜 선택"}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => !timelineData.dates.includes(format(date, "yyyy-MM-dd"))}
                    />
                  </PopoverContent>
                </Popover>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i * 2).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:00
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDateTimeNavigation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md text-sm"
                >
                  이동
                </button>
              </div>

              {/* Right Controls - 사이클 검색 */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="26"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-3 pl-9 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 font-medium shadow-md text-sm"
                >
                  찾기
                </button>
              </form>
            </div>

            {/* Week Navigation with Period Display */}
            <div className="flex items-center justify-center mb-4 gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigateDate("prev")} aria-label="이전 날짜 범위">
                <ChevronLeft className="h-5 w-5 text-slate-600" />
              </Button>

              {/* Center - 주기 표시 */}
              <div className="flex items-center justify-center text-left font-normal bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 w-80">
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-sm text-slate-700">
                  {formatDateDisplay(selectedDateRange.from)} - {formatDateDisplay(selectedDateRange.to)}
                </span>
              </div>

              <Button variant="ghost" size="icon" onClick={() => navigateDate("next")} aria-label="다음 날짜 범위">
                <ChevronRight className="h-5 w-5 text-slate-600" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={navigateToMostRecent}
                className="ml-4 text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                최신으로
              </Button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex">
                <div className="w-32 flex-shrink-0 bg-slate-100 border-r border-slate-200">
                  <div className="h-12 flex items-center p-3 font-semibold text-slate-700 border-b border-slate-200 text-sm">
                    터빈
                  </div>
                  {timelineData.turbines.map((turbine) => (
                    <div
                      key={turbine}
                      className="h-16 flex items-center p-3 font-medium text-slate-700 border-t border-slate-200 bg-white"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-sm truncate">{turbine}</span>
                    </div>
                  ))}
                </div>
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-x-auto cursor-grab"
                  onMouseDown={onMouseDown}
                  onMouseLeave={onMouseLeaveOrUp}
                  onMouseUp={onMouseLeaveOrUp}
                  onMouseMove={onMouseMove}
                  style={{ maxWidth: "calc(100vw - 200px)" }}
                >
                  <div style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}>
                    <div className="flex flex-col">
                      <div className="flex h-6 border-b border-slate-200">
                        {currentWeekDates.map((date) => (
                          <div
                            key={date}
                            className="text-center p-1 font-semibold text-slate-600 border-r border-slate-200 bg-slate-100"
                            style={{ width: `${12 * 100}px` }}
                          >
                            <div className="text-xs">{date}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex h-6 border-b border-slate-200">
                        {timeGrid.map(({ date, hour }) => (
                          <div
                            key={`${date}-${hour}`}
                            className="w-[100px] flex-shrink-0 text-center p-1 font-semibold text-slate-500 border-r border-slate-200 bg-slate-100"
                          >
                            <div className="text-xs">{hour}:00</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col bg-white">
                      {timelineData.turbines.map((turbine) => (
                        <div key={turbine} className="relative h-16 border-t border-slate-200">
                          {timeGrid.map((_, index) => (
                            <div
                              key={index}
                              className="absolute top-0 bottom-0 w-px bg-slate-200"
                              style={{ left: `${(index + 1) * 100}px` }}
                            />
                          ))}
                          {cyclesForWeek
                            .filter((c) => c.turbine === turbine)
                            .map((cycle) => {
                              const dateIndex = currentWeekDates.indexOf(cycle.date)
                              if (dateIndex === -1) return null
                              const startPosition = (dateIndex * 12 + cycle.start / 2) * 100
                              const width = ((cycle.end - cycle.start) / 2) * 100
                              const isSelected = timeline.selectedCycle?.id === cycle.id
                              return (
                                <div
                                  key={cycle.id}
                                  className={`absolute top-1/2 -translate-y-1/2 h-12 bg-gradient-to-r ${cycle.color} rounded-lg flex items-center justify-center text-white text-xs font-semibold transition-all duration-200 shadow-md border border-white/20 cursor-pointer ${
                                    isSelected
                                      ? "ring-4 ring-blue-400 ring-opacity-75 scale-105 shadow-2xl z-10"
                                      : "hover:scale-105 hover:shadow-lg"
                                  }`}
                                  style={{ left: `${startPosition}px`, width: `${width}px` }}
                                  onClick={() => handleCycleClick(cycle)}
                                  title={`${cycle.name}: ${cycle.date} ${cycle.start}:00 - ${cycle.end}:00`}
                                >
                                  <div className="text-center px-2">
                                    <div className="font-bold truncate">{cycle.name}</div>
                                    <div className="text-xs opacity-90">
                                      {cycle.start}:00-{cycle.end}:00
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {timeline.selectedCycle && (
              <div className="mt-4 flex items-center justify-end gap-6">
                <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                  변수 표시 대상: {timeline.selectedCycle.name}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
