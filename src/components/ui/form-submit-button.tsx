"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function FormSubmitButton({
  children,
  pendingLabel = "處理中…",
  className,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn(pending && "cursor-wait", className)}
      {...props}
    >
      {pending && (
        <span
          className="mr-1.5 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {pending ? pendingLabel : children}
    </Button>
  );
}
