import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, HandCoins, Leaf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CampusXchange" },
      {
        name: "description",
        content:
          "Why CampusXchange exists: an affordable, sustainable, student-only way to trade what you need on campus.",
      },
      { property: "og:title", content: "About — CampusXchange" },
      {
        property: "og:description",
        content: "A student-only marketplace built around affordability, trust and sustainability.",
      },
    ],
  }),
  component: About,
});

const VALUES = [
  { icon: HandCoins, title: "Affordable by default", body: "No fees, no commission — students keep every rupee of the sale." },
  { icon: Users, title: "Campus trust", body: "Everyone is a verified student, so deals happen between neighbours." },
  { icon: Leaf, title: "Less waste", body: "Textbooks, cycles and kettles get a second life instead of the bin." },
  { icon: GraduationCap, title: "Built for student life", body: "Categories, timings and meet-up spots that match campus reality." },
];

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-extrabold">
        A marketplace that <span className="gradient-text">lives on campus</span>
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Every semester students throw away or overpay for things another student a hostel block away
        already has. CampusXchange closes that gap — a simple place to list what you no longer
        need and find what you do, without shipping, fees or strangers.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="gap-3 p-7">
            <span className="gradient-brand grid size-11 place-items-center rounded-2xl text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <h2 className="font-display text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-12 items-center gap-4 p-10 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to join your campus store?</h2>
        <Button asChild className="rounded-full px-8">
          <Link to="/auth" search={{ mode: "register" }}>
            Create your free account
          </Link>
        </Button>
      </Card>
    </div>
  );
}
