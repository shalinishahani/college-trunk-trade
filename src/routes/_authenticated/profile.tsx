import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/marketplace";
import { resolveImage, uploadImage } from "@/lib/storage";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Campus Marketplace" },
      { name: "description", content: "Update your name, department, year, college and contact details." },
      { property: "og:title", content: "Your profile — Campus Marketplace" },
      { property: "og:description", content: "A complete profile helps buyers trust your listings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void resolveImage(profile?.profile_image).then(setAvatar);
  }, [profile?.profile_image]);

  const onAvatar = async (file?: File) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, user.id);
      const { error } = await supabase.from("profiles").update({ profile_image: path }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: String(form.get("full_name")).trim().slice(0, 100),
        department: String(form.get("department")).trim().slice(0, 100) || null,
        year: String(form.get("year")).trim().slice(0, 30) || null,
        college: String(form.get("college")).trim().slice(0, 120) || null,
        phone: String(form.get("phone")).trim().slice(0, 20) || null,
        bio: String(form.get("bio")).trim().slice(0, 500) || null,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile saved");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-extrabold">Your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Buyers see this information on your listings.
      </p>

      <Card className="mt-8 p-8">
        <div className="flex items-center gap-5">
          <Avatar className="size-20 border">
            {avatar ? <AvatarImage src={avatar} alt={profile?.full_name ?? "Profile"} /> : null}
            <AvatarFallback className="text-lg">{initials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <label className="cursor-pointer">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Change photo
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onAvatar(e.target.files?.[0])}
            />
          </label>
        </div>

        <form onSubmit={save} className="mt-8 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} maxLength={20} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" defaultValue={profile?.department ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" defaultValue={profile?.year ?? ""} placeholder="e.g. 2nd year" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" name="college" defaultValue={profile?.college ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={profile?.bio ?? ""} />
          </div>
          <Button type="submit" className="rounded-full" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null} Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
