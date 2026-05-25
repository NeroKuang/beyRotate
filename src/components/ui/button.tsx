import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-gradient-to-r from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500 shadow-sm",
        variant === "secondary" &&
          "border border-zinc-300 dark:border-zinc-700",
        variant === "danger" && "bg-red-600 text-white",
        variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        className
      )}
      {...props}
    />
  );
}
