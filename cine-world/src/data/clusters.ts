import type { Cluster } from "@/lib/types";

export const CLUSTERS: Cluster[] = [
  {
    id: "solitudo",
    label: "Solitudo",
    mood: "the quiet ones",
    x: 0.24,
    y: 0.32,
    description: "The quiet, tense films — the ones that sit with a character alone rather than resolve them.",
  },
  {
    id: "amplitudo",
    label: "Amplitudo",
    mood: "the epics",
    x: 0.74,
    y: 0.26,
    description: "The epics — films with the scale or ambition to hold a whole stretch of a life at once.",
  },
  {
    id: "domus",
    label: "Domus",
    mood: "comfort watches",
    x: 0.28,
    y: 0.75,
    description: "Comfort watches — films you return to, that feel like coming home rather than being challenged.",
  },
  {
    id: "lacrima",
    label: "Lacrima",
    mood: "what wrecked you",
    x: 0.76,
    y: 0.78,
    description: "What wrecked you — the films that left a mark that hadn't faded by the time the credits ran.",
  },
];
