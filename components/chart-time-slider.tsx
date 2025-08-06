"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, SkipBack, SkipForward } from "lucide-react";
import { useTimelineStore } from "@/lib/stores";
import { TimeModeVisualization, ModeSegment } from "./time-mode-visualization";

interface ChartTimeSliderProps {
  className?: string;
  showTooltip?: boolean;
  showTimeLabels?: boolean;
  showModeVisualization?: boolean;
}

const formatTime = (time: number): string => {
  // time이 이미 분 단위인 경우와 시간 단위인 경우를 모두 처리
  let totalMinutes: number;

  if (time > 24) {
    // time이 분 단위로 저장된 경우 (예: 775분)
    totalMinutes = Math.round(time);
  } else {
    // time이 시간 단위로 저장된 경우 (예: 12.5시간)
    totalMinutes = Math.round(time * 60);
  }

  const hours = Math.floor(totalMinutes / 60) % 24; // 24시간 형식으로 변환
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// 상대적 시간 표시 (사이클 시작점 기준)
const formatRelativeTime = (
  currentTime: number,
  cycleStart: number
): string => {
  let elapsedMinutes: number;

  if (currentTime > 24 && cycleStart > 24) {
    // 둘 다 분 단위인 경우
    elapsedMinutes = Math.round(currentTime - cycleStart);
  } else {
    // 시간 단위인 경우
    elapsedMinutes = Math.round((currentTime - cycleStart) * 60);
  }

  const hours = Math.floor(Math.abs(elapsedMinutes) / 60);
  const minutes = Math.abs(elapsedMinutes) % 60;

  if (elapsedMinutes < 0) {
    if (hours === 0) {
      return `시작 전 ${minutes}분`;
    } else {
      return `시작 전 ${hours}시간 ${minutes}분`;
    }
  } else if (hours === 0) {
    return `+${minutes}분`;
  } else {
    return `+${hours}시간 ${minutes}분`;
  }
};

// 진행률 계산
const calculateProgress = (
  currentTime: number,
  start: number,
  end: number
): number => {
  if (currentTime <= start) return 0;
  if (currentTime >= end) return 100;
  return ((currentTime - start) / (end - start)) * 100;
};

export const ChartTimeSlider = React.memo<ChartTimeSliderProps>(
  ({
    className,
    showTooltip = true,
    showTimeLabels = true,
    showModeVisualization = true,
  }) => {
    const { currentTime, setCurrentTime, getVisibleTimeRange, selectedCycle } =
      useTimelineStore();
    const [showTooltipState, setShowTooltipState] = useState(false);
    const [timeInput, setTimeInput] = useState("");
    const [showTimeInput, setShowTimeInput] = useState(false);
    const [inputError, setInputError] = useState("");

    // Get dynamic time range based on current week's cycles
    const { start: min, end: max } = getVisibleTimeRange();
    // 시스템이 분 단위인지 시간 단위인지에 따라 step 설정
    const step = min > 24 || max > 24 ? 1 : 1 / 60; // 분 단위면 1, 시간 단위면 1/60

    // 시간을 퍼센트로 변환
    const timeToPercent = useCallback(
      (time: number) => {
        return ((time - min) / (max - min)) * 100;
      },
      [min, max]
    );

    // 개선된 시간 라벨 생성
    const timeLabels = useMemo(() => {
      const labels = [];
      const totalDuration = max - min;

      // 시스템이 분 단위인지 시간 단위인지 확인
      const isMinuteSystem = min > 24 || max > 24;

      // 지속 시간에 따라 라벨 간격 조정
      let interval: number;
      if (isMinuteSystem) {
        // 분 단위 시스템: 30분, 60분, 120분 간격
        if (totalDuration <= 240) interval = 30; // 4시간 이하면 30분 간격
        else if (totalDuration <= 720)
          interval = 60; // 12시간 이하면 1시간 간격
        else interval = 120; // 그 이상이면 2시간 간격
      } else {
        // 시간 단위 시스템: 0.5, 1, 2시간 간격
        if (totalDuration <= 4) interval = 0.5;
        else if (totalDuration <= 12) interval = 1;
        else interval = 2;
      }

      // 시작점을 간격에 맞춰 정렬
      let startTime: number;
      if (isMinuteSystem) {
        startTime = Math.ceil(min / interval) * interval;
      } else {
        startTime = Math.ceil(min / interval) * interval;
      }

      for (let time = startTime; time <= max; time += interval) {
        if (time >= min && time <= max) {
          labels.push({
            time,
            percent: timeToPercent(time),
            label: formatTime(time),
            relativeLabel: selectedCycle
              ? formatRelativeTime(time, selectedCycle.start)
              : "",
          });
        }
      }

      return labels;
    }, [min, max, timeToPercent, selectedCycle]);

    // 슬라이더 값 변경 핸들러
    const handleValueChange = useCallback(
      (newValue: number[]) => {
        setCurrentTime(newValue[0]);
        if (showTooltip) {
          setShowTooltipState(true);
          setTimeout(() => setShowTooltipState(false), 1000);
        }
      },
      [setCurrentTime, showTooltip]
    );

    // 시간 입력 관련 함수들
    const parseTimeInput = useCallback(
      (input: string): number | null => {
        const timePattern = /^(\d{1,2}):(\d{2})$/;
        const match = input.match(timePattern);

        if (!match) return null;

        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

        // 시스템이 분 단위를 사용하는지 확인하고 적절히 반환
        if (min > 24 || max > 24) {
          // 분 단위 시스템
          return hours * 60 + minutes;
        } else {
          // 시간 단위 시스템
          return hours + minutes / 60;
        }
      },
      [min, max]
    );

    const handleTimeInputSubmit = useCallback(() => {
      const parsedTime = parseTimeInput(timeInput);
      if (parsedTime !== null && parsedTime >= min && parsedTime <= max) {
        setCurrentTime(parsedTime);
        setShowTimeInput(false);
        setTimeInput("");
        setInputError("");
      } else {
        // 에러 메시지 설정
        if (parsedTime === null) {
          setInputError("올바른 시간 형식이 아닙니다 (HH:MM)");
        } else if (parsedTime < min || parsedTime > max) {
          setInputError(
            `시간은 ${formatTime(min)} ~ ${formatTime(max)} 범위여야 합니다`
          );
        }

        // 더 명확한 오류 애니메이션 효과
        const inputElement = document.querySelector(
          'input[placeholder="HH:MM"]'
        ) as HTMLInputElement;
        if (inputElement) {
          // 빨간색 테두리와 shake 애니메이션 추가
          inputElement.style.borderColor = "#ef4444";
          inputElement.style.backgroundColor = "#fef2f2";
          inputElement.classList.add("animate-bounce");

          // 진동 효과
          inputElement.style.animation = "shake 0.5s ease-in-out";

          setTimeout(() => {
            inputElement.classList.remove("animate-bounce");
            inputElement.style.animation = "";
            inputElement.style.backgroundColor = "";
          }, 600);
        }

        // 에러 메시지 자동 제거
        setTimeout(() => setInputError(""), 3000);
      }
    }, [timeInput, parseTimeInput, min, max, setCurrentTime]);

    const handleTimeInputKeyPress = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleTimeInputSubmit();
        } else if (e.key === "Escape") {
          setShowTimeInput(false);
          setTimeInput("");
        }
      },
      [handleTimeInputSubmit]
    );

    const openTimeInput = useCallback(() => {
      setTimeInput(formatTime(currentTime));
      setShowTimeInput(true);
    }, [currentTime]);

    // 운전 모드 세그먼트 생성 - 사이클 길이에 따라 동적으로 조정
    const modeSegments = useMemo((): ModeSegment[] => {
      if (!selectedCycle) return [];

      const { start, end } = selectedCycle;
      const totalDuration = end - start;

      // 사이클 길이에 따른 모드 개수 결정
      let modes: Array<{
        mode: string;
        color: string;
        description: string;
        ratio: number;
      }> = [];

      if (totalDuration <= 0.1) {
        // 6분 이하 (매우 짧은 사이클)
        modes = [
          {
            mode: "급속종료",
            color: "bg-red-500",
            description: "비정상 급속 종료",
            ratio: 1,
          },
        ];
      } else if (totalDuration <= 0.5) {
        // 30분 이하 (짧은 사이클)
        modes = [
          {
            mode: "시동",
            color: "bg-blue-500",
            description: "터빈 시동",
            ratio: 0.3,
          },
          {
            mode: "종료",
            color: "bg-red-500",
            description: "조기 종료",
            ratio: 0.7,
          },
        ];
      } else if (totalDuration <= 2) {
        // 2시간 이하 (중간 길이)
        modes = [
          {
            mode: "시동",
            color: "bg-blue-500",
            description: "터빈 시동 모드",
            ratio: 0.2,
          },
          {
            mode: "운전",
            color: "bg-green-500",
            description: "정상 운전",
            ratio: 0.6,
          },
          {
            mode: "종료",
            color: "bg-purple-500",
            description: "운전 종료",
            ratio: 0.2,
          },
        ];
      } else {
        // 2시간 이상 (정상 길이)
        // 특별한 테스트 케이스: 매우 짧은 모드가 포함된 경우
        if (selectedCycle.id === "test-mixed-modes") {
          modes = [
            {
              mode: "시동",
              color: "bg-blue-500",
              description: "터빈 시동 모드",
              ratio: 0.2,
            },
            {
              mode: "급속예열",
              color: "bg-red-500",
              description: "2초 급속 예열",
              ratio: 0.001,
            }, // 2초 = 0.0006시간 정도
            {
              mode: "정상운전",
              color: "bg-yellow-500",
              description: "정상 운전 모드",
              ratio: 0.6,
            },
            {
              mode: "고출력",
              color: "bg-orange-500",
              description: "고출력 운전",
              ratio: 0.15,
            },
            {
              mode: "종료준비",
              color: "bg-purple-500",
              description: "운전 종료 준비",
              ratio: 0.049,
            },
          ];
        } else {
          modes = [
            {
              mode: "시동",
              color: "bg-blue-500",
              description: "터빈 시동 모드",
              ratio: 0.15,
            },
            {
              mode: "예열",
              color: "bg-green-500",
              description: "예열 준비 단계",
              ratio: 0.15,
            },
            {
              mode: "정상운전",
              color: "bg-yellow-500",
              description: "정상 운전 모드",
              ratio: 0.45,
            },
            {
              mode: "고출력",
              color: "bg-orange-500",
              description: "고출력 운전",
              ratio: 0.15,
            },
            {
              mode: "종료준비",
              color: "bg-purple-500",
              description: "운전 종료 준비",
              ratio: 0.1,
            },
          ];
        }
      }

      // 비율에 따라 실제 시간 계산
      let currentTime = start;
      const segments: ModeSegment[] = [];

      modes.forEach((mode, index) => {
        const segmentDuration = totalDuration * mode.ratio;
        const endTime =
          index === modes.length - 1 ? end : currentTime + segmentDuration;

        // 실제 세그먼트 시간 길이 계산 (시간)
        const actualDuration = endTime - currentTime;

        segments.push({
          mode: mode.mode,
          startTime: currentTime,
          endTime: endTime,
          color: mode.color,
          description: `${mode.description} (${(actualDuration * 60).toFixed(
            actualDuration < 0.1 ? 1 : 0
          )}분)`,
        });

        currentTime = endTime;
      });

      return segments;
    }, [selectedCycle]);

    // 사이클이 선택되면 자동으로 시작 시간으로 이동 (사이클 변경 시에만)
    useEffect(() => {
      if (selectedCycle) {
        setCurrentTime(selectedCycle.start);
      }
    }, [selectedCycle?.id, setCurrentTime]); // selectedCycle.id가 변경될 때만 실행

    return (
      <div className={cn("w-full space-y-6", className)}>
        {/* 개선된 타임 슬라이더 */}
        <div>
          {/* 더 큰 컨트롤 버튼들 */}
          {/* 상단 3열 레이아웃: 퀵앰프(왼쪽) + 중앙 시간 표시(중앙) + 정밀 입력(오른쪽) */}
          <div className="mt-8 mb-6">
            <div className="grid grid-cols-3 gap-4 items-center">
              {/* 왼쪽: 퀵앰프 점프 버튼들 */}
              <div className="flex justify-start">
                {selectedCycle ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTime(selectedCycle.start)}
                        className="h-9 px-3 text-sm min-w-[56px] font-semibold hover:bg-green-50 border-green-300 hover:border-green-500 text-green-700"
                      >
                        시작
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentTime(
                            selectedCycle.start +
                              (selectedCycle.end - selectedCycle.start) * 0.25
                          )
                        }
                        className="h-9 px-3 text-sm min-w-[56px] font-semibold hover:bg-blue-50 border-blue-300 hover:border-blue-500 text-blue-700"
                      >
                        25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentTime(
                            selectedCycle.start +
                              (selectedCycle.end - selectedCycle.start) * 0.5
                          )
                        }
                        className="h-9 px-3 text-sm min-w-[56px] font-semibold hover:bg-purple-50 border-purple-300 hover:border-purple-500 text-purple-700"
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentTime(
                            selectedCycle.start +
                              (selectedCycle.end - selectedCycle.start) * 0.75
                          )
                        }
                        className="h-9 px-3 text-sm min-w-[56px] font-semibold hover:bg-orange-50 border-orange-300 hover:border-orange-500 text-orange-700"
                      >
                        75%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentTime(selectedCycle.end)}
                        className="h-9 px-3 text-sm min-w-[56px] font-semibold hover:bg-red-50 border-red-300 hover:border-red-500 text-red-700"
                      >
                        종료
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    사이클을 선택하세요
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const offset = min > 24 || max > 24 ? 30 : 0.5; // 분 단위면 30분, 시간 단위면 0.5시간
                    setCurrentTime(Math.max(min, currentTime - offset));
                  }}
                  className="h-12 px-6 hover:bg-blue-50 border-2 hover:border-blue-300 transition-all duration-200"
                  disabled={currentTime <= min}
                >
                  <SkipBack className="h-5 w-5 mr-2" />
                  30분 이전
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const offset = min > 24 || max > 24 ? 5 : 5 / 60; // 분 단위면 5분, 시간 단위면 5/60시간
                    setCurrentTime(Math.max(min, currentTime - offset));
                  }}
                  className="h-12 px-4 hover:bg-blue-50 border-2 hover:border-blue-300 transition-all duration-200"
                  disabled={currentTime <= min}
                >
                  <SkipBack className="h-4 w-4 mr-1" />
                  5분
                </Button>

                <div className="mx-4 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const offset = min > 24 || max > 24 ? 5 : 5 / 60; // 분 단위면 5분, 시간 단위면 5/60시간
                    setCurrentTime(Math.min(max, currentTime + offset));
                  }}
                  className="h-12 px-4 hover:bg-blue-50 border-2 hover:border-blue-300 transition-all duration-200"
                  disabled={currentTime >= max}
                >
                  5분
                  <SkipForward className="h-4 w-4 ml-1" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const offset = min > 24 || max > 24 ? 30 : 0.5; // 분 단위면 30분, 시간 단위면 0.5시간
                    setCurrentTime(Math.min(max, currentTime + offset));
                  }}
                  className="h-12 px-6 hover:bg-blue-50 border-2 hover:border-blue-300 transition-all duration-200"
                  disabled={currentTime >= max}
                >
                  30분 이후
                  <SkipForward className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* 오른쪽: 정밀 시간 입력 */}
              <div className="flex justify-end">
                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
                    {!showTimeInput ? (
                      <>
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600 text-xs font-medium">
                          정밀 시간
                        </span>
                        <span className="text-sm font-bold text-slate-900 min-w-[50px] text-center">
                          {formatTime(currentTime)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openTimeInput}
                          className="h-7 px-2 text-xs hover:bg-blue-50 border-blue-300 hover:border-blue-500 text-blue-700"
                          title="시간 직접 입력하기"
                        >
                          수정
                        </Button>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div className="relative">
                          <Input
                            type="text"
                            value={timeInput}
                            onChange={(e) => {
                              setTimeInput(e.target.value);
                              setInputError("");
                            }}
                            onKeyDown={handleTimeInputKeyPress}
                            placeholder="HH:MM"
                            className={cn(
                              "w-20 h-7 text-center text-xs font-mono",
                              parseTimeInput(timeInput) === null &&
                                timeInput.length > 0
                                ? "border-red-300 focus:border-red-500 bg-red-50"
                                : parseTimeInput(timeInput) !== null &&
                                  (parseTimeInput(timeInput)! < min ||
                                    parseTimeInput(timeInput)! > max)
                                ? "border-orange-300 focus:border-orange-500 bg-orange-50"
                                : "border-blue-300 focus:border-blue-500 bg-blue-50"
                            )}
                            autoFocus
                          />
                          {inputError && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 max-w-xs">
                              <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-xl whitespace-nowrap">
                                {inputError}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600" />
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleTimeInputSubmit}
                          className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          확인
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowTimeInput(false);
                            setTimeInput("");
                            setInputError("");
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          취소
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 슬라이더 컴포넌트 */}
          <div className="relative px-4">
            <div className="relative">
              <Slider
                value={[currentTime]}
                onValueChange={handleValueChange}
                min={min}
                max={max}
                step={step}
                className={cn(
                  "w-full",
                  // 핸들(슬라이더 썸)을 완전한 원형으로 만들고, 흰색 테두리와 그림자만 남김
                  "[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:rounded-full [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg",
                  // 핸들 그라데이션
                  "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-indigo-600",
                  // 트랙(슬라이더 바) 스타일
                  "[&>span:first-child]:h-3 [&>span:first-child]:rounded-full [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-blue-500 [&>span:first-child]:to-indigo-600"
                )}
              />

              {/* 개선된 툴팁 */}
              {showTooltip && showTooltipState && (
                <div
                  className="absolute bottom-10 z-30 transition-all duration-200 ease-out"
                  style={{
                    left: `${timeToPercent(currentTime)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-xl border border-slate-700">
                    <div className="text-center">
                      <div className="font-bold text-base">
                        {formatTime(currentTime)}
                      </div>
                      {selectedCycle && (
                        <div className="text-xs text-slate-300 mt-1">
                          {formatRelativeTime(currentTime, selectedCycle.start)}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 개선된 시간 라벨 */}
          {showTimeLabels && (
            <div className="relative mt-6 px-4 mb-8">
              {timeLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute -translate-x-1/2 cursor-pointer group"
                  style={{ left: `${label.percent}%` }}
                  onClick={() => setCurrentTime(label.time)}
                >
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                      {label.label}
                    </div>
                    {label.relativeLabel && (
                      <div className="text-xs text-slate-500 mt-1 group-hover:text-blue-500 transition-colors">
                        {label.relativeLabel}
                      </div>
                    )}
                  </div>
                  {/* 클릭 가능 표시 */}
                  <div className="w-2 h-2 bg-slate-400 rounded-full mx-auto mt-2 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-200"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모드 시각화 */}
        {showModeVisualization && selectedCycle && (
          <TimeModeVisualization
            currentTime={currentTime}
            timeRange={{ min, max }}
            className="border-t pt-6"
            modeSegments={modeSegments}
          />
        )}
      </div>
    );
  }
);

ChartTimeSlider.displayName = "ChartTimeSlider";
