"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useTimelineStore } from "@/lib/stores";
import { TimeModeVisualization, ModeSegment } from "./time-mode-visualization";

interface ChartTimeSliderProps {
  className?: string;
  showTooltip?: boolean;
  showTimeLabels?: boolean;
  showModeVisualization?: boolean;
}

const formatTime = (time: number): string => {
  const totalMinutes = Math.round(time * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
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
    const step = 1 / 60; // 1분 단위 (1/60 시간)

    // 시간을 퍼센트로 변환
    const timeToPercent = useCallback(
      (time: number) => {
        return ((time - min) / (max - min)) * 100;
      },
      [min, max]
    );

    // 시간 라벨 생성
    const timeLabels = useMemo(() => {
      const labels = [];
      const interval = Math.max(1, Math.ceil((max - min) / 12)); // Show max 12 labels
      for (
        let time = Math.ceil(min);
        time <= Math.floor(max);
        time += interval
      ) {
        labels.push({
          time,
          percent: timeToPercent(time),
          label: formatTime(time),
        });
      }
      return labels;
    }, [min, max, timeToPercent]);

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
    const parseTimeInput = useCallback((input: string): number | null => {
      const timePattern = /^(\d{1,2}):(\d{2})$/;
      const match = input.match(timePattern);

      if (!match) return null;

      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

      const timeValue = hours + minutes / 60;
      return timeValue;
    }, []);

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
          setInputError(`시간은 ${formatTime(min)} ~ ${formatTime(max)} 범위여야 합니다`);
        }
        
        // 더 명확한 오류 애니메이션 효과
        const inputElement = document.querySelector(
          'input[placeholder="HH:MM"]'
        ) as HTMLInputElement;
        if (inputElement) {
          // 빨간색 테두리와 shake 애니메이션 추가
          inputElement.style.borderColor = '#ef4444';
          inputElement.style.backgroundColor = '#fef2f2';
          inputElement.classList.add('animate-bounce');
          
          // 진동 효과
          inputElement.style.animation = 'shake 0.5s ease-in-out';
          
          setTimeout(() => {
            inputElement.classList.remove('animate-bounce');
            inputElement.style.animation = '';
            inputElement.style.backgroundColor = '';
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
      let modes: Array<{mode: string, color: string, description: string, ratio: number}> = [];
      
      if (totalDuration <= 0.1) { // 6분 이하 (매우 짧은 사이클)
        modes = [
          { mode: "급속종료", color: "bg-red-500", description: "비정상 급속 종료", ratio: 1 }
        ];
      } else if (totalDuration <= 0.5) { // 30분 이하 (짧은 사이클)
        modes = [
          { mode: "시동", color: "bg-blue-500", description: "터빈 시동", ratio: 0.3 },
          { mode: "종료", color: "bg-red-500", description: "조기 종료", ratio: 0.7 }
        ];
      } else if (totalDuration <= 2) { // 2시간 이하 (중간 길이)
        modes = [
          { mode: "시동", color: "bg-blue-500", description: "터빈 시동 모드", ratio: 0.2 },
          { mode: "운전", color: "bg-green-500", description: "정상 운전", ratio: 0.6 },
          { mode: "종료", color: "bg-purple-500", description: "운전 종료", ratio: 0.2 }
        ];
      } else { // 2시간 이상 (정상 길이)
        // 특별한 테스트 케이스: 매우 짧은 모드가 포함된 경우
        if (selectedCycle.id === "test-mixed-modes") {
          modes = [
            { mode: "시동", color: "bg-blue-500", description: "터빈 시동 모드", ratio: 0.2 },
            { mode: "급속예열", color: "bg-red-500", description: "2초 급속 예열", ratio: 0.001 }, // 2초 = 0.0006시간 정도
            { mode: "정상운전", color: "bg-yellow-500", description: "정상 운전 모드", ratio: 0.6 },
            { mode: "고출력", color: "bg-orange-500", description: "고출력 운전", ratio: 0.15 },
            { mode: "종료준비", color: "bg-purple-500", description: "운전 종료 준비", ratio: 0.049 }
          ];
        } else {
          modes = [
            { mode: "시동", color: "bg-blue-500", description: "터빈 시동 모드", ratio: 0.15 },
            { mode: "예열", color: "bg-green-500", description: "예열 준비 단계", ratio: 0.15 },
            { mode: "정상운전", color: "bg-yellow-500", description: "정상 운전 모드", ratio: 0.45 },
            { mode: "고출력", color: "bg-orange-500", description: "고출력 운전", ratio: 0.15 },
            { mode: "종료준비", color: "bg-purple-500", description: "운전 종료 준비", ratio: 0.1 }
          ];
        }
      }
      
      // 비율에 따라 실제 시간 계산
      let currentTime = start;
      const segments: ModeSegment[] = [];
      
      modes.forEach((mode, index) => {
        const segmentDuration = totalDuration * mode.ratio;
        const endTime = index === modes.length - 1 ? end : currentTime + segmentDuration;
        
        // 실제 세그먼트 시간 길이 계산 (시간)
        const actualDuration = endTime - currentTime;
        
        segments.push({
          mode: mode.mode,
          startTime: currentTime,
          endTime: endTime,
          color: mode.color,
          description: `${mode.description} (${(actualDuration * 60).toFixed(actualDuration < 0.1 ? 1 : 0)}분)`
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
        {/* 타임 슬라이더 */}
        <div className="py-4">
          {/* 슬라이더 컨테이너 */}
          <div className="relative px-4">
            {/* shadcn/ui Slider */}
            <div className="relative">
              <Slider
                value={[currentTime]}
                onValueChange={handleValueChange}
                min={min}
                max={max}
                step={step}
                className="w-full"
              />

              {/* 툴팁 */}
              {showTooltip && showTooltipState && (
                <div
                  className="absolute bottom-8 z-30 transition-[left] duration-150 ease-out"
                  style={{
                    left: `${timeToPercent(currentTime)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                    {formatTime(currentTime)}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 시간 라벨 */}
          {showTimeLabels && (
            <div className="relative mt-4 px-4 mb-12">
              {timeLabels.map((label, index) => (
                <div
                  key={index}
                  className="absolute -translate-x-1/2 text-xs text-slate-600 font-medium"
                  style={{ left: `${label.percent}%` }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          )}

          {/* 선택된 시간 표시 - 중앙 */}
          <div className="mt-14 flex justify-center">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg min-w-[300px] justify-center">
                {!showTimeInput ? (
                  <>
                    <span className="text-slate-600 text-sm font-medium">선택 시간:</span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatTime(currentTime)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openTimeInput}
                      className="h-7 px-2 ml-2"
                      title="시간 직접 입력하기"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-xs">시간 수정</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-slate-600 text-sm font-medium">
                      시간 입력:
                    </span>
                    <div className="relative">
                      <Input
                        type="text"
                        value={timeInput}
                        onChange={(e) => {
                          setTimeInput(e.target.value);
                          setInputError(""); // 입력 중에는 에러 메시지 제거
                        }}
                        onKeyDown={handleTimeInputKeyPress}
                        placeholder="HH:MM"
                        className={cn(
                          "w-20 h-7 text-center text-sm",
                          parseTimeInput(timeInput) === null && timeInput.length > 0
                            ? "border-red-300 focus:border-red-500"
                            : parseTimeInput(timeInput) !== null &&
                              (parseTimeInput(timeInput)! < min ||
                                parseTimeInput(timeInput)! > max)
                            ? "border-orange-300 focus:border-orange-500"
                            : ""
                        )}
                        autoFocus
                      />
                      {/* 툴팁 스타일의 에러 메시지 */}
                      {inputError && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-50 max-w-xs">
                          <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg whitespace-nowrap">
                            {inputError}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-red-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTimeInputSubmit}
                      className="h-7 px-2 text-xs"
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
