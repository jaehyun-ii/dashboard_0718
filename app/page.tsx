"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CycleDetailsModal } from "@/components/cycle-details-modal";
import { useUIStore, useStoreCoordination } from "@/lib/stores";
import { useTimelineStore } from "@/lib/stores/timeline-store";
import {
  DashboardPage,
  PresentDetectionPage,
  ChatbotPage,
} from "@/components/pages";
import ReportsManagementPage from "@/components/pages/reports-management-page";

export default function MainPage() {
  // Initialize store coordination with proper cleanup
  useStoreCoordination();
  
  const { fetchRecentCycles } = useTimelineStore();
  
  // Load initial data from backend on app start
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchRecentCycles();
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    
    initializeData();
  }, [fetchRecentCycles]);
  
  const { activeMenuItem } = useUIStore();

  const renderPage = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardPage />;
      case "present-detection":
        return <PresentDetectionPage />;
      case "report":
        return <ReportsManagementPage />;
      case "chatbot":
        return <ChatbotPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 max-w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />
        {renderPage()}
      </div>

      {/* Modals */}
      <CycleDetailsModal />
    </div>
  );
}
