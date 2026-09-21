import { isHttpMediaUrl } from "@/lib/mediaUrl";
import { createSignedDownloadUrl } from "@/server/storage/supabase";

export { isHttpMediaUrl };

export async function resolveStoredMediaUrl(
  pathOrUrl: string | null | undefined,
): Promise<string | null> {
  const value = pathOrUrl?.trim();
  if (!value) return null;
  if (isHttpMediaUrl(value)) return value;
  try {
    return await createSignedDownloadUrl(value);
  } catch {
    return null;
  }
}
