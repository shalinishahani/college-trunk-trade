import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { conditionLabel, formatPrice, timeAgo } from "@/lib/marketplace";
import { resolveImage } from "@/lib/storage";
import { cn } from "@/lib/utils";

export type ProductListItem = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  created_at: string;
  seller_id: string;
  profiles?: { full_name: string | null; college: string | null } | null;
};

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  );
}

export function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
}: {
  product: ProductListItem;
  wishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    void resolveImage(product.images?.[0]).then(setImage);
  }, [product.images]);

  return (
    <Card className="card-hover group overflow-hidden p-0 shadow-soft">
      <Link to="/products/$productId" params={{ productId: product.id }} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={product.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge className="rounded-full border-0 bg-background/85 text-foreground backdrop-blur">
              {product.category}
            </Badge>
            {product.status === "sold" ? (
              <Badge variant="destructive" className="rounded-full">
                Sold
              </Badge>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/products/$productId" params={{ productId: product.id }} className="min-w-0">
            <h3 className="truncate font-display text-base font-semibold">{product.title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {product.profiles?.full_name || "Student seller"}
              {product.profiles?.college ? ` · ${product.profiles.college}` : ""}
            </p>
          </Link>
          {onToggleWishlist ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => onToggleWishlist(product.id)}
              className="shrink-0"
            >
              <Heart className={cn("size-5", wishlisted && "fill-destructive text-destructive")} />
            </Button>
          ) : null}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(product.created_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {conditionLabel(product.condition)}
          </Badge>
          <Button asChild variant="outline" size="sm" className="ml-auto rounded-full">
            <Link to="/products/$productId" params={{ productId: product.id }}>
              View details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
