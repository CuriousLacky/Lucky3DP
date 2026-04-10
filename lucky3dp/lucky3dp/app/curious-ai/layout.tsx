import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curious AI — Community Prompt Sharing & AI Tool",
  description:
    "Share AI prompts with before & after comparisons. Copy prompts and try on Gemini, ChatGPT, or Perplexity. Photo, video, text & animation prompts.",
  openGraph: {
    title: "Curious AI — Prompt Genius | LUCKY 3DP",
    description: "Community AI prompts with before/after results. Copy & use on Gemini, ChatGPT, Perplexity.",
    url: "/curious-ai",
  },
};

export default function CuriousAILayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
