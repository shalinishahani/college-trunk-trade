import { supabase } from "@/integrations/supabase/client";

const BUCKET = "listings";
const cache = new Map<string, string>();

/** Resolve a stored storage path into a displayable URL (signed, private bucket). */
export async function resolveImage(path?: string | null): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cached = cache.get(path);
  if (cached) return cached;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (!data?.signedUrl) return null;
  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export async function resolveImages(paths: string[] = []): Promise<string[]> {
  const urls = await Promise.all(paths.map(resolveImage));
  return urls.filter((u): u is string => Boolean(u));
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}
