"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
};

const SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

function StarIcon({ filled, half }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="half-fill">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#half-fill)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  size = "md",
  readonly = false,
}: Props) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  return (
    <div
      className={cn("inline-flex gap-0.5", readonly ? "" : "cursor-pointer")}
      onMouseLeave={() => !readonly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          className={cn(
            SIZES[size],
            "transition-colors disabled:cursor-default",
            star <= displayValue
              ? "text-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
          )}
          aria-label={`${star} 星`}
        >
          <StarIcon filled={star <= displayValue} />
        </button>
      ))}
    </div>
  );
}

export function StarRatingDisplay({
  average,
  total,
  size = "sm",
}: {
  average: number;
  total: number;
  size?: "sm" | "md" | "lg";
}) {
  const rounded = Math.round(average * 10) / 10;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(average);
          const isHalf = !filled && star - 0.5 <= average;
          return (
            <span
              key={star}
              className={cn(
                SIZES[size],
                filled || isHalf
                  ? "text-amber-400"
                  : "text-zinc-300 dark:text-zinc-600"
              )}
            >
              <StarIcon filled={filled} half={isHalf} />
            </span>
          );
        })}
      </div>
      <span className="text-sm font-medium">{rounded}</span>
      <span className="text-xs text-zinc-500">({total})</span>
    </div>
  );
}
