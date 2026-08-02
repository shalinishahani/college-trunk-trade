import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Campus Marketplace" },
      { name: "description", content: "Manage your appearance, account and session settings." },
      { property: "og:title", content: "Settings — Campus Marketplace" },
      { property: "og:description", content: "Control theme and account preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Settings</h1>

      <Card className="mt-8 gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Moon className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Appearance</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark mode.</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="mt-4 gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Send a reset link to {user?.email}.</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full" onClick={resetPassword}>
            Send link
          </Button>
        </div>
      </Card>

      <Card className="mt-4 gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogOut className="size-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">End your session on this device.</p>
            </div>
          </div>
          <Button variant="destructive" className="rounded-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
