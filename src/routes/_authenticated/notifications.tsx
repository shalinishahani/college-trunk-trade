import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — CampusXchange" },
      { name: "description", content: "Updates on your messages, wishlist activity and listings." },
      { property: "og:title", content: "Notifications — CampusXchange" },
      { property: "og:description", content: "Never miss a buyer message or wishlist alert." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const markAllRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
    void qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">Notifications</h1>
        <Button variant="outline" className="rounded-full" onClick={markAllRead}>
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {(data ?? []).map((n) => (
          <Card key={n.id} className={cn("gap-1 p-5", !n.is_read && "border-primary/40 bg-accent/40")}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{n.title}</h2>
              <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            {n.link ? (
              <Link to={n.link} className="mt-1 text-sm font-medium text-primary hover:underline">
                View
              </Link>
            ) : null}
          </Card>
        ))}
        {(data ?? []).length === 0 ? (
          <Card className="items-center gap-3 p-16 text-center">
            <Bell className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
