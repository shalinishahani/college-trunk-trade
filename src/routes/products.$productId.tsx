import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Heart,
  ImageIcon,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage, resolveImages } from "@/lib/storage";
import { conditionLabel, formatPrice, initials, timeAgo } from "@/lib/marketplace";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$productId")({
  head: () => ({
    meta: [
      { title: "Listing details — Campus Marketplace" },
      {
        name: "description",
        content: "View listing photos, condition, price and seller details on Campus Marketplace.",
      },
      { property: "og:title", content: "Listing details — Campus Marketplace" },
      {
        property: "og:description",
        content: "See photos, price and seller info, then message the student directly.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [gallery, setGallery] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, profiles:seller_id(id, full_name, college, department, year, phone, bio, profile_image)")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const seller = (product as any)?.profiles ?? null;

  useEffect(() => {
    void resolveImages((product as any)?.images ?? []).then(setGallery);
  }, [product]);

  useEffect(() => {
    void resolveImage(seller?.profile_image).then(setAvatar);
  }, [seller?.profile_image]);

  const startChat = async () => {
    if (!user) {
      toast.error("Sign in to message the seller");
      navigate({ to: "/auth" });
      return;
    }
    navigate({ to: "/messages", search: { with: seller?.id, product: productId } });
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: (product as any)?.title, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-2">
        <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed by the seller.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/products">Browse other listings</Link>
        </Button>
      </div>
    );
  }

  const p = product as any;
  const isOwner = user?.id === p.seller_id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Button asChild variant="ghost" className="mb-6 rounded-full">
        <Link to="/products">
          <ArrowLeft className="size-4" /> Back to listings
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="aspect-4/3 overflow-hidden rounded-2xl border bg-muted shadow-soft">
            {gallery[active] ? (
              <img src={gallery[active]} alt={p.title} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <ImageIcon className="size-10" />
              </div>
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={cn(
                    "size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                    i === active ? "border-primary" : "border-transparent opacity-70",
                  )}
                >
                  <img src={src} alt={`${p.title} photo ${i + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="rounded-full">{p.category}</Badge>
            <Badge variant="secondary" className="rounded-full">
              {conditionLabel(p.condition)}
            </Badge>
            {p.status === "sold" ? (
              <Badge variant="destructive" className="rounded-full">
                Sold
              </Badge>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight">{p.title}</h1>
          <p className="mt-2 font-display text-3xl font-bold gradient-text w-fit">
            {formatPrice(p.price)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Listed {timeAgo(p.created_at)}</p>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {p.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isOwner ? (
              <Button asChild className="rounded-full">
                <Link to="/my-listings">Manage listing</Link>
              </Button>
            ) : (
              <Button className="rounded-full" onClick={startChat} disabled={p.status === "sold"}>
                <MessageSquare className="size-4" /> Message seller
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => toggleWishlist(p.id)}
            >
              <Heart className={cn("size-4", wishlistIds.has(p.id) && "fill-destructive text-destructive")} />
              {wishlistIds.has(p.id) ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" className="rounded-full" onClick={share}>
              <Share2 className="size-4" /> Share
            </Button>
          </div>

          <Card className="mt-8 gap-4 p-6">
            <h2 className="font-display text-base font-semibold">Seller</h2>
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border">
                {avatar ? <AvatarImage src={avatar} alt={seller?.full_name ?? "Seller"} /> : null}
                <AvatarFallback>{initials(seller?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{seller?.full_name ?? "Student seller"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[seller?.department, seller?.year, seller?.college].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {seller?.bio ? <p className="text-sm text-muted-foreground">{seller.bio}</p> : null}
            {seller?.phone && user ? (
              <p className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-primary" /> {seller.phone}
              </p>
            ) : null}
            <div className="flex items-center gap-2 rounded-xl bg-accent p-3 text-xs text-accent-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              Meet in a public campus spot and inspect the item before paying.
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {["Verified student account", "No platform fees", "Direct in-app chat"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-3.5 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
