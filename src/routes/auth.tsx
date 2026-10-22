import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Compass" },
      { name: "description", content: "Sign in or create your Compass productivity workspace." },
      { property: "og:title", content: "Sign in — Compass" },
      { property: "og:description", content: "Sign in or create your Compass productivity workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-hero p-12 text-navy-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" width={32} height={32} className="size-8" />
          <span className="font-display text-lg font-semibold">Compass</span>
        </Link>
        <blockquote className="max-w-md text-2xl font-display leading-snug">
          “I cleared a 60-email backlog before my first coffee. Compass is now how my team starts every day.”
          <footer className="mt-4 text-sm font-sans text-navy-foreground/70">— Operations Manager, demo customer</footer>
        </blockquote>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your workspace" : "Reset your password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin" ? "Sign in to continue to Compass." : mode === "signup" ? "Start with demo data — ready in seconds." : "We'll email you a secure link."}
            </p>
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button type="button" className="text-xs text-violet hover:underline" onClick={() => setMode("forgot")}>
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          {notice && <p className="rounded-lg bg-violet-soft p-3 text-sm text-accent-foreground">{notice}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>No account? <button type="button" className="font-medium text-violet hover:underline" onClick={() => setMode("signup")}>Sign up</button></>
            ) : (
              <>Have an account? <button type="button" className="font-medium text-violet hover:underline" onClick={() => setMode("signin")}>Sign in</button></>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
