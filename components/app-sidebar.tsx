"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  BarChart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "Present Detection",
    url: "#",
    icon: Search,
  },
  {
    title: "Report",
    url: "#",
    icon: BarChart,
  },
  {
    title: "Chatbot",
    url: "#",
    icon: MessageSquare,
  },
  {
    title: "Sidebar", // This seems to be a placeholder from the image, keeping it for fidelity
    url: "#",
    icon: Inbox,
  },
  {
    title: "Tree2", // This seems to be a placeholder from the image, keeping it for fidelity
    url: "#",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader className="flex items-center justify-between p-2">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="h-8 w-8" />
          <span className="group-data-[state=collapsed]:hidden">Logo</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 group-data-[state=collapsed]:hidden"
          onClick={toggleSidebar}
        >
          {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="sr-only">Close Sidebar</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[state=collapsed]:hidden">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url} className="flex items-center gap-2">
                      {/* FIX: render icon as a component instead of calling it as a function */}
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail>
        {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </SidebarRail>
    </Sidebar>
  )
}
