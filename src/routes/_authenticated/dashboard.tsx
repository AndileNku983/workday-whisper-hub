import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isToday, addDays, startOfDay } from "date-fns";
import { CheckCircle2, AlertTriangle, Clock, Mail, ArrowRight, TrendingUp } from "lucide-react";
import { PageHeader, PriorityBadge } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { profileQuery, tasksQuery } from "@/lib/queries";
import { isOverdue, sortTasks, taskStats } from "@/lib/tasks";
import { DEMO_EMAILS, sortEmailsByPriority } from "@/lib/demo-emails";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Compass" },
      { name: "description", content: "Your daily tasks, urgent emails and productivity at a glance." },
      { property: "og:title", content: "Dashboard — Compass" },
      { property: "og:description", content: "Your daily tasks, urgent emails and productivity at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tasksQuery),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Clock; label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className={`mb-3 flex size-9 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="size-4" />
      </div>
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Dashboard() {
  const { data: tasks } = useSuspenseQuery(tasksQuery);
  const { data: profile } = useQuery(profileQuery);
  const stats = taskStats(tasks);
  const today = sortTasks(tasks).filter((t) => t.status !== "done" && (isOverdue(t) || (t.due_date && isToday(new Date(t.due_date)))));
  const upcoming = sortTasks(tasks)
    .filter((t) => t.status !== "done" && t.due_date && new Date(t.due_date) > new Date())
    .slice(0, 5);
  const urgentEmails = sortEmailsByPriority(DEMO_EMAILS).filter((e) => e.priority === "urgent" || e.priority === "high");

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfDay(new Date()), i);
    const count = tasks.filter((t) => t.due_date && startOfDay(new Date(t.due_date)).getTime() === day.getTime()).length;
    return { day, count };
  });
  const max = Math.max(1, ...week.map((w) => w.count));

  return (
    <div>
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${profile?.full_name?.split(" ")[0] ?? "there"}`}
        subtitle={format(new Date(), "EEEE, d MMMM yyyy")}
        actions={
          <Button asChild>
            <Link to="/chat">Ask the assistant</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={TrendingUp} label="Completion rate" value={`${stats.completion}%`} tone="bg-violet-soft text-violet" />
        <Stat icon={Clock} label="Open tasks" value={stats.open} tone="bg-secondary text-secondary-foreground" />
        <Stat icon={AlertTriangle} label="Overdue" value={stats.overdue} tone="bg-destructive/12 text-destructive" />
        <Stat icon={Mail} label="Unread emails" value={DEMO_EMAILS.filter((e) => e.unread).length} tone="bg-success/15 text-success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Today's focus</h2>
            <Link to="/tasks" className="text-sm text-violet hover:underline">All tasks</Link>
          </div>
          {today.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing due today. Nice work.</p>
          ) : (
            <ul className="divide-y">
              {today.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.title}</p>
                    <p className={`text-xs ${isOverdue(t) ? "text-destructive" : "text-muted-foreground"}`}>
                      {isOverdue(t) ? "Overdue · " : "Due "}
                      {t.due_date && formatDistanceToNow(new Date(t.due_date), { addSuffix: true })}
                    </p>
                  </div>
                  <PriorityBadge value={t.priority} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-semibold">Workload — next 7 days</h2>
          <div className="flex h-36 items-end gap-2">
            {week.map((w) => (
              <div key={w.day.toISOString()} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-md bg-gradient-brand" style={{ height: `${(w.count / max) * 100}%`, minHeight: w.count ? 8 : 2 }} />
                <span className="text-[11px] text-muted-foreground">{format(w.day, "EEEEE")}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{stats.dueSoon} task(s) due in the next 48 hours.</p>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Priority inbox</h2>
            <Link to="/email" className="text-sm text-violet hover:underline">Open Smart Email</Link>
          </div>
          <ul className="divide-y">
            {urgentEmails.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{e.from} · {e.preview}</p>
                </div>
                <PriorityBadge value={e.priority} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-semibold">Upcoming deadlines</h2>
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 text-violet" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.due_date && format(new Date(t.due_date), "EEE d MMM, HH:mm")}</p>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="ghost" size="sm" className="mt-3 px-0 text-violet">
            <Link to="/tasks">Plan my week <ArrowRight className="size-4" /></Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
