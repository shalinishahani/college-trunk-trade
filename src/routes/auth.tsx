import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search['mode'] === "register" ? ("register" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Campus Marketplace" },
      {
        name: "description",
        content: "Create your student account or sign in to buy and sell on Campus Marketplace.",
      },
      { property: "og:title", content: "Sign in — Campus Marketplace" },
      { property: "og:description", content: "Join your campus marketplace in seconds." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"login" | "register">(mode);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: String(form.get("full_name")),
          college: String(form.get("college")),
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setSent(true);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="hero-surface flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8 shadow-lift">
        <div className="flex flex-col items-center text-center">
          <span className="gradient-brand grid size-12 place-items-center rounded-2xl text-primary-foreground">
            <Package className="size-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold">Campus Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buy and sell with students from your college.
          </p>
        </div>

        {sent ? (
          <div className="mt-8 space-y-4 text-center">
            <Mail className="mx-auto size-10 text-primary" />
            <h2 className="font-display text-lg font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent you a confirmation link. Verify your email to activate your account, then sign in.
            </p>
            <Button variant="outline" className="rounded-full" onClick={() => setSent(false)}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="mt-8 w-full rounded-full"
              onClick={handleGoogle}
            >
              <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
                />
                <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
                <path
                  fill="#EA4335"
                  d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 rounded-full">
                <TabsTrigger value="login" className="rounded-full">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-full">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">College email</Label>
                    <Input id="login-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : null} Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full name</Label>
                    <Input id="reg-name" name="full_name" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-college">College</Label>
                    <Input id="reg-college" name="college" required maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">College email</Label>
                    <Input id="reg-email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : null} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
