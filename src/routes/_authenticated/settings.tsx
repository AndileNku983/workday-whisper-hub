import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Compass" },
      { name: "description", content: "Compass settings" },
      { property: "og:title", content: "Settings — Compass" },
      { property: "og:description", content: "Compass settings" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageHeader title="Settings" subtitle="This section is coming next." />,
});
