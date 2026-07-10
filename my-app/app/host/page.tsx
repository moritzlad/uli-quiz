"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import {
  HostLobby, HostQuestion, HostReveal, HostLeaderboard, HostPodium,
} from "@/components/host-screens";

const COUNTDOWN_MAX = 20;

type Phase = "lobby" | "question" | "reveal" | "leaderboard" | "podium";

interface QuestionPayload {
  qi: number;
  totalQ: number;
  text: string;
  opts: string[];
  endsAt: number;
}

interface RevealPayload {
  qi: number;
  totalQ: number;
  correctIndex: number;
  dist: number[];
  question: { text: string; opts: string[] };
}

interface LeaderboardPayload {
  leaders: { name: string; score: number }[];
  qi: number;
}

interface PodiumPayload {
  leaders: { name: string; score: number }[];
}

export default function HostPage() {
  const [pin, setPin]           = useState("");
  const [players, setPlayers]   = useState<string[]>([]);
  const [phase, setPhase]       = useState<Phase>("lobby");
  const [scale, setScale]       = useState(1);
  const [countdown, setCountdown] = useState(COUNTDOWN_MAX);
  const [answered, setAnswered] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);

  const [question, setQuestion] = useState<{ text: string; opts: string[] } | null>(null);
  const [qIdx, setQIdx]         = useState(0);
  const [totalQ, setTotalQ]     = useState(0);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [dist, setDist]         = useState([0, 0, 0, 0]);
  const [leaders, setLeaders]   = useState<{ name: string; score: number }[]>([]);

  const stageRef  = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scale the 1920×1080 stage to fit viewport
  useEffect(() => {
    function doScale() {
      if (!stageRef.current) return;
      setScale(Math.min(
        stageRef.current.clientWidth / 1920,
        stageRef.current.clientHeight / 1080,
      ));
    }
    doScale();
    window.addEventListener("resize", doScale);
    return () => window.removeEventListener("resize", doScale);
  }, []);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();

    socket.emit("host:create", {}, (res: { pin: string }) => setPin(res.pin));

    socket.on("lobby:update", ({ players: p }: { players: string[] }) => {
      setPlayers(p);
      setPlayerCount(p.length);
    });

    socket.on("game:question", (payload: QuestionPayload) => {
      setQuestion({ text: payload.text, opts: payload.opts });
      setQIdx(payload.qi);
      setTotalQ(payload.totalQ);
      setAnswered(0);
      setPhase("question");

      const endsAt = payload.endsAt;
      if (timerRef.current) clearInterval(timerRef.current);
      const tick = () => {
        const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
        setCountdown(remaining);
      };
      tick();
      timerRef.current = setInterval(tick, 500);
    });

    socket.on("game:answered", ({ count, total }: { count: number; total: number }) => {
      setAnswered(count);
      setPlayerCount(total);
    });

    socket.on("game:reveal", (payload: RevealPayload) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setQuestion(payload.question);
      setQIdx(payload.qi);
      setTotalQ(payload.totalQ);
      setCorrectIndex(payload.correctIndex);
      setDist(payload.dist);
      setPhase("reveal");
    });

    socket.on("game:leaderboard", (payload: LeaderboardPayload) => {
      setLeaders(payload.leaders);
      setQIdx(payload.qi);
      setPhase("leaderboard");
    });

    socket.on("game:podium", (payload: PodiumPayload) => {
      setLeaders(payload.leaders);
      setPhase("podium");
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:question");
      socket.off("game:answered");
      socket.off("game:reveal");
      socket.off("game:leaderboard");
      socket.off("game:podium");
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = useCallback(() => {
    getSocket().emit("host:start", { pin });
  }, [pin]);

  const handleNext = useCallback(() => {
    getSocket().emit("host:next", { pin });
  }, [pin]);

  function renderStage() {
    switch (phase) {
      case "lobby":
        return <HostLobby players={players} pin={pin} />;
      case "question":
        return question ? (
          <HostQuestion
            question={question} qi={qIdx} totalQ={totalQ}
            countdown={countdown} maxCountdown={COUNTDOWN_MAX}
            answered={answered} playerCount={Math.max(playerCount, 1)}
          />
        ) : null;
      case "reveal":
        return question ? (
          <HostReveal
            question={question} qi={qIdx} totalQ={totalQ}
            dist={dist} correctIndex={correctIndex}
          />
        ) : null;
      case "leaderboard":
        return <HostLeaderboard leaders={leaders} qi={qIdx} />;
      case "podium":
        return <HostPodium leaders={leaders} />;
    }
  }

  const INK = "#18140d";
  const SANS = '"Archivo","Helvetica Neue",Arial,sans-serif';

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0d0a07", overflow: "hidden" }}>

      {/* Stage */}
      <div ref={stageRef} style={{ flex: 1, overflow: "hidden", position: "relative", background: "#0a0806" }}>
        <div style={{
          position: "absolute", top: 0, left: 0,
          width: 1920, height: 1080,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
        }}>
          {renderStage()}
        </div>
      </div>

      {/* Control bar */}
      <div style={{
        background: "#18140d", borderTop: "2px solid #2a2218",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "10px 24px", flexShrink: 0, gap: 16,
      }}>
        {phase === "lobby" && (
          <button onClick={handleStart} style={{
            fontFamily: SANS, fontWeight: 900, fontSize: 15,
            textTransform: "uppercase", letterSpacing: ".06em",
            background: "#d51317", color: "#fff",
            border: "2px solid #a40f12", borderRadius: 6,
            padding: "10px 32px", cursor: "pointer",
          }}>
            Spiel starten →
          </button>
        )}
        {(phase === "question" || phase === "reveal" || phase === "leaderboard") && (
          <button onClick={handleNext} style={{
            fontFamily: SANS, fontWeight: 900, fontSize: 15,
            textTransform: "uppercase", letterSpacing: ".06em",
            background: "#d51317", color: "#fff",
            border: "2px solid #a40f12", borderRadius: 6,
            padding: "10px 32px", cursor: "pointer",
          }}>
            {phase === "question" ? "Auflösung →" : phase === "reveal" ? "Weiter →" : "Nächste Frage →"}
          </button>
        )}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12, color: "#5b5547", textTransform: "uppercase", letterSpacing: ".1em" }}>
          PIN: {pin} · {players.length} Spieler
        </div>
      </div>
    </div>
  );
}
