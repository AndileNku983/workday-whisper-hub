import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type EmailAction = "generate" | "rewrite" | "proofread" | "summarise" | "reply" | "prioritise";

const EMAIL_PROMPTS: Record<EmailAction, string> = {
  generate:
    "Write a complete professional email based on the user's brief. Include a subject line on the first line as 'Subject: ...'. Return only the email.",
  rewrite:
    "Rewrite the email to be clearer, more concise and professional while preserving meaning. Match the requested tone if given. Return only the rewritten email.",
  proofread:
    "Proofread the email. First return the corrected email, then a short '### Changes' bullet list of what you fixed.",
  summarise:
    "Summarise the email in 2-4 bullet points, then a line 'Action needed: ...' stating what the recipient must do and by when, if anything.",
  reply:
    "Suggest a professional reply to this email. Return the reply ready to send, without a subject line.",
  prioritise:
    "You are triaging an inbox. For each email listed, output a markdown table with columns: Sender, Subject, Priority (Urgent/High/Normal/Low), Why, Suggested next step. Order by priority.",
};

export const emailAssist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { action: EmailAction; text: string; tone?: string }) => {
    if (!EMAIL_PROMPTS[input.action]) throw new Error("Unknown action");
    if (!input.text?.trim()) throw new Error("Please provide some text.");
    if (input.text.length > 20000) throw new Error("Text is too long.");
    return input;
  })
  .handler(async ({ data }) => {
    const { generateOnce } = await import("@/server/ai.server");
    const tone = data.tone ? `\nDesired tone: ${data.tone}.` : "";
    const text = await generateOnce(
      `You are an expert workplace email assistant. ${EMAIL_PROMPTS[data.action]}${tone}`,
      data.text,
    );
    return { text };
  });

export const planWeek = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("title, priority, status, due_date, assignee")
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);
    if (!tasks?.length) return { text: "You have no open tasks. Add some tasks and I'll plan your week." };
    const { generateOnce } = await import("@/server/ai.server");
    const today = new Date().toISOString().slice(0, 10);
    const text = await generateOnce(
      "You are an AI task planner. Given open tasks (JSON), produce: 1) '### Top 3 priorities today' with one-line reasons, 2) '### Weekly schedule' as a markdown table Day | Focus tasks, spreading work before deadlines, 3) '### Risks' listing anything likely to slip. Be concise.",
      `Today is ${today}. Open tasks:\n${JSON.stringify(tasks)}`,
    );
    return { text };
  });

export const getChatHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("message_id, role, parts")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({ id: m.message_id, role: m.role, parts: m.parts }));
  });

export const clearChatHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.from("chat_messages").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
