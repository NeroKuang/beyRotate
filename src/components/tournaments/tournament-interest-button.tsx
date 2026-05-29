"use client";

import { useTransition } from "react";
import { toggleTournamentInterest } from "@/app/actions/tournaments";
import { Button } from "@/components/ui/button";

export function TournamentInterestButton({
  tournamentId,
  interested,
  disabled,
}: {
  tournamentId: string;
  interested: boolean;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={interested ? "secondary" : "primary"}
      disabled={disabled || pending}
      onClick={() => {
        startTransition(() => toggleTournamentInterest(tournamentId));
      }}
    >
      {pending ? "處理中…" : interested ? "取消感興趣" : "我有興趣"}
    </Button>
  );
}
