import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Campus Marketplace" },
      { name: "description", content: "Choose a new password for your Campus Marketplace account." },
      { property: "og:title", content: "Reset password — Campus Marketplace" },
      { property: "og:description", content: "Set a new password and get back to trading." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    setReady(isRecovery);
    if (!isRecovery) {
      supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    }
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="hero-surface flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        {ready ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : null} Update password
            </Button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Open this page from the reset link we emailed you to choose a new password.
          </p>
        )}
      </Card>
    </div>
  );
}
