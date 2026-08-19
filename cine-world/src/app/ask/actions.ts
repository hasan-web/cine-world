"use server";

import { verifySession } from "@/lib/dal";
import { buildFilmContext } from "@/lib/cinemaContext";
import { listFilms } from "@/lib/films";
import { chatCompletion, type ChatMessage } from "@/lib/groq";

const SYSTEM_PROMPT = (context: string) => `You are "Ask My Cinema" inside Love for Cinema, a mood-based film diary. \
The app files films into four moods rather than genres: Solitudo (the quiet ones), Amplitudo (the \
epics), Domus (comfort watches), Lacrima (what wrecked you).

Ground taste, pattern, and history questions in the collection below — never invent a rating, mood, \
note, or watch date that isn't listed. You may recommend films they haven't logged if it genuinely \
fits what the data suggests, but say plainly when you're going beyond their own collection rather \
than presenting a guess as something they actually watched.

Voice: warm, specific, a little literary — like a friend who's actually paying attention, not a \
recommendation engine. Two to four sentences unless a list is genuinely clearer.

<collection>
${context}
</collection>`;

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 2000;

export interface AskResult {
  answer?: string;
  error?: string;
}

/** history comes from client state — untrusted shape, so it's filtered and clamped before use. */
function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m): m is ChatMessage =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));
}

export async function askCinema(question: string, history: ChatMessage[]): Promise<AskResult> {
  await verifySession();

  const trimmed = question.trim();
  if (!trimmed) return { error: "Ask something first." };
  if (trimmed.length > MAX_QUESTION_LENGTH) return { error: "Keep it under 500 characters." };

  const films = await listFilms();
  const context = buildFilmContext(films);
  const safeHistory = sanitizeHistory(history);

  try {
    const answer = await chatCompletion([
      { role: "system", content: SYSTEM_PROMPT(context) },
      ...safeHistory,
      { role: "user", content: trimmed },
    ]);
    return { answer: answer.trim() };
  } catch {
    return { error: "Couldn't reach the model just now. Try again in a moment." };
  }
}
