"use client";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { PlayerJoin } from "@/components/player-screens";
import type { Team } from "@/lib/teams";

export default function JoinPage() {
  const router = useRouter();

  function handleJoin(name: string, pin: string, team: Team) {
    getSocket().emit(
      "player:join",
      { pin, name, team },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) router.push(`/play?pin=${pin}&name=${encodeURIComponent(name)}&team=${encodeURIComponent(team)}`);
        else alert(res.error);
      }
    );
  }

  return (
    <div style={{ height: "100dvh", background: "#0d0a07" }}>
      <PlayerJoin onJoin={handleJoin} />
    </div>
  );
}
