import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { ProductCard, ProductCardSkeleton, type ProductListItem } from "@/components/ProductCard";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Campus Marketplace" },
      { name: "description", content: "Every listing you've saved for later, in one place." },
      { property: "og:title", content: "Wishlist — Campus Marketplace" },
      { property: "og:description", content: "Keep an eye on the campus deals you care about." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist-products", user?.id, wishlistIds.size],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlists")
        .select("product:product_id(*, profiles:seller_id(full_name, college))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? [])
        .map((row) => (row as any).product)
        .filter(Boolean) as ProductListItem[];
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Your wishlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">Saved listings from across campus.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : (data ?? []).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlisted={wishlistIds.has(product.id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
      </div>

      {!isLoading && (data ?? []).length === 0 ? (
        <Card className="mt-8 items-center gap-3 p-16 text-center">
          <h2 className="font-display text-lg font-semibold">Nothing saved yet</h2>
          <p className="text-sm text-muted-foreground">
            Tap the heart on any listing to keep track of it here.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/products">Browse listings</Link>
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
