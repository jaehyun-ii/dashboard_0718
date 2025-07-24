"use client";

import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { CycleDetailsModal } from "@/components/cycle-details-modal";
import { useUIStore } from "@/lib/stores";
import {
  DashboardPage,
  PresentDetectionPage,
  ReportPage,
  ChatbotPage,
} from "@/components/pages";

export default function MainPage() {
  const { activeMenuItem } = useUIStore();

  const renderPage = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardPage />;
      case "present-detection":
        return <PresentDetectionPage />;
      case "report":
        return <ReportPage />;
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
