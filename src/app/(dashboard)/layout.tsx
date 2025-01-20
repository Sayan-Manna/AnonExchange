"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="dark flex w-full relative bg-background text-foreground">
            <AppSidebar
              className={isSidebarOpen ? "block" : "hidden lg:block"} // Conditional visibility
              isMobile={true}
              toggleSidebar={toggleSidebar}
            />
            <SidebarInset>
              <SidebarTrigger
                className="absolute left-4 top-3"
                onClick={toggleSidebar}
              />
              <main className="flex-1 overflow-auto p-4">{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
