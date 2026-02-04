"use client"

import * as React from "react"
import Image from "next/image"
import {
  IconDashboard,
  IconPhone,
  IconCreditCard,
  IconLogout,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/auth-context"
import { Button } from "@/components/ui/button"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Calls",
      url: "/calls",
      icon: IconPhone,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Image
                  src="/airmeet.svg"
                  alt="Airmeet"
                  width={60}
                  height={60}
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        {user && (
          <div className="p-4 space-y-3">
            {/* User Credits Card */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <IconCreditCard className="h-4 w-4 text-primary" />
                <span>Credits</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-primary">{user.credits}</span>
                <span className="text-xs text-muted-foreground">remaining</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Plan: {user.plan}</span>
                <span>{user.totalMinsUsed} mins used</span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-1">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <IconLogout className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
