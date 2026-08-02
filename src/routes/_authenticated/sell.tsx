import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/storage";
import { CATEGORIES, CONDITIONS } from "@/lib/marketplace";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/sell")({
  head: () => ({
    meta: [
      { title: "Sell an item — Campus Marketplace" },
      {
        name: "description",
        content: "List your books, gadgets or hostel gear for other students in minutes.",
      },
      { property: "og:title", content: "Sell an item — Campus Marketplace" },
      { property: "og:description", content: "Create a free student listing in under a minute." },
    ],
  }),
  component: SellPage,
});

type Preview = { file: File; url: string };

function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<Preview[]>([]);
  const [category, setCategory] = useState<string>("Books");
  const [condition, setCondition] = useState<string>("good");
  const [saving, setSaving] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list)
      .filter((f) => f.type.startsWith("image/") && f.size < 5 * 1024 * 1024)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setFiles((prev) => [...prev, ...next].slice(0, 6));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title")).trim();
    const description = String(form.get("description")).trim();
    const price = Number(form.get("price"));

    if (!title || title.length > 120) return toast.error("Add a title under 120 characters");
    if (!description) return toast.error("Add a short description");
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid price");
    if (files.length === 0) return toast.error("Add at least one photo");

    setSaving(true);
    try {
      const images: string[] = [];
      for (const f of files) images.push(await uploadImage(f.file, user.id));

      const { data, error } = await supabase
        .from("products")
        .insert({
          seller_id: user.id,
          title,
          description,
          price,
          category,
          condition: condition as never,
          images,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Listing published!");
      navigate({ to: "/products/$productId", params: { productId: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish listing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Sell an item</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clear photos and an honest description sell fastest.
      </p>

      <Card className="mt-8 p-8">
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" maxLength={120} required placeholder="e.g. Engineering Maths textbook (3rd sem)" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input id="price" name="price" type="number" min={0} step={1} required />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              maxLength={2000}
              required
              placeholder="Mention age, condition details, what's included and where you can meet."
            />
          </div>

          <div className="space-y-3">
            <Label>Photos (up to 6)</Label>
            <div className="flex flex-wrap gap-3">
              {files.map((f, i) => (
                <div key={f.url} className="relative size-24 overflow-hidden rounded-xl border">
                  <img src={f.url} alt={`Upload ${i + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {files.length < 6 ? (
                <label className="grid size-24 cursor-pointer place-items-center rounded-xl border border-dashed text-muted-foreground hover:bg-accent">
                  <ImagePlus className="size-6" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                </label>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB each.</p>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-full" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null} Publish listing
          </Button>
        </form>
      </Card>
    </div>
  );
}
