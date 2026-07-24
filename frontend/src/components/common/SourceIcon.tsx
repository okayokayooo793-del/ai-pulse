"use client";

import type { SourceType } from "@/lib/types";
import { Twitter, Youtube, Rss, MessageCircle, Hash, Github } from "lucide-react";

interface SourceIconProps {
  type: SourceType;
  size?: number;
  className?: string;
}

const iconMap: Record<SourceType, typeof Twitter> = {
  twitter: Twitter,
  youtube: Youtube,
  rss: Rss,
  reddit: MessageCircle,
  hackernews: Hash,
  github: Github,
};

const colorMap: Record<SourceType, string> = {
  twitter: "text-blue-500",
  youtube: "text-red-500",
  rss: "text-orange-500",
  reddit: "text-red-600",
  hackernews: "text-orange-600",
  github: "text-purple-600",
};

export function SourceIcon({ type, size = 16, className = "" }: SourceIconProps) {
  const Icon = iconMap[type] || Rss;
  const color = colorMap[type] || "text-gray-500";
  return <Icon size={size} className={`${color} ${className}`} />;
}
