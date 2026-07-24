"use client";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const getColor = (s: number) => {
    if (s >= 8) return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    if (s >= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  };

  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-0.5";

  return (
    <span className={`inline-flex items-center font-mono font-bold rounded ${sizeClass} ${getColor(score)}`}>
      {score.toFixed(1)}
    </span>
  );
}
