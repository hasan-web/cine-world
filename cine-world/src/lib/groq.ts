import "server-only";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// This account's catalog has no llama-3.x chat models — gpt-oss-120b is the strongest general
// model available. It's a reasoning model: "low" effort keeps the hidden reasoning pass short so
// the actual answer (in `content`, separate from `reasoning`) reliably fits inside max_tokens
// instead of getting cut off mid-thought.
const MODEL = "openai/gpt-oss-120b";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function apiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");
  return key;
}

/** jsonMode asks Groq to return a raw JSON object as the content string — still needs JSON.parse(). */
export async function chatCompletion(messages: ChatMessage[], jsonMode = false): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 900,
      reasoning_effort: "low",
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) throw new Error(`Groq request failed: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Groq returned no content");
  return content;
}
