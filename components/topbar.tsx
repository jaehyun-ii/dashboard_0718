"use client";

import { User, Bell, ChevronLeft, ChevronRight } from "lucide-react"; // Removed Calendar
import { useUIStore } from "@/lib/stores";

export function Topbar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 p-5 flex items-center justify-between shadow-sm">
      {/* Left Section: Sidebar Toggle + Dashboard Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm"
          aria-label={sidebarOpen ? "사이드바 닫기" : "사이드바 열기"}
        >
          {sidebarOpen ? (
            <ChevronLeft size={20} className="text-slate-600" />
          ) : (
            <ChevronRight size={20} className="text-slate-600" />
          )}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            대시보드
          </h1>
        </div>
      </div>

      {/* Center Section: Empty (Date Range moved) */}
      <div className="flex-1 flex justify-center">
        {/* This space is intentionally left blank as Date Range is moved */}
      </div>

      {/* Right Section: Bell, User (제거된 제어 센터) */}
      <div className="flex items-center gap-6">
        <button
          className="p-3 hover:bg-white/80 rounded-xl transition-all duration-200 relative"
          aria-label="알림"
        >
          <Bell size={20} className="text-slate-600" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>

        <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
          <span className="text-xl font-medium text-slate-700 hidden sm:block">
            관리자
          </span>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
