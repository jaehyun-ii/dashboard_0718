"use client";
import {
  Home,
  Search,
  BarChart,
  MessageSquare,
  SidebarIcon,
  TreePine,
} from "lucide-react"; // Removed ChevronLeft, ChevronRight
import { useUIStore } from "@/lib/stores";

const menuItems = [
  { id: "dashboard", title: "대시보드", icon: Home },
  { id: "present-detection", title: "현재 감지", icon: Search },
  { id: "report", title: "보고서", icon: BarChart },
  { id: "chatbot", title: "챗봇", icon: MessageSquare },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activeMenuItem, setActiveMenuItem } =
    useUIStore();

  const handleMenuClick = (itemId: string) => {
    setActiveMenuItem(itemId);
    console.log(`Navigating to: ${itemId}`);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-40 shadow-2xl ${
          sidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <span className="font-bold text-4xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            대시보드
          </span>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200 group ${
                activeMenuItem === item.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 scale-105"
                  : "hover:bg-slate-700/50 hover:scale-105"
              }`}
            >
              <item.icon
                size={22}
                className={`${
                  activeMenuItem === item.id
                    ? "text-white"
                    : "text-slate-300 group-hover:text-white"
                } transition-colors`}
              />
              <span
                className={`text-xl font-medium ${
                  activeMenuItem === item.id
                    ? "text-white"
                    : "text-slate-300 group-hover:text-white"
                } transition-colors`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
