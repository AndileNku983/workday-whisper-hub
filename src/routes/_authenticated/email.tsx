import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Wand2, SpellCheck, FileText, Reply, PenLine, ListOrdered } from "lucide-react";
import { PageHeader, PriorityBadge } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiOutput } from "@/components/ai-output";
import { emailAssist, type EmailAction } from "@/lib/ai.functions";
import { DEMO_EMAILS, sortEmailsByPriority, type DemoEmail } from "@/lib/demo-emails";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({
    meta: [
      { title: "Smart Email — Compass" },
      { name: "description", content: "Generate, rewrite, proofread and summarise emails with AI." },
      { property: "og:title", content: "Smart Email — Compass" },
      { property: "og:description", content: "Generate, rewrite, proofread and summarise emails with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

function useAssist() {
  const call = useServerFn(emailAssist);
  const [out, setOut] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function run(action: EmailAction, text: string, tone?: string) {
    setLoading(true);
    setOut(null);
    try {
      const r = await call({ data: { action, text, tone } });
      setOut(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI request failed");
    } finally {
      setLoading(false);
    }
  }
  return { out, loading, run };
}

function EmailPage() {
  const [sorted, setSorted] = useState(false);
  const emails = sorted ? sortEmailsByPriority(DEMO_EMAILS) : DEMO_EMAILS;
  const [selected, setSelected] = useState<DemoEmail>(DEMO_EMAILS[0]);
  const inbox = useAssist();
  const triage = useAssist();

  const composer = useAssist();
  const [draft, setDraft] = useState("");
  const [tone, setTone] = useState("professional");

  const emailText = (e: DemoEmail) => `From: ${e.from} <${e.fromEmail}>\nSubject: ${e.subject}\n\n${e.body}`;

  return (
    <div>
      <PageHeader title="Smart Email" subtitle="Demo inbox — connect Gmail or Outlook from Integrations." />
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="compose">Compose & edit</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-2xl border bg-card shadow-card">
              <div className="flex items-center justify-between border-b p-3">
                <span className="text-sm font-semibold">{DEMO_EMAILS.length} messages</span>
                <div className="flex gap-1">
                  <Button size="xs" variant={sorted ? "default" : "outline"} onClick={() => setSorted((s) => !s)}>
                    <ListOrdered className="size-3" /> By priority
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={triage.loading}
                    onClick={() => triage.run("prioritise", DEMO_EMAILS.map(emailText).join("\n\n---\n\n"))}
                  >
                    <Wand2 className="size-3" /> AI triage
                  </Button>
                </div>
              </div>
              <ul className="max-h-[560px] divide-y overflow-auto">
                {emails.map((e) => (
                  <li key={e.id}>
                    <button
                      className={`w-full p-3 text-left transition-colors hover:bg-muted/60 ${selected.id === e.id ? "bg-violet-soft/60" : ""}`}
                      onClick={() => setSelected(e)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-sm ${e.unread ? "font-semibold" : ""}`}>{e.from}</span>
                        <PriorityBadge value={e.priority} />
                      </div>
                      <p className="truncate text-sm">{e.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(e.receivedAt), { addSuffix: true })} · {e.preview}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {(triage.loading || triage.out) && (
                <div className="rounded-2xl border bg-card p-5 shadow-card">
                  <h3 className="mb-3 font-semibold">AI inbox triage</h3>
                  <AiOutput text={triage.out} loading={triage.loading} label="Triaging your inbox…" />
                </div>
              )}
              <article className="rounded-2xl border bg-card p-5 shadow-card">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.subject}</h2>
                    <p className="text-sm text-muted-foreground">{selected.from} &lt;{selected.fromEmail}&gt;</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{selected.label}</span>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed">{selected.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={inbox.loading} onClick={() => inbox.run("summarise", emailText(selected))}>
                    <FileText className="size-4" /> Summarise
                  </Button>
                  <Button size="sm" disabled={inbox.loading} onClick={() => inbox.run("reply", emailText(selected))}>
                    <Reply className="size-4" /> Suggest reply
                  </Button>
                </div>
                <div className="mt-4">
                  <AiOutput text={inbox.out} loading={inbox.loading} />
                </div>
              </article>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compose" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Your draft or brief</h3>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["professional", "friendly", "formal", "concise", "persuasive"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                rows={12}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Ask the finance team to approve the new laptop budget by Friday… or paste an email to improve."
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={composer.loading} onClick={() => composer.run("generate", draft, tone)}>
                  <PenLine className="size-4" /> Generate email
                </Button>
                <Button size="sm" variant="outline" disabled={composer.loading} onClick={() => composer.run("rewrite", draft, tone)}>
                  <Wand2 className="size-4" /> Rewrite
                </Button>
                <Button size="sm" variant="outline" disabled={composer.loading} onClick={() => composer.run("proofread", draft)}>
                  <SpellCheck className="size-4" /> Proofread
                </Button>
                <Button size="sm" variant="outline" disabled={composer.loading} onClick={() => composer.run("summarise", draft)}>
                  <FileText className="size-4" /> Summarise
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-5 shadow-card">
              <h3 className="mb-3 font-semibold">AI result</h3>
              {!composer.out && !composer.loading && (
                <p className="text-sm text-muted-foreground">Results appear here.</p>
              )}
              <AiOutput text={composer.out} loading={composer.loading} label="Writing…" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
