"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { withClockSkewRetry } from "@/lib/supabase/retry";
import { verifySession } from "@/lib/dal";

/** The current share link for this account, or null if they've never generated one. */
export async function getMyShareToken(): Promise<string | null> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await withClockSkewRetry(() =>
    supabase.from("profiles").select("share_token").eq("id", user.id).maybeSingle(),
  );

  if (error) throw new Error(`Failed to load share link: ${error.message}`);
  return data?.share_token ?? null;
}

/**
 * Creates a share link if one doesn't exist yet, or replaces the existing one — used for both
 * "get a link" (first time) and "get a new link" (revokes the old URL, since it's looked up by
 * this exact token and stops matching anything once it's overwritten).
 */
export async function generateShareToken(): Promise<string> {
  const user = await verifySession();
  const supabase = await createClient();
  const token = crypto.randomUUID();

  const { error } = await supabase.from("profiles").update({ share_token: token }).eq("id", user.id);
  if (error) throw new Error(`Failed to create share link: ${error.message}`);

  revalidatePath("/collection");
  return token;
}

/** Turns the current link off entirely — the page 404s for anyone who has the old URL. */
export async function revokeShareToken(): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").update({ share_token: null }).eq("id", user.id);
  if (error) throw new Error(`Failed to turn off the share link: ${error.message}`);

  revalidatePath("/collection");
}
