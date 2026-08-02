import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageSquare, Package, PlusCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Campus Marketplace" },
      { name: "description", content: "Track your listings, wishlist, messages and campus activity." },
      { property: "og:title", content: "Dashboard — Campus Marketplace" },
      { property: "og:description", content: "Your listings, saved items and messages in one place." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const [listings, wishlist, unread] = await Promise.all([
        supabase.from("products").select("id, price, status").eq("seller_id", user!.id),
        supabase.from("wishlists").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("receiver_id", user!.id)
          .eq("read", false),
      ]);
      const rows = listings.data ?? [];
      return {
        active: rows.filter((r) => r.status === "available").length,
        sold: rows.filter((r) => r.status === "sold").length,
        earned: rows.filter((r) => r.status === "sold").reduce((a, r) => a + Number(r.price), 0),
        saved: wishlist.count ?? 0,
        unread: unread.count ?? 0,
      };
    },
  });

  const stats = [
    { label: "Active listings", value: data?.active ?? 0, icon: Package },
    { label: "Items sold", value: data?.sold ?? 0, icon: Wallet },
    { label: "Saved items", value: data?.saved ?? 0, icon: Heart },
    { label: "Unread messages", value: data?.unread ?? 0, icon: MessageSquare },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            Hey {profile?.full_name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.sold ? `You've earned ${formatPrice(data.earned)} so far.` : "Here's what's happening with your campus store."}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/sell">
            <PlusCircle className="size-4" /> New listing
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-2 p-6">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="size-5" />
            </span>
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { to: "/my-listings", title: "Manage listings", body: "Edit, mark as sold or delete items." },
          { to: "/messages", title: "Messages", body: "Reply to buyers and close the deal." },
          { to: "/profile", title: "Profile", body: "Keep your department and contact info current." },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="card-hover h-full gap-2 p-6">
              <h2 className="font-display text-base font-semibold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
