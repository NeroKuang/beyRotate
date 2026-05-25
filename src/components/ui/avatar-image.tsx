"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
};

function InitialFallback({
  name,
  className,
  size = "md",
}: Pick<Props, "name" | "className" | "size">) {
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-indigo-600 font-bold text-white shadow-inner",
        SIZE[size ?? "md"],
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/** 頭像：載入失敗時顯示姓名首字，不會破圖。 */
export function AvatarImage({ src, name, className, size = "md" }: Props) {
  const trimmed = src?.trim() ?? "";
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [trimmed]);

  if (!trimmed || failed) {
    return <InitialFallback name={name} className={className} size={size} />;
  }

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-slate-800 to-indigo-950",
        SIZE[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trimmed}
        alt={name ? `${name} 的頭像` : ""}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
