"use client";

import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useTimelineStore } from "@/lib/stores";
import { TimeModeVisualization } from "./time-mode-visualization";

export interface TimePoint {
  time: number; // 시간 (0-24)
  label?: string; // 선택적 라벨
  type?: "start" | "end" | "marker" | "current"; // 포인트 타입
  color?: string; // 커스텀 색상
}

export interface TimeSliderProps {
  /** 현재 선택된 시간 */
  value: number;
  /** 시간 변경 콜백 */
  onChange: (time: number) => void;
  /** 시간 포인트들 */
  timePoints?: TimePoint[];
  /** 최소 시간 (기본값: 0) */
  min?: number;
  /** 최대 시간 (기본값: 24) */
  max?: number;
  /** 시간 간격 (기본값: 1/60 - 1분) */
  step?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 클래스명 */
  className?: string;
  /** 시간 표시 포맷 함수 */
  formatTime?: (time: number) => string;
  /** 툴팁 표시 여부 */
  showTooltip?: boolean;
  /** 시간 라벨 표시 여부 */
  showTimeLabels?: boolean;
  /** 모드 시각화 표시 여부 */
  showModeVisualization?: boolean;
}

const defaultFormatTime = (time: number): string => {
  const totalMinutes = Math.round(time * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const getTimePointStyle = (type: TimePoint["type"], color?: string) => {
  const baseClasses =
    "absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg z-10";

  switch (type) {
    case "start":
      return cn(baseClasses, "w-4 h-4", color || "bg-green-500");
    case "end":
      return cn(baseClasses, "w-4 h-4", color || "bg-red-500");
    case "current":
      return cn(baseClasses, "w-5 h-5", color || "bg-blue-600");
    case "marker":
    default:
      return cn(baseClasses, "w-3 h-3", color || "bg-orange-400");
  }
};

export const TimeSlider = React.memo<TimeSliderProps>(
  ({
    value,
    onChange,
    timePoints = [],
    min = 0,
    max = 24,
    step = 1 / 60, // 1분 단위
    disabled = false,
    className,
    formatTime = defaultFormatTime,
    showTooltip = true,
    showTimeLabels = true,
    showModeVisualization = false,
  }) => {
    const [showTooltipState, setShowTooltipState] = useState(false);
    const [timeInput, setTimeInput] = useState("");
    const [showTimeInput, setShowTimeInput] = useState(false);

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
      for (let time = min; time <= max; time += 2) {
        labels.push({
          time,
          percent: timeToPercent(time),
          label: formatTime(time),
        });
      }
      return labels;
    }, [min, max, timeToPercent, formatTime]);

    // 슬라이더 값 변경 핸들러
    const handleValueChange = useCallback(
      (newValue: number[]) => {
        onChange(newValue[0]);
        if (showTooltip) {
          setShowTooltipState(true);
          setTimeout(() => setShowTooltipState(false), 1000);
        }
      },
      [onChange, showTooltip]
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
        onChange(parsedTime);
        setShowTimeInput(false);
        setTimeInput("");
      } else {
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
            // 테두리 색상은 CSS 클래스로 관리되므로 제거하지 않음
          }, 600);
        }
      }
    }, [timeInput, parseTimeInput, min, max, onChange]);

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
      setTimeInput(formatTime(value));
      setShowTimeInput(true);
    }, [value, formatTime]);

    return (
      <div className={cn("w-full space-y-6", className)}>
        {/* 타임 슬라이더 */}
        <div className="py-6">
          {/* 슬라이더 컨테이너 */}
          <div className="relative px-4">
            {/* shadcn/ui Slider */}
            <div className="relative">
              <Slider
                value={[value]}
                onValueChange={handleValueChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={cn(
                  "w-full"
                  // 아래 한 줄 추가: 핸들(썸)에 원형, 그림자, 흰 테두리 적용
                )}
              />

              {/* 시간 포인트들 오버레이 */}
              {timePoints.map((point, index) => {
                const percent = timeToPercent(point.time);
                return (
                  <div
                    key={index}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ left: `${percent}%` }}
                  >
                    <div
                      className={getTimePointStyle(point.type, point.color)}
                      title={point.label || formatTime(point.time)}
                    />
                    {point.label && (
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600 whitespace-nowrap">
                        {point.label}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 툴팁 */}
              {showTooltip && showTooltipState && (
                <div
                  className="absolute bottom-8 z-30 transition-[left] duration-150 ease-out"
                  style={{
                    left: `${timeToPercent(value)}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
                    {formatTime(value)}
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
                  className="absolute -translate-x-1/2 text-sm text-slate-600 font-medium"
                  style={{ left: `${label.percent}%` }}
                >
                  {label.label}
                </div>
              ))}
            </div>
          )}

          {/* 현재 선택된 시간 표시 */}
          <div className="mt-14 text-center">
            <div className="inline-flex items-center gap-2">
              {!showTimeInput ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
                    <span className="text-slate-600 font-medium">
                      선택 시간:
                    </span>
                    <span className="text-xl font-bold text-slate-900">
                      {formatTime(value)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openTimeInput}
                    className="h-8 w-8 p-0"
                    title="시간 직접 입력"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <span className="text-slate-600 text-sm font-medium">
                    시간 입력:
                  </span>
                  <Input
                    type="text"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    onKeyDown={handleTimeInputKeyPress}
                    placeholder="HH:MM"
                    className={cn(
                      "w-20 h-8 text-center",
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTimeInputSubmit}
                    className="h-8 px-2"
                  >
                    확인
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTimeInput(false);
                      setTimeInput("");
                    }}
                    className="h-8 px-2"
                  >
                    취소
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모드 시각화 */}
        {showModeVisualization && (
          <TimeModeVisualization
            currentTime={value}
            timeRange={{ min, max }}
            className="border-t pt-6"
            modeSegments={[]} // TODO: Replace with actual modeSegments data as needed
          />
        )}
      </div>
    );
  }
);

TimeSlider.displayName = "TimeSlider";
