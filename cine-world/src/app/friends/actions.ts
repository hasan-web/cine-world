"use server";

import { revalidatePath } from "next/cache";
import { acceptFriendRequest, removeFriendship, sendFriendRequest } from "@/lib/friends";

export interface AddFriendState {
  error?: string;
  success?: string;
}

export async function addFriend(_prevState: AddFriendState, formData: FormData): Promise<AddFriendState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter an email address." };

  const result = await sendFriendRequest(email);
  revalidatePath("/friends");

  switch (result) {
    case "sent":
      return { success: `Request sent to ${email}.` };
    case "self":
      return { error: "That's your own email." };
    case "not-found":
      return { error: "No Love for Cinema account with that email." };
    case "already-exists":
      return { error: "You've already sent a request, or you're already friends." };
  }
}

export async function acceptRequest(requesterId: string): Promise<void> {
  await acceptFriendRequest(requesterId);
  revalidatePath("/friends");
  revalidatePath("/collection");
}

export async function removeFriend(otherId: string): Promise<void> {
  await removeFriendship(otherId);
  revalidatePath("/friends");
  revalidatePath("/collection");
}
