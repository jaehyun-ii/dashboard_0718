"use client"

import { X, TrendingUp, BarChart3 } from "lucide-react"
import { useDashboardStore } from "@/lib/store"
import { useEffect, useRef } from "react"

export function VariableTooltip() {
  const { timeline, setSelectedVariable } = useDashboardStore()
  const tooltipRef = useRef<HTMLDivElement>(null)

  const { selectedVariable, tooltipPosition } = timeline

  useEffect(() => {
    if (tooltipRef.current && tooltipPosition) {
      const tooltip = tooltipRef.current
      const rect = tooltip.getBoundingClientRect()

      // Adjust position to keep tooltip in viewport
      let x = tooltipPosition.x
      let y = tooltipPosition.y

      if (x + rect.width > window.innerWidth) {
        x = window.innerWidth - rect.width - 20
      }
      if (y + rect.height > window.innerHeight) {
        y = tooltipPosition.y - rect.height - 20
      }

      tooltip.style.left = `${x}px`
      tooltip.style.top = `${y}px`
    }
  }, [tooltipPosition])

  if (!selectedVariable || !tooltipPosition) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "warning":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  const generateMiniChart = (data: number[]) => {
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1

    return data.map((value, index) => {
      const height = ((value - min) / range) * 40 + 10
      return (
        <div
          key={index}
          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm"
          style={{ height: `${height}px`, width: "8px" }}
        />
      )
    })
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-80 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{ left: 0, top: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{selectedVariable.name}</h3>
            <p className="text-sm text-slate-600 capitalize">{selectedVariable.group}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedVariable(null)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X size={16} className="text-slate-600" />
        </button>
      </div>

      {/* Current Value */}
      <div className="mb-4 p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-slate-800">{selectedVariable.value}</div>
            <div className="text-sm text-slate-600">Current Value</div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedVariable.status)}`}
          >
            {selectedVariable.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      {selectedVariable.chartData && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={16} className="text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Trend (Last 5 readings)</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-16 p-3 bg-gradient-to-t from-blue-50 to-transparent rounded-xl border border-blue-100">
            {generateMiniChart(selectedVariable.chartData)}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>5h ago</span>
            <span>4h ago</span>
            <span>3h ago</span>
            <span>2h ago</span>
            <span>Now</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="text-lg font-bold text-emerald-700">
            {selectedVariable.chartData ? Math.max(...selectedVariable.chartData) : selectedVariable.value}
          </div>
          <div className="text-xs text-emerald-600">Peak</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
          <div className="text-lg font-bold text-blue-700">
            {selectedVariable.chartData
              ? (selectedVariable.chartData.reduce((a, b) => a + b, 0) / selectedVariable.chartData.length).toFixed(1)
              : selectedVariable.value}
          </div>
          <div className="text-xs text-blue-600">Average</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium">
          Detailed View
        </button>
        <button className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-all duration-200 text-sm font-medium">
          Export Data
        </button>
      </div>
    </div>
  )
}
