import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id";

export const AI_MODEL = "openai/gpt-6-astra";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export function createGatewayModel(initialRunId?: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");
  const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  return { model: provider.responses(AI_MODEL), runIdFetch };
}

export const responsesOptions = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;

/** One-shot generation: streamed upstream, final text consumed server-side. */
export async function generateOnce(instructions: string, prompt: string) {
  const { model } = createGatewayModel();
  const messages: ModelMessage[] = [{ role: "user", content: prompt }];
  let failure: unknown;
  const result = streamText({
    model,
    instructions,
    messages,
    providerOptions: responsesOptions,
    onError: ({ error }) => {
      failure = error;
    },
  });
  const text = await result.text;
  if (failure) throw toFriendlyError(failure);
  return text;
}

export function toFriendlyError(error: unknown) {
  const status = (error as { statusCode?: number })?.statusCode;
  if (status === 429) return new Error("The AI is busy right now. Please try again in a moment.");
  if (status === 402) return new Error("AI credits are used up for this workspace. Add credits to continue.");
  if (status === 403) return new Error("AI access is blocked for this workspace.");
  return new Error(error instanceof Error ? error.message : "AI request failed.");
}
