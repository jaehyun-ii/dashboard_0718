"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface ModeSegment {
  mode: string;
  startTime: number;
  endTime: number;
  color: string;
  description?: string;
}

export interface TimeModeVisualizationProps {
  /** 현재 선택된 시간 */
  currentTime: number;
  /** 시간 범위 */
  timeRange: { min: number; max: number };
  /** 모드 세그먼트들 */
  modeSegments: ModeSegment[];
  /** 클래스명 */
  className?: string;
  /** 선택된 시간 표시 여부 */
  showCurrentTime?: boolean;
  /** 투명도 효과 적용 여부 */
  showFadeEffect?: boolean;
}

// 기본 모드 데이터 (예시) - 선택된 사이클의 시간 범위에 맞게 동적으로 생성
const createDefaultModeSegments = (min: number, max: number): ModeSegment[] => {
  const totalDuration = max - min;
  const segmentDuration = totalDuration / 6;

  return [
    {
      mode: "MODE1",
      startTime: min,
      endTime: min + segmentDuration,
      color: "bg-blue-500",
      description: "시동 모드",
    },
    {
      mode: "MODE2",
      startTime: min + segmentDuration,
      endTime: min + segmentDuration * 2,
      color: "bg-green-500",
      description: "가동 준비",
    },
    {
      mode: "MODE3",
      startTime: min + segmentDuration * 2,
      endTime: min + segmentDuration * 3,
      color: "bg-yellow-500",
      description: "정상 운전",
    },
    {
      mode: "MODE4",
      startTime: min + segmentDuration * 3,
      endTime: min + segmentDuration * 4,
      color: "bg-orange-500",
      description: "고출력 운전",
    },
    {
      mode: "MODE5",
      startTime: min + segmentDuration * 4,
      endTime: min + segmentDuration * 5,
      color: "bg-purple-500",
      description: "점검 모드",
    },
    {
      mode: "MODE6",
      startTime: min + segmentDuration * 5,
      endTime: max,
      color: "bg-indigo-500",
      description: "종료 준비",
    },
  ];
};

export const TimeModeVisualization = React.memo<TimeModeVisualizationProps>(
  ({
    currentTime,
    timeRange,
    modeSegments,
    className,
    showCurrentTime = true,
    showFadeEffect = true,
  }) => {
    // 기본 모드 세그먼트를 시간 범위에 맞게 생성
    const actualModeSegments =
      modeSegments || createDefaultModeSegments(timeRange.min, timeRange.max);
    // 시간을 퍼센트로 변환
    const timeToPercent = (time: number) => {
      const { min, max } = timeRange;
      return ((time - min) / (max - min)) * 100;
    };

    // 시간을 hh:mm 형식으로 변환하는 함수 (입력: 총 분)
    const formatTime = (totalMinutes: number) => {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);

      if (minutes === 60) {
        return `${String(hours + 1).padStart(2, "0")}:00`;
      }

      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };

    // 현재 시간이 포함된 모드 찾기
    const currentMode = useMemo(() => {
      return actualModeSegments.find(
        (segment) =>
          currentTime >= segment.startTime && currentTime <= segment.endTime
      );
    }, [currentTime, actualModeSegments]);

    // 현재 시간 위치 (퍼센트)
    const currentTimePercent = timeToPercent(currentTime);

    return (
      <div className={cn("w-full py-4", className)}>
        {/* 타임라인 바 */}
        <div className="relative px-4 pt-10">
          <div className="relative h-10 bg-slate-100 overflow-visible">
            {/* 모드 세그먼트들 */}
            {actualModeSegments.map((segment, index) => {
              const startPercent = timeToPercent(segment.startTime);
              const endPercent = timeToPercent(segment.endTime);
              const width = endPercent - startPercent;

              // 현재 시간과의 거리에 따른 투명도 계산
              const isActive =
                currentTime >= segment.startTime &&
                currentTime <= segment.endTime;
              const distance = Math.min(
                Math.abs(currentTime - segment.startTime),
                Math.abs(currentTime - segment.endTime)
              );
              const opacity =
                showFadeEffect && !isActive
                  ? Math.max(0.3, 1 - distance / 6) // 거리에 따라 투명도 조절
                  : 1;

              return (
                <div
                  key={index}
                  className={cn(
                    "absolute top-0 h-full flex items-center justify-center text-white text-xs font-medium transition-all duration-300",
                    segment.color,
                    isActive &&
                      "ring-2 ring-white ring-inset shadow-lg scale-105"
                  )}
                  style={{
                    left: `${startPercent}%`,
                    width: `${width}%`,
                    opacity,
                    zIndex: isActive ? 10 : 1,
                  }}
                >
                  <div className="text-center">
                    {width > 8 ? ( // 8% 이상일 때만 텍스트 표시
                      <>
                        <div className="font-bold text-sm">{segment.mode}</div>
                        <div className="text-xs opacity-90">
                          {formatTime(segment.startTime)} -{" "}
                          {formatTime(segment.endTime)}
                        </div>
                      </>
                    ) : width > 3 ? ( // 3-8%일 때는 모드명만
                      <div className="font-bold text-xs">{segment.mode}</div>
                    ) : (
                      // 3% 미만일 때는 점으로 표시
                      <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 현재 시간 표시선 */}
            {showCurrentTime && (
              <div
                className="absolute top-0 h-full w-1 bg-red-500 shadow-lg z-30 transition-[left] duration-200 ease-out rounded-full"
                style={{ left: `${currentTimePercent}%` }}
              >
                {/* 현재 시간 마커 */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-30"></div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg z-30"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TimeModeVisualization.displayName = "TimeModeVisualization";
