import { Copy } from "lucide-react";
import { toast } from "sonner";
import { MessageResponse } from "@/components/ai-elements/message";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

export function AiOutput({ text, loading, label = "Thinking…" }: { text: string | null; loading: boolean; label?: string }) {
  if (loading) return <Shimmer className="text-sm">{label}</Shimmer>;
  if (!text) return null;
  return (
    <div className="relative rounded-xl border bg-muted/40 p-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="absolute right-2 top-2"
        aria-label="Copy"
        onClick={() => {
          navigator.clipboard.writeText(text);
          toast.success("Copied");
        }}
      >
        <Copy className="size-4" />
      </Button>
      <div className="pr-8 text-sm">
        <MessageResponse>{text}</MessageResponse>
      </div>
    </div>
  );
}
