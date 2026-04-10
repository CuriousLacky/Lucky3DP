export type PostType = "PHOTO_PROMPT" | "VIDEO_PROMPT" | "TEXT_PROMPT" | "ANIMATION_PROMPT";

export interface PostTypeConfig {
  id: PostType;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  bgClass: string;
  activeClass: string;
  borderClass: string;
}

export const POST_TYPES: PostTypeConfig[] = [
  {
    id: "PHOTO_PROMPT",
    label: "Photo Prompt",
    shortLabel: "Photo",
    icon: "📸",
    color: "cyan",
    bgClass: "bg-cyan/10 text-cyan",
    activeClass: "bg-cyan text-base shadow-lg shadow-cyan/10",
    borderClass: "border-cyan/20",
  },
  {
    id: "VIDEO_PROMPT",
    label: "Video Prompt",
    shortLabel: "Video",
    icon: "🎬",
    color: "purple",
    bgClass: "bg-purple-500/10 text-purple-400",
    activeClass: "bg-purple-500 text-white shadow-lg shadow-purple-500/10",
    borderClass: "border-purple-500/20",
  },
  {
    id: "TEXT_PROMPT",
    label: "Text Prompt",
    shortLabel: "Text",
    icon: "✍️",
    color: "emerald",
    bgClass: "bg-emerald-500/10 text-emerald-400",
    activeClass: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/10",
    borderClass: "border-emerald-500/20",
  },
  {
    id: "ANIMATION_PROMPT",
    label: "Animation Prompt",
    shortLabel: "Anim",
    icon: "✨",
    color: "amber",
    bgClass: "bg-amber-500/10 text-amber-400",
    activeClass: "bg-amber-500 text-base shadow-lg shadow-amber-500/10",
    borderClass: "border-amber-500/20",
  },
];

export const PLATFORMS = [
  {
    id: "gemini" as const,
    label: "Gemini",
    icon: "✦",
    url: "https://gemini.google.com/app",
    bgClass: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20",
  },
  {
    id: "chatgpt" as const,
    label: "ChatGPT",
    icon: "💬",
    url: "https://chat.openai.com",
    bgClass: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "perplexity" as const,
    label: "Perplexity",
    icon: "🔍",
    url: "https://perplexity.ai",
    bgClass: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20",
  },
];

export function getPostTypeConfig(type: PostType): PostTypeConfig {
  return POST_TYPES.find((t) => t.id === type) || POST_TYPES[0];
}
