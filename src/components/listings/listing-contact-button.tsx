"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  href: string;
  label?: string;
  pendingLabel?: string;
};

export function ListingContactButton({
  href,
  label = "聯絡賣家",
  pendingLabel = "開啟對話中…",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      disabled={loading}
      className={loading ? "cursor-wait" : undefined}
      onClick={() => {
        setLoading(true);
        router.push(href);
      }}
    >
      {loading && (
        <span
          className="mr-1.5 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {loading ? pendingLabel : label}
    </Button>
  );
}
