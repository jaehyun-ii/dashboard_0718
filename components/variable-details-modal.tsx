"use client"

import { X, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import { useDashboardStore } from "@/lib/store"

export function VariableDetailsModal() {
  const { selectedVariableInfo, showVariableDetails, setShowVariableDetails } = useDashboardStore()

  if (!showVariableDetails || !selectedVariableInfo) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <Activity size={16} className="text-emerald-600" />
      case "warning":
        return <AlertTriangle size={16} className="text-orange-600" />
      case "critical":
        return <AlertTriangle size={16} className="text-red-600" />
      default:
        return <Activity size={16} className="text-slate-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Variable Details</h3>
              <p className="text-slate-600">System monitoring data</p>
            </div>
          </div>
          <button
            onClick={() => setShowVariableDetails(false)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Variable Name:</span>
            <span className="font-bold text-slate-800">{selectedVariableInfo.name}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Group:</span>
            <span className="font-bold text-slate-800 capitalize">{selectedVariableInfo.group}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Current Value:</span>
            <span className="font-bold text-slate-800">{selectedVariableInfo.value}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              {getStatusIcon(selectedVariableInfo.status)}
              Status:
            </span>
            <span
              className={`px-4 py-2 rounded-xl font-semibold capitalize border ${getStatusColor(selectedVariableInfo.status)}`}
            >
              {selectedVariableInfo.status}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Last Updated:</span>
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>2 minutes ago
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-emerald-500/25">
            View History
          </button>
          <button
            onClick={() => setShowVariableDetails(false)}
            className="flex-1 px-6 py-4 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-all duration-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
