import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, MessageSquareText, ListChecks, LayoutDashboard, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compass — AI Productivity Assistant for Teams" },
      {
        name: "description",
        content: "Smart email, an AI workplace chatbot and an intelligent task planner in one secure workspace.",
      },
      { property: "og:title", content: "Compass — AI Productivity Assistant for Teams" },
      {
        property: "og:description",
        content: "Smart email, an AI workplace chatbot and an intelligent task planner in one secure workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Mail, title: "Smart Email", text: "Draft, rewrite, proofread and summarise emails. Get reply suggestions and an AI-prioritised inbox." },
  { icon: MessageSquareText, title: "AI Assistant", text: "Ask questions, summarise documents, generate reports and draft professional communications." },
  { icon: ListChecks, title: "Task Planner", text: "Create, prioritise, assign and track tasks with deadlines, reminders and a weekly schedule." },
  { icon: LayoutDashboard, title: "Live Dashboard", text: "Today's tasks, urgent emails, upcoming deadlines and productivity stats at a glance." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-hero text-navy-foreground">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={32} height={32} className="size-8" />
            <span className="font-display text-lg font-semibold">Compass</span>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
        </nav>
        <div className="mx-auto max-w-6xl px-6 pb-28 pt-16 md:pt-24">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 px-3 py-1 text-xs font-medium">
            <ShieldCheck className="size-3.5" /> Built for secure workplace use
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] md:text-6xl">
            Your inbox, assistant and planner — finally in one place.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-navy-foreground/75">
            Compass uses AI to clear email faster, answer questions instantly and plan your week around what matters most.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-violet text-navy-foreground shadow-glow hover:bg-violet/90">
              <Link to="/auth">
                Get started free <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="mx-auto -mt-14 grid max-w-6xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-card">
            <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
              <f.icon className="size-5" />
            </div>
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
