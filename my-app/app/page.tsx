"use client";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { PlayerJoin } from "@/components/player-screens";

export default function JoinPage() {
  const router = useRouter();

  function handleJoin(name: string, pin: string) {
    getSocket().emit(
      "player:join",
      { pin, name },
      (res: { ok: boolean; error?: string }) => {
        if (res.ok) router.push(`/play?pin=${pin}&name=${encodeURIComponent(name)}`);
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
