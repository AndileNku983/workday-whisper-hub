import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Compass" },
      { name: "description", content: "Compass integrations" },
      { property: "og:title", content: "Integrations — Compass" },
      { property: "og:description", content: "Compass integrations" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageHeader title="Integrations" subtitle="This section is coming next." />,
});
