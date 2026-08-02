import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Package, ShieldAlert, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice, timeAgo } from "@/lib/marketplace";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Campus Marketplace" },
      { name: "description", content: "Moderate listings, review reports and monitor marketplace activity." },
      { property: "og:title", content: "Admin panel — Campus Marketplace" },
      { property: "og:description", content: "Marketplace moderation and analytics." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin-data"],
    enabled: isAdmin,
    queryFn: async () => {
      const [products, profiles, reports] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      return {
        products: products.data ?? [],
        profiles: profiles.data ?? [],
        reports: reports.data ?? [],
      };
    },
  });

  if (loading) return <div className="p-16 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view the moderation tools.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Listing removed");
    void qc.invalidateQueries({ queryKey: ["admin-data"] });
  };

  const products = data?.products ?? [];
  const stats = [
    { label: "Total users", value: data?.profiles.length ?? 0, icon: Users },
    { label: "Total listings", value: products.length, icon: Package },
    { label: "Sold items", value: products.filter((p) => p.status === "sold").length, icon: Ban },
    { label: "Open reports", value: data?.reports.length ?? 0, icon: ShieldAlert },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Admin panel</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="gap-2 p-6">
            <Icon className="size-5 text-muted-foreground" />
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="products" className="mt-10">
        <TabsList className="rounded-full">
          <TabsTrigger value="products" className="rounded-full">
            Listings
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-full">
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-full">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="mt-6 overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[240px] truncate font-medium">
                      <Link to="/products/$productId" params={{ productId: p.id }} className="hover:underline">
                        {p.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatPrice(Number(p.price))}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "sold" ? "destructive" : "secondary"} className="rounded-full">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(p.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove listing"
                        onClick={() => removeProduct(p.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="mt-6 overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.profiles ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell>{u.college ?? "—"}</TableCell>
                    <TableCell>{u.department ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(u.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="mt-6 overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.reports ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[420px]">{r.reason}</TableCell>
                    <TableCell>
                      {r.product_id ? (
                        <Link
                          to="/products/$productId"
                          params={{ productId: r.product_id }}
                          className="text-primary hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{timeAgo(r.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(data?.reports ?? []).length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">No reports to review.</p>
            ) : null}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
