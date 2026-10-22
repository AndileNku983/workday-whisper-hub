import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Compass" },
      { name: "description", content: "Compass chat" },
      { property: "og:title", content: "Chat — Compass" },
      { property: "og:description", content: "Compass chat" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PageHeader title="Chat" subtitle="This section is coming next." />,
});
