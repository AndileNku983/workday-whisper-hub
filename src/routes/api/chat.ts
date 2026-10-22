import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import type { Database, Json } from "@/integrations/supabase/types";
import { createGatewayModel, responsesOptions } from "@/server/ai.server";
import { getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "@/server/run-id";

const INSTRUCTIONS = `You are Compass, a professional workplace productivity assistant.
You help employees and managers: answer questions, summarise documents the user pastes, generate structured reports, and draft clear professional communications (emails, memos, announcements, meeting notes).
Be concise and practical. Use markdown headings, bullet lists and tables where they help. When drafting communications, give a ready-to-send version first, then optional tweaks.`;

function userClient(token: string) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${token}` },
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });
        const supabase = userClient(token);
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) return new Response("No messages", { status: 400 });

        const { data: profile } = await supabase
          .from("profiles")
          .select("save_chat_history")
          .eq("id", userId)
          .maybeSingle();
        const persist = profile?.save_chat_history !== false;

        const last = messages[messages.length - 1];
        if (persist && last.role === "user") {
          const { error } = await supabase.from("chat_messages").upsert(
            { user_id: userId, message_id: last.id, role: "user", parts: last.parts as unknown as Json },
            { onConflict: "user_id,message_id" },
          );
          if (error) console.error("save user message failed", error);
        }

        const { model, runIdFetch } = createGatewayModel(getLovableAiGatewayRunId(request));
        const result = streamText({
          model,
          instructions: INSTRUCTIONS,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: responsesOptions,
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onError: (error) => {
            const status = (error as { statusCode?: number })?.statusCode;
            if (status === 429) return "Rate limited — please try again shortly.";
            if (status === 402) return "AI credits exhausted for this workspace.";
            return "The assistant couldn't respond. Please try again.";
          },
          onFinish: async ({ responseMessage }) => {
            if (!persist) return;
            const { error } = await supabase.from("chat_messages").upsert(
              {
                user_id: userId,
                message_id: responseMessage.id,
                role: "assistant",
                parts: responseMessage.parts as unknown as Json,
              },
              { onConflict: "user_id,message_id" },
            );
            if (error) console.error("save assistant message failed", error);
          },
        });
        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
