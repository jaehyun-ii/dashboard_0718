"use client";

import { X, Clock, Settings, AlertCircle } from "lucide-react";
import { useDashboardStore } from "@/lib/store";

export function CycleDetailsModal() {
  const { selectedCycleInfo, showCycleDetails, setShowCycleDetails } =
    useDashboardStore();

  if (!showCycleDetails || !selectedCycleInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Settings size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Cycle Details
              </h3>
              <p className="text-slate-600">Operational information</p>
            </div>
          </div>
          <button
            onClick={() => setShowCycleDetails(false)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Cycle Name:</span>
            <span className="font-bold text-slate-800">
              {selectedCycleInfo.name}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Turbine:</span>
            <span className="font-bold text-slate-800">
              {selectedCycleInfo.turbine}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} />
              Start Time:
            </span>
            <span className="font-bold text-slate-800">
              {selectedCycleInfo.start}:00
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700">Duration:</span>
            <span className="font-bold text-slate-800">
              {selectedCycleInfo.end - selectedCycleInfo.start} hours
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
            <span className="font-semibold text-slate-700 flex items-center gap-2">
              <AlertCircle size={16} />
              Status:
            </span>
            <span
              className={`px-4 py-2 rounded-xl font-semibold ${
                selectedCycleInfo.color.includes("blue")
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-orange-100 text-orange-800 border border-orange-200"
              }`}
            >
              {selectedCycleInfo.color.includes("blue")
                ? "Normal Operation"
                : "Attention Required"}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/25">
            View Detailed Report
          </button>
          <button
            onClick={() => setShowCycleDetails(false)}
            className="flex-1 px-6 py-4 bg-slate-200 text-slate-800 rounded-xl hover:bg-slate-300 transition-all duration-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
