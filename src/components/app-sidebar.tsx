"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LogOut, User, Info, Home } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "About Me", href: "/dashboard", icon: User },
  { name: "About Product", href: "/products", icon: Info },
];

export function AppSidebar({
  isMobile,
  toggleSidebar,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  isMobile?: boolean;
  toggleSidebar?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-col items-center justify-center py-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.href}
                  className={`flex items-center ${
                    pathname === item.href
                      ? "font-bold text-[#fff] bg-[#27272A]"
                      : "text-[#fff]"
                  }`}
                  onClick={isMobile ? toggleSidebar : undefined} // Collapse sidebar on mobile
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="w-full justify-start bg-black text-white outline-none border-none"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
