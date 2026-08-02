import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bike,
  Laptop,
  MessageSquare,
  Search,
  ShieldCheck,
  Smartphone,
  Sofa,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, ProductCardSkeleton, type ProductListItem } from "@/components/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import heroImage from "@/assets/hero-campus.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Marketplace — Buy, Sell & Exchange on Campus" },
      {
        name: "description",
        content:
          "A student-only marketplace to buy and sell books, laptops, cycles and hostel essentials safely within your college community.",
      },
      { property: "og:title", content: "Campus Marketplace — Buy, Sell & Exchange on Campus" },
      {
        property: "og:description",
        content:
          "Buy and sell books, laptops, cycles and hostel essentials with verified students from your college.",
      },
    ],
  }),
  component: Home,
});

const CATEGORY_TILES = [
  { name: "Books", icon: BookOpen },
  { name: "Laptops", icon: Laptop },
  { name: "Mobile Phones", icon: Smartphone },
  { name: "Bicycles", icon: Bike },
  { name: "Furniture", icon: Sofa },
  { name: "Electronics", icon: Sparkles },
];

const STEPS = [
  {
    icon: Search,
    title: "Discover nearby deals",
    body: "Filter by category, price and condition to find exactly what your semester needs.",
  },
  {
    icon: MessageSquare,
    title: "Chat with the seller",
    body: "Message students directly, ask questions and agree on a campus meet-up point.",
  },
  {
    icon: Wallet,
    title: "Swap and save",
    body: "No shipping, no middlemen. Hand it over between lectures and keep the money on campus.",
  },
];

function Home() {
  const { wishlistIds, toggleWishlist } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ["home-latest-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, profiles:seller_id(full_name, college)")
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as ProductListItem[];
    },
  });

  return (
    <>
      <section className="hero-surface relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold">
              <BadgeCheck className="size-4 text-primary" /> Students only · verified campus community
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Everything you need,<br />
              <span className="gradient-text">from students next door.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Buy, sell and exchange textbooks, laptops, cycles and hostel essentials with people
              on your own campus — fast, fair and free to list.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/products">
                  Browse listings <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/sell">Start selling</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {[
                ["Free", "to list items"],
                ["0%", "commission"],
                ["1 campus", "one community"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-bold">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border shadow-lift">
              <img
                src={heroImage}
                alt="Students exchanging books, a laptop and a bicycle on campus"
                width={1600}
                height={1100}
                className="size-full object-cover"
              />
            </div>
            <Card className="glass absolute -bottom-6 left-6 hidden w-56 gap-1 p-4 shadow-soft sm:block">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-primary" /> Safe meet-ups
              </div>
              <p className="text-xs text-muted-foreground">
                Deal face to face in library, canteen or hostel gate.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_TILES.map(({ name, icon: Icon }) => (
            <Link key={name} to="/products" search={{ category: name }}>
              <Card className="card-hover items-center gap-3 p-6 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="text-sm font-semibold">{name}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Fresh on campus</h2>
            <p className="mt-1 text-sm text-muted-foreground">The newest listings from your peers.</p>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/products">
              See all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <Card className="mt-6 items-center gap-3 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No listings yet — be the first student to post one.
            </p>
            <Button asChild className="rounded-full">
              <Link to="/sell">Create a listing</Link>
            </Button>
          </Card>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="font-display text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <Card key={title} className="gap-3 p-8">
              <span className="gradient-brand grid size-11 place-items-center rounded-2xl text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="font-display text-lg font-semibold">
                {i + 1}. {title}
              </h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <Card className="gradient-brand items-center gap-4 border-0 p-12 text-center text-primary-foreground shadow-lift">
          <h2 className="font-display text-3xl font-extrabold">Got something gathering dust?</h2>
          <p className="max-w-xl text-sm opacity-90">
            List it in under a minute and reach students who actually need it this semester.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-8">
            <Link to="/sell">Post your first listing</Link>
          </Button>
        </Card>
      </section>
    </>
  );
}
