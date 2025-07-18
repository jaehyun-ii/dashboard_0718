"use client"; // 클라이언트 컴포넌트로 지정 (Next.js에서 SSR이 아닌 클라이언트 렌더링 명시)

import type React from "react";
import { useDashboardStore, timelineData } from "@/lib/store"; // 전역 상태관리 훅 및 데이터
import { useRef, useState, useEffect } from "react"; // 리액트 훅
import {
  CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"; // 아이콘 컴포넌트
import { Button } from "@/components/ui/button"; // 공통 버튼 컴포넌트
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // 날짜 선택용 팝오버
import { Calendar } from "@/components/ui/calendar"; // 날짜 선택 캘린더
import { cn } from "@/lib/utils"; // 조건부 className 유틸
import { format } from "date-fns"; // 날짜 포맷 라이브러리

// 지역 및 CC 선택 옵션
const regions = ["지역 A", "지역 B", "지역 C", "지역 D"];
const ccOptions = ["CC 1", "CC 2", "CC 3", "CC 4"];

// 날짜 범위 내 모든 날짜 문자열 배열 생성 함수
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
  // 전역 상태값 및 상태 설정 함수
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
  } = useDashboardStore();

  // 타임라인 스크롤 참조 및 상태
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 날짜, 시간, 검색어 관련 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(timeline.currentDate)
  );
  const [selectedTime, setSelectedTime] = useState(timeline.currentTime);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);

  // 현재 주차 날짜 리스트 및 시간대 생성
  const currentWeekDates = getDatesInRange(
    selectedDateRange.from,
    selectedDateRange.to
  );
  const timeGrid = currentWeekDates.flatMap((date) =>
    Array.from({ length: 12 }, (_, i) => ({ date, hour: i * 2 }))
  );
  const totalWidth = timeGrid.length * 100;

  // 현재 주차에 해당하는 사이클만 필터링
  const cyclesForWeek = timelineData.cycles.filter((cycle) => {
    const cycleDate = new Date(`${cycle.date}T00:00:00Z`);
    const fromDate = new Date(`${selectedDateRange.from}T00:00:00Z`);
    const toDate = new Date(`${selectedDateRange.to}T00:00:00Z`);
    return cycleDate >= fromDate && cycleDate <= toDate;
  });

  // 마우스 드래그 기반 스크롤 이벤트 핸들러들
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

  // 사이클 클릭 시 선택 처리
  const handleCycleClick = (cycle: any) => setSelectedCycle(cycle);

  // 날짜와 시간 기반으로 이동
  const handleDateTimeNavigation = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      navigateToDateTime(formattedDate, selectedTime);
    }
  };

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) searchAndNavigateToCycle(searchQuery);
  };

  // 특정 시간 위치로 스크롤
  useEffect(() => {
    if (timeline.scrollTo && scrollContainerRef.current) {
      const { date, time } = timeline.scrollTo;
      const targetIndex = timeGrid.findIndex(
        (gridItem) => gridItem.date === date && gridItem.hour === time
      );

      if (targetIndex !== -1) {
        const newScrollLeft = targetIndex * 100;
        scrollContainerRef.current.scrollTo({
          left: newScrollLeft,
          behavior: "smooth",
        });
      }
      setScrollTo(null);
    }
  }, [timeline.scrollTo, timeGrid, setScrollTo]);

  // 날짜 범위 변경 시 스크롤 초기화
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [selectedDateRange]);

  // 컴포넌트 마운트 시 최신 위치로 이동
  useEffect(() => {
    navigateToMostRecent();
  }, [navigateToMostRecent]);

  // 날짜 문자열을 한국어 포맷으로 변환
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
          <h2 className="font-bold text-slate-800 text-2xl">타임라인 스케줄</h2>
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
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
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium"
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
                      disabled={(date) =>
                        !timelineData.dates.includes(format(date, "yyyy-MM-dd"))
                      }
                    />
                  </PopoverContent>
                </Popover>
                {/* 시간 선택 */}
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(Number(e.target.value))}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                >
                  {Array.from({ length: 12 }, (_, i) => i * 2).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:00
                    </option>
                  ))}
                </select>
                {/* 이동 버튼 */}
                <button
                  onClick={handleDateTimeNavigation}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm"
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
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-48"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
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
              <div className="text-sm px-4 py-2 bg-slate-100 border rounded-lg">
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
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex">
                {/* 터빈 목록 */}
                <div className="w-32 flex-shrink-0 bg-slate-100 border-r border-slate-200">
                  <div className="h-12 flex items-center p-2 font-semibold text-slate-700 border-b border-slate-200 text-xs">
                    터빈
                  </div>
                  {timelineData.turbines.map((turbine) => (
                    <div
                      key={turbine}
                      className="h-12 flex items-center p-2 font-medium text-slate-700 border-t border-slate-200 bg-white"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                      <span className="text-xs truncate">{turbine}</span>
                    </div>
                  ))}
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

                      {/* 시간 헤더 */}
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

                    {/* 터빈별 사이클 표시 */}
                    <div className="flex flex-col bg-white">
                      {timelineData.turbines.map((turbine) => (
                        <div
                          key={turbine}
                          className="relative h-12 border-t border-slate-200"
                        >
                          {/* 세로 라인 */}
                          {timeGrid.map((_, index) => (
                            <div
                              key={index}
                              className="absolute top-0 bottom-0 w-px bg-slate-200"
                              style={{ left: `${(index + 1) * 100}px` }}
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

                              const startPosition =
                                (dateIndex * 12 + cycle.start / 2) * 100;
                              const width =
                                ((cycle.end - cycle.start) / 2) * 100;
                              const isSelected =
                                timeline.selectedCycle?.id === cycle.id;

                              return (
                                <div
                                  key={cycle.id}
                                  className={`absolute top-1/2 -translate-y-1/2 h-8 bg-gradient-to-r ${
                                    cycle.color
                                  } rounded-lg flex items-center justify-center text-white text-[11px] font-semibold transition-all duration-200 shadow-md border border-white/20 cursor-pointer ${
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
                                  <div className="text-center px-1.5">
                                    <div className="font-bold truncate">
                                      {cycle.name}
                                    </div>
                                    <div className="text-[10px] opacity-90">
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
