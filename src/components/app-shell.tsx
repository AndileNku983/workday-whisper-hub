import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Mail,
  MessageSquareText,
  ListChecks,
  Settings,
  Plug,
  LogOut,
  Moon,
  Sun,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";
import { profileQuery, tasksQuery } from "@/lib/queries";
import { isOverdue } from "@/lib/tasks";
import { DEMO_EMAILS } from "@/lib/demo-emails";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/chat", label: "AI Assistant", icon: MessageSquareText },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
] as const;
const NAV2 = [
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { theme, toggle } = useTheme();
  const { data: profile } = useQuery(profileQuery);
  const { data: tasks = [] } = useQuery(tasksQuery);

  const notifications = [
    ...tasks.filter((t) => isOverdue(t)).map((t) => ({ id: t.id, text: `Overdue: ${t.title}` })),
    ...tasks
      .filter((t) => t.reminder && t.status !== "done" && !isOverdue(t))
      .slice(0, 3)
      .map((t) => ({ id: `r${t.id}`, text: `Reminder: ${t.title}` })),
    ...DEMO_EMAILS.filter((e) => e.priority === "urgent").map((e) => ({ id: e.id, text: `Urgent email from ${e.from}` })),
  ];

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile?.full_name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link to="/dashboard" className="flex items-center gap-2 px-1 py-2">
            <img src={logo} alt="Compass" width={32} height={32} className="size-8 shrink-0" />
            <span className="font-display text-lg font-semibold text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
              Compass
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          {[
            { label: "Workspace", items: NAV },
            { label: "Account", items: NAV2 },
          ].map((g) => (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={pathname.startsWith(item.to)} tooltip={item.label}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} tooltip="Sign out">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
          <SidebarTrigger />
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                <Bell className="size-4" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-violet" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b px-4 py-3 text-sm font-semibold">Notifications</div>
              <ul className="max-h-80 overflow-auto">
                {notifications.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">All caught up.</li>}
                {notifications.map((n) => (
                  <li key={n.id} className="border-b px-4 py-2.5 text-sm last:border-0">
                    {n.text}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <Link
            to="/settings"
            className="ml-1 flex size-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground"
            aria-label="Profile"
          >
            {initials}
          </Link>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
