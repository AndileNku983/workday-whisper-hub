import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Compass" },
      { name: "description", content: "Compass tasks" },
      { property: "og:title", content: "Tasks — Compass" },
      { property: "og:description", content: "Compass tasks" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageHeader title="Tasks" subtitle="This section is coming next." />,
});
