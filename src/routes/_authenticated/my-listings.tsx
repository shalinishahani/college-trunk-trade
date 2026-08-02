import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, ImageIcon, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { conditionLabel, formatPrice, timeAgo } from "@/lib/marketplace";
import { resolveImage } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/my-listings")({
  head: () => ({
    meta: [
      { title: "My listings — Campus Marketplace" },
      { name: "description", content: "Edit, mark as sold or remove the items you're selling." },
      { property: "og:title", content: "My listings — Campus Marketplace" },
      { property: "og:description", content: "Manage everything you have up for sale on campus." },
    ],
  }),
  component: MyListings,
});

function Thumb({ path, alt }: { path?: string | undefined; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    void resolveImage(path).then(setSrc);
  }, [path]);
  return (
    <div className="size-24 shrink-0 overflow-hidden rounded-xl border bg-muted">
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <div className="grid size-full place-items-center text-muted-foreground">
          <ImageIcon className="size-5" />
        </div>
      )}
    </div>
  );
}

function MyListings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["my-listings", user?.id] });

  const markSold = async (id: string, status: string) => {
    const next = status === "sold" ? "available" : "sold";
    const { error } = await supabase.from("products").update({ status: next as never }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next === "sold" ? "Marked as sold" : "Relisted");
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Listing deleted");
    refresh();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">My listings</h1>
        <Button asChild className="rounded-full">
          <Link to="/sell">
            <PlusCircle className="size-4" /> New listing
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {(data ?? []).map((p) => (
          <Card key={p.id} className="flex-row items-center gap-4 p-4">
            <Thumb path={p.images?.[0]} alt={p.title} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/products/$productId"
                  params={{ productId: p.id }}
                  className="truncate font-display font-semibold hover:underline"
                >
                  {p.title}
                </Link>
                <Badge variant={p.status === "sold" ? "destructive" : "secondary"} className="rounded-full">
                  {p.status === "sold" ? "Sold" : "Available"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatPrice(Number(p.price))} · {p.category} · {conditionLabel(p.condition)} ·{" "}
                {timeAgo(p.created_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => markSold(p.id, p.status)}
              >
                <CheckCircle2 className="size-4" />
                {p.status === "sold" ? "Relist" : "Mark sold"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Delete listing">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes “{p.title}” and its photos from the marketplace.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove(p.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        ))}
        {!isLoading && (data ?? []).length === 0 ? (
          <Card className="items-center gap-3 p-16 text-center">
            <h2 className="font-display text-lg font-semibold">You haven't listed anything yet</h2>
            <p className="text-sm text-muted-foreground">
              Turn last semester's textbooks into this semester's coffee money.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/sell">Create your first listing</Link>
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
