"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { PlayerJoin } from "@/components/player-screens";
import { getPlayerId, saveSession } from "@/lib/player-session";
import type { Team } from "@/lib/teams";

export default function JoinPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function handleJoin(name: string, pin: string, team: Team) {
    setError(null);
    getSocket().emit(
      "player:join",
      { pin, name, team, playerId: getPlayerId() },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) {
          saveSession({ pin, name, team });
          router.push(`/play?pin=${pin}&name=${encodeURIComponent(name)}&team=${encodeURIComponent(team)}`);
        } else {
          setError(res.error ?? "Beitritt fehlgeschlagen. Versuch es nochmal.");
        }
      }
    );
  }

  return (
    <div style={{ height: "100dvh", background: "#0d0a07" }}>
      <PlayerJoin onJoin={handleJoin} error={error} />
    </div>
  );
}
