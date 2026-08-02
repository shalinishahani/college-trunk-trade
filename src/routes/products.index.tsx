import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardSkeleton, type ProductListItem } from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { CATEGORIES, CONDITIONS } from "@/lib/marketplace";

type ProductSearch = {
  q?: string;
  category?: string;
  condition?: string;
  min?: number;
  max?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
    category: typeof search['category'] === "string" ? search['category'] : undefined,
    condition: typeof search['condition'] === "string" ? search['condition'] : undefined,
    min: Number.isFinite(Number(search['min'])) && search['min'] !== undefined ? Number(search['min']) : undefined,
    max: Number.isFinite(Number(search['max'])) && search['max'] !== undefined ? Number(search['max']) : undefined,
    sort:
      search['sort'] === "price_asc" || search['sort'] === "price_desc" ? search['sort'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Listings — Campus Marketplace" },
      {
        name: "description",
        content:
          "Search and filter student listings by category, price and condition — books, laptops, cycles and more.",
      },
      { property: "og:title", content: "Browse Listings — Campus Marketplace" },
      {
        property: "og:description",
        content: "Find affordable second-hand student essentials on your campus.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [showFilters, setShowFilters] = useState(false);
  const [term, setTerm] = useState(search.q ?? "");

  const setSearch = (patch: Partial<ProductSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const { data, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, profiles:seller_id(full_name, college)")
        .eq("status", "available");

      if (search.q) query = query.or(`title.ilike.%${search.q}%,description.ilike.%${search.q}%`);
      if (search.category) query = query.eq("category", search.category);
      if (search.condition) query = query.eq("condition", search.condition);
      if (search.min !== undefined) query = query.gte("price", search.min);
      if (search.max !== undefined) query = query.lte("price", search.max);

      if (search.sort === "price_asc") query = query.order("price", { ascending: true });
      else if (search.sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query.limit(60);
      if (error) throw error;
      return (data ?? []) as unknown as ProductListItem[];
    },
  });

  const activeFilters = [search.category, search.condition].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Browse listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading listings…" : `${data?.length ?? 0} items available on campus`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={search.sort ?? "newest"}
            onValueChange={(v) => setSearch({ sort: v === "newest" ? undefined : (v as ProductSearch["sort"]) })}
          >
            <SelectTrigger className="w-44 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-full lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
          >
            <SlidersHorizontal className="size-4" /> Filters
            {activeFilters ? <Badge className="ml-1 rounded-full">{activeFilters}</Badge> : null}
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={showFilters ? "block" : "hidden lg:block"}>
          <Card className="gap-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="filter-q">Search</Label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSearch({ q: term || undefined });
                }}
              >
                <Input
                  id="filter-q"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Keywords…"
                />
              </form>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={search.category ?? "all"}
                onValueChange={(v) => setSearch({ category: v === "all" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={search.condition ?? "all"}
                onValueChange={(v) => setSearch({ condition: v === "all" ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any condition</SelectItem>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="Min"
                  defaultValue={search.min}
                  onBlur={(e) => setSearch({ min: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="Max"
                  defaultValue={search.max}
                  onBlur={(e) => setSearch({ max: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <Button
              variant="ghost"
              className="rounded-full"
              onClick={() => {
                setTerm("");
                navigate({ search: {} });
              }}
            >
              <X className="size-4" /> Clear filters
            </Button>
          </Card>
        </aside>

        <section>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
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
            <Card className="items-center gap-2 p-16 text-center">
              <h2 className="font-display text-lg font-semibold">No listings match your filters</h2>
              <p className="text-sm text-muted-foreground">
                Try widening the price range or clearing the category filter.
              </p>
            </Card>
          ) : null}
        </section>
      </div>
    </div>
  );
}
