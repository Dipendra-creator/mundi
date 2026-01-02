"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Menu,
    Building2,
    Package,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
    {
        title: "Overview",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        title: "Management",
        items: [
            { name: "Firms (फर्म)", href: "/dashboard/firms", icon: Building2 },
            { name: "Kisaan (किसान)", href: "/dashboard/kisaans", icon: Users },
            { name: "Stock (स्टॉक)", href: "/dashboard/stock", icon: Package },
        ],
    },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <Sidebar>
                    <SidebarHeader className="border-b px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <span className="text-lg font-bold">M</span>
                            </div>
                            <span className="text-xl font-bold">Mundi</span>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        {navigation.map((section) => (
                            <SidebarGroup key={section.title}>
                                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {section.items.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.href
                                            return (
                                                <SidebarMenuItem key={item.name}>
                                                    <SidebarMenuButton asChild isActive={isActive}>
                                                        <Link href={item.href}>
                                                            <Icon className="h-4 w-4" />
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            )
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>
                    <SidebarFooter className="border-t p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/avatar.png" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-medium">Admin User</span>
                                        <span className="text-xs text-muted-foreground">
                                            admin@mundi.com
                                        </span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarFooter>
                </Sidebar>
                <div className="flex flex-1 flex-col">
                    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger>
                            <Menu className="h-6 w-6" />
                        </SidebarTrigger>
                        <div className="flex-1" />
                    </header>
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    )
}
