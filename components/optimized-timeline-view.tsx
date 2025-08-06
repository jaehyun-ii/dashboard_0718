"use client";

import type React from "react";
import { useTimelineStore, useUIStore } from "@/lib/stores";
import { CycleInfo } from "@/lib/data";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import {
  CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// 지역 및 CC 선택 옵션
const regions = ["신인천", "지역 B", "지역 C", "지역 D"];
const ccOptions = ["CC 1", "CC 2", "CC 3", "CC 4"];

// 날짜 범위 내 날짜 리스트 생성
const getDatesInRange = (from: string, to: string): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(`${from}T00:00:00Z`);
  const endDate = new Date(`${to}T00:00:00Z`);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export function OptimizedTimelineView() {
  const timeline = useTimelineStore();
  const ui = useUIStore();

  const {
    selectedCycle,
    currentDate,
    currentTime,
    scrollTo,
    selectedDateRange,
    setSelectedCycle,
    setScrollTo,
    searchAndNavigateToCycle,
    navigateToDateTime,
    navigateToMostRecent,
    navigateDate,
  } = timeline;

  const { selectedRegion, selectedCC, setSelectedRegion, setSelectedCC } = ui;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(currentDate)
  );
  const [selectedTime, setSelectedTime] = useState(currentTime);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);

  // Memoize expensive calculations
  const { currentWeekDates, timeGrid, totalWidth, cyclesForWeek } =
    useMemo(() => {
      const dates = getDatesInRange(
        selectedDateRange.from,
        selectedDateRange.to
      );

      // 2시간 간격으로 그리드 생성 (12칸)
      const grid = dates.flatMap((date) =>
        Array.from({ length: 12 }, (_, i) => ({
          date,
          hour: i * 2, // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22
          minute: 0,
          totalMinutes: i * 2 * 60, // 분 단위로 변환
          timeLabel: `${(i * 2).toString().padStart(2, "0")}:00`,
        }))
      );
      const width = grid.length * 80; // 2시간 간격이므로 더 넓은 셀 (80px)

      const fromDate = new Date(`${selectedDateRange.from}T00:00:00Z`);
      const toDate = new Date(`${selectedDateRange.to}T00:00:00Z`);
      const cycles = timeline.cycles.filter((cycle) => {
        const cycleDate = new Date(`${cycle.date}T00:00:00Z`);
        return cycleDate >= fromDate && cycleDate <= toDate;
      });

      return {
        currentWeekDates: dates,
        timeGrid: grid,
        totalWidth: width,
        cyclesForWeek: cycles,
      };
    }, [selectedDateRange.from, selectedDateRange.to]);

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
    const walk = x - startX;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCycleClick = (cycle: CycleInfo) => setSelectedCycle(cycle);

  const handleDateTimeNavigation = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      navigateToDateTime(formattedDate, selectedTime);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) searchAndNavigateToCycle(searchQuery);
  };
  useEffect(() => {
    if (!selectedRegion) setSelectedRegion("신인천");
    if (!selectedCC) setSelectedCC("CC 2");
  }, [selectedRegion, selectedCC, setSelectedRegion, setSelectedCC]);

  useEffect(() => {
    if (scrollTo && scrollContainerRef.current) {
      const { date, time } = scrollTo;
      const scrollContainer = scrollContainerRef.current;

      const timeout = setTimeout(() => {
        // 2시간 간격으로 가장 가까운 셀 찾기
        const nearestTimeSlot = Math.floor(time / 120) * 120; // 2시간(120분) 단위로 반올림
        const selector = `[data-time-cell="${date}-${nearestTimeSlot}"]`;
        const cellElement =
          scrollContainer.querySelector<HTMLDivElement>(selector);

        if (cellElement) {
          const cellOffset = cellElement.offsetLeft;
          const cellWidth = cellElement.offsetWidth;
          const containerWidth = scrollContainer.clientWidth;
          const maxScrollLeft = scrollContainer.scrollWidth - containerWidth;

          // 중앙 정렬 위치 계산
          const scrollToPosition =
            cellOffset - containerWidth / 2 + cellWidth / 2;

          // 오버스크롤 방지
          scrollContainer.scrollTo({
            left: Math.min(Math.max(scrollToPosition, 0), maxScrollLeft),
            behavior: "smooth",
          });
        } else {
          // 셀을 찾지 못한 경우, 분 단위 시간을 기준으로 대략적인 위치로 스크롤
          const dateIndex = currentWeekDates.indexOf(date);
          if (dateIndex !== -1) {
            const minutesPerDay = 24 * 60;
            const dayWidth = 12 * 80; // 2시간 간격 12칸 × 80px
            const pixelsPerMinute = dayWidth / minutesPerDay;
            const approximatePosition =
              dateIndex * dayWidth + time * pixelsPerMinute;

            scrollContainer.scrollTo({
              left: Math.max(
                0,
                approximatePosition - scrollContainer.clientWidth / 2
              ),
              behavior: "smooth",
            });
          }
        }

        setScrollTo(null);
      }, 100); // 렌더링 이후 실행

      return () => clearTimeout(timeout);
    }
  }, [scrollTo, setScrollTo, currentWeekDates]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [selectedDateRange]);

  useEffect(() => {
    navigateToMostRecent();
  }, []);

  const formatDateDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm p-4 space-y-4 py-4 px-6">
      {/* 타이틀 및 접기/펼치기 버튼 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-4xl">타임라인 스케줄</h2>
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-lg font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            {isTimelineExpanded ? (
              <>
                <span>타임라인 접기</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>타임라인 펼치기</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* 접혀있지 않은 경우 내용 출력 */}
        {isTimelineExpanded && (
          <>
            {/* 필터 영역 (지역, CC, 날짜, 시간 선택) */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* 지역 선택 */}
                <select
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-lg font-medium"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="">지역</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {/* CC 선택 */}
                <select
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-lg font-medium"
                  value={selectedCC}
                  onChange={(e) => setSelectedCC(e.target.value)}
                >
                  <option value="">CC</option>
                  {ccOptions.map((cc) => (
                    <option key={cc} value={cc}>
                      {cc}
                    </option>
                  ))}
                </select>
                {/* 날짜 선택 */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "min-w-[180px] font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "날짜 선택"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={() => false}
                    />
                  </PopoverContent>
                </Popover>
                {/* 시간 선택 */}
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-lg font-medium"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <option key={hour * 60} value={hour * 60}>
                      {hour.toString().padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
                {/* 이동 버튼 */}
                <button
                  onClick={handleDateTimeNavigation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg"
                >
                  이동
                </button>
              </div>

              {/* 사이클 검색 */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ex) 26"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-lg w-48"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-lg"
                >
                  찾기
                </button>
              </form>
            </div>

            {/* 주간 내비게이션 및 날짜 범위 표시 */}
            <div className="flex items-center justify-center mb-4 gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
              >
                <ChevronLeft />
              </Button>
              <div className="text-lg px-4 py-2 bg-slate-100 border rounded-lg">
                <CalendarIcon className="inline mr-2 text-blue-600" />
                {formatDateDisplay(selectedDateRange.from)} -{" "}
                {formatDateDisplay(selectedDateRange.to)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToMostRecent}
              >
                최신으로
              </Button>
            </div>

            {/* 타임라인 그리드 출력 영역 */}
            <div className="border border-slate-300 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
              <div className="flex">
                {/* 터빈 목록 */}
                <div className="w-36 flex-shrink-0 bg-gradient-to-b from-slate-100 to-slate-150 border-r border-slate-300">
                  {/* 날짜 헤더 높이와 맞춤 */}
                  <div className="h-10 flex items-center justify-center p-2 font-bold text-slate-800 border-b border-slate-300 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm">
                    날짜
                  </div>
                  {/* 시간 헤더 높이와 맞춤 */}
                  <div className="h-10 flex items-center justify-center p-2 font-bold text-slate-800 border-b border-slate-300 bg-gradient-to-r from-blue-50 to-indigo-50 text-sm">
                    터빈
                  </div>
                  {["Turbine A", "Turbine B", "Turbine C", "Turbine D"].map(
                    (turbine, index) => (
                      <div
                        key={turbine}
                        className={`h-14 flex items-center p-3 font-semibold text-slate-800 border-t border-slate-200 transition-colors duration-200 hover:bg-slate-100 ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : index === 2
                              ? "bg-purple-500"
                              : "bg-orange-500"
                          } shadow-sm`}
                        ></div>
                        <span className="text-sm font-medium truncate">
                          {turbine}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* 시간표 본문 */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-x-auto cursor-grab"
                  onMouseDown={onMouseDown}
                  onMouseLeave={onMouseLeaveOrUp}
                  onMouseUp={onMouseLeaveOrUp}
                  onMouseMove={onMouseMove}
                  style={{ maxWidth: "calc(100vw - 200px)" }}
                >
                  <div
                    style={{
                      width: `${totalWidth}px`,
                      minWidth: `${totalWidth}px`,
                    }}
                  >
                    <div className="flex flex-col">
                      {/* 날짜 헤더 */}
                      <div className="flex h-10 border-b border-slate-300">
                        {currentWeekDates.map((date) => (
                          <div
                            key={date}
                            className="text-center p-2 font-bold text-slate-800 border-r border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                            style={{ width: `${12 * 80}px` }}
                          >
                            <div className="text-sm">{date}</div>
                          </div>
                        ))}
                      </div>

                      {/* 시간 헤더 - 2시간 간격 */}
                      <div className="flex h-12 border-b border-slate-300 bg-gradient-to-r from-slate-50 to-slate-100">
                        {timeGrid.map(({ date, hour, totalMinutes }) => (
                          <div
                            key={`${date}-${totalMinutes}`}
                            data-time-cell={`${date}-${totalMinutes}`}
                            className="flex-shrink-0 text-center border-r border-slate-300 bg-white text-slate-800 hover:bg-blue-50 transition-colors"
                            style={{ width: "80px" }}
                          >
                            <div className="py-2 text-sm font-semibold">
                              {hour.toString().padStart(2, "0")}:00
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 터빈별 사이클 표시 */}
                    <div className="flex flex-col bg-white">
                      {["Turbine A", "Turbine B", "Turbine C", "Turbine D"].map(
                        (turbine) => (
                          <div
                            key={turbine}
                            className="relative h-14 border-t border-slate-200"
                          >
                            {/* 세로 라인 */}
                            {timeGrid.map((_, index) => (
                              <div
                                key={index}
                                className="absolute top-0 bottom-0 w-px bg-slate-200"
                                style={{ left: `${(index + 1) * 80}px` }}
                              />
                            ))}

                            {/* 사이클 바 */}
                            {cyclesForWeek
                              .filter((c) => c.turbine === turbine)
                              .map((cycle) => {
                                const dateIndex = currentWeekDates.indexOf(
                                  cycle.date
                                );
                                if (dateIndex === -1) return null;

                                // 분 단위로 정확한 위치와 크기 계산 (2시간 간격)
                                const minutesPerDay = 24 * 60; // 1440분
                                const dayWidth = 12 * 80; // 2시간 간격 12칸 × 80px
                                const pixelsPerMinute = dayWidth / minutesPerDay;

                                const startPosition =
                                  dateIndex * dayWidth +
                                  cycle.start * pixelsPerMinute;
                                const width =
                                  (cycle.end - cycle.start) * pixelsPerMinute;
                                const isSelected =
                                  selectedCycle?.id === cycle.id;

                                // 사이클 길이에 따른 텍스트 표시 조건
                                const showFullText = width >= 120; // 120px 이상일 때 전체 텍스트
                                const showShortText = width >= 60; // 60px 이상일 때 짧은 텍스트

                                // 시간 포맷팅 함수
                                const formatMinutesToTime = (
                                  minutes: number
                                ) => {
                                  const hours = Math.floor(minutes / 60);
                                  const mins = minutes % 60;
                                  return `${hours
                                    .toString()
                                    .padStart(2, "0")}:${mins
                                    .toString()
                                    .padStart(2, "0")}`;
                                };

                                let displayText = "";
                                if (showFullText) {
                                  displayText = `${
                                    cycle.name
                                  } (${formatMinutesToTime(
                                    cycle.start
                                  )}-${formatMinutesToTime(cycle.end)})`;
                                } else if (showShortText) {
                                  displayText = cycle.name;
                                } else {
                                  displayText = cycle.name.replace(
                                    "Cycle ",
                                    "C"
                                  );
                                }

                                // 색상이 없는 경우 기본 색상 적용
                                const backgroundColor =
                                  cycle.color || "bg-blue-500";

                                return (
                                  <div
                                    key={cycle.id}
                                    className={`absolute top-1/2 -translate-y-1/2 h-10 ${backgroundColor} rounded-lg flex items-center justify-center text-white font-semibold transition-all duration-200 shadow-md border border-white/20 cursor-pointer ${
                                      isSelected
                                        ? "ring-4 ring-blue-400 ring-opacity-75 scale-105 shadow-2xl z-10"
                                        : "hover:scale-105 hover:shadow-lg"
                                    }`}
                                    style={{
                                      left: `${startPosition}px`,
                                      width: `${width}px`,
                                      minWidth: "30px", // 최소 너비 보장
                                    }}
                                    onClick={() => handleCycleClick(cycle)}
                                    title={`${cycle.name}: ${
                                      cycle.date
                                    } ${formatMinutesToTime(
                                      cycle.start
                                    )} - ${formatMinutesToTime(cycle.end)}`}
                                  >
                                    {width >= 30 && ( // 최소 30px 이상일 때만 텍스트 표시
                                      <div
                                        className={`text-center px-1 ${
                                          width < 80 ? "px-0" : "px-2"
                                        }`}
                                      >
                                        <div
                                          className={`font-bold truncate ${
                                            showFullText
                                              ? "text-sm"
                                              : width >= 60
                                              ? "text-xs"
                                              : "text-[10px]"
                                          }`}
                                        >
                                          {displayText}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
