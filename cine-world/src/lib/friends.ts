import "server-only";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { withClockSkewRetry } from "@/lib/supabase/retry";
import { verifySession } from "@/lib/dal";
import { sendFriendRequestEmail } from "@/lib/email";

export interface FriendProfile {
  id: string;
  email: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function resolveProfiles(supabase: SupabaseServerClient, ids: string[]): Promise<FriendProfile[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from("profiles").select("id, email").in("id", ids);
  if (error) throw new Error(`Failed to load profiles: ${error.message}`);
  return data as FriendProfile[];
}

/** Accepted friendships, resolved to the other person's profile. */
export async function listFriends(): Promise<FriendProfile[]> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await withClockSkewRetry(() =>
    supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
  );

  if (error) throw new Error(`Failed to load friends: ${error.message}`);
  const otherIds = (data as { requester_id: string; addressee_id: string }[]).map((row) =>
    row.requester_id === user.id ? row.addressee_id : row.requester_id,
  );
  return resolveProfiles(supabase, otherIds);
}

/** Requests someone else sent you, awaiting your decision. */
export async function listIncomingRequests(): Promise<FriendProfile[]> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("requester_id")
    .eq("status", "pending")
    .eq("addressee_id", user.id);

  if (error) throw new Error(`Failed to load requests: ${error.message}`);
  return resolveProfiles(
    supabase,
    (data as { requester_id: string }[]).map((r) => r.requester_id),
  );
}

/** Requests you sent, awaiting their decision. */
export async function listSentRequests(): Promise<FriendProfile[]> {
  const user = await verifySession();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendships")
    .select("addressee_id")
    .eq("status", "pending")
    .eq("requester_id", user.id);

  if (error) throw new Error(`Failed to load sent requests: ${error.message}`);
  return resolveProfiles(
    supabase,
    (data as { addressee_id: string }[]).map((r) => r.addressee_id),
  );
}

export type SendRequestResult = "sent" | "not-found" | "self" | "already-exists";

export async function sendFriendRequest(email: string): Promise<SendRequestResult> {
  const user = await verifySession();
  const supabase = await createClient();

  const { data: foundId, error: lookupError } = await supabase.rpc("find_user_by_email", {
    lookup_email: email,
  });
  if (lookupError) throw new Error(`Lookup failed: ${lookupError.message}`);
  if (!foundId) return "not-found";
  if (foundId === user.id) return "self";

  const { error } = await supabase.from("friendships").insert({ requester_id: user.id, addressee_id: foundId });
  if (error) {
    if (error.code === "23505") return "already-exists"; // unique violation on (requester_id, addressee_id)
    throw new Error(`Failed to send request: ${error.message}`);
  }

  const origin = (await headers()).get("origin") ?? "";
  await sendFriendRequestEmail(email, user.email ?? "Someone", origin);

  return "sent";
}

export async function acceptFriendRequest(requesterId: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("requester_id", requesterId)
    .eq("addressee_id", user.id);

  if (error) throw new Error(`Failed to accept request: ${error.message}`);
}

/** Declines a pending request, cancels one you sent, or ends an accepted friendship — same operation either way. */
export async function removeFriendship(otherId: string): Promise<void> {
  const user = await verifySession();
  const supabase = await createClient();
  const { error } = await supabase
    .from("friendships")
    .delete()
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`,
    );

  if (error) throw new Error(`Failed to remove: ${error.message}`);
}
