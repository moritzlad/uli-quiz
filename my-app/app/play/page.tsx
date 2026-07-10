"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import {
  PlayerWaiting, PlayerAnswering, PlayerResult, PlayerFinal,
} from "@/components/player-screens";

type Phase = "waiting" | "question" | "reveal" | "leaderboard" | "podium";

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

function PlayPageInner() {
  const params   = useSearchParams();
  const pin      = params.get("pin") ?? "";
  const name     = params.get("name") ?? "";
  const players  = params.get("players")?.split(",").filter(Boolean) ?? [];

  const [phase, setPhase]           = useState<Phase>("waiting");
  const [lobbyPlayers, setLobbyPlayers] = useState<string[]>(players);
  const [question, setQuestion]     = useState<{ text: string; opts: string[] } | null>(null);
  const [qi, setQi]                 = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [correct, setCorrect]       = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [rank, setRank]             = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(1);

  const answerTimeRef = useRef<number | null>(null);
  const endsAtRef     = useRef<number>(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on("lobby:update", ({ players: p }: { players: string[] }) => {
      setLobbyPlayers(p);
    });

    socket.on("game:question", (payload: QuestionPayload) => {
      setQuestion({ text: payload.text, opts: payload.opts });
      setQi(payload.qi);
      setSelectedIdx(null);
      endsAtRef.current = payload.endsAt;
      setPhase("question");
    });

    socket.on("game:reveal", (payload: RevealPayload) => {
      if (selectedIdx !== null) {
        const isCorrect = selectedIdx === payload.correctIndex;
        setCorrect(isCorrect);
        if (isCorrect && answerTimeRef.current !== null) {
          const elapsed = answerTimeRef.current - (endsAtRef.current - 20000);
          const timeLimit = 20000;
          const bonus = Math.round(500 * Math.max(0, 1 - elapsed / timeLimit));
          const earned = 500 + bonus;
          setPointsEarned(earned);
          setTotalScore(s => s + earned);
        } else {
          setPointsEarned(0);
        }
      } else {
        setCorrect(false);
        setPointsEarned(0);
      }
      setPhase("reveal");
    });

    socket.on("game:leaderboard", (payload: LeaderboardPayload) => {
      const idx = payload.leaders.findIndex(p => p.name === name);
      setRank(idx >= 0 ? idx + 1 : payload.leaders.length);
      setTotalPlayers(payload.leaders.length);
      setPhase("leaderboard");
    });

    socket.on("game:podium", (payload: PodiumPayload) => {
      const idx = payload.leaders.findIndex(p => p.name === name);
      setRank(idx >= 0 ? idx + 1 : payload.leaders.length);
      setTotalPlayers(payload.leaders.length);
      setPhase("podium");
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:question");
      socket.off("game:reveal");
      socket.off("game:leaderboard");
      socket.off("game:podium");
    };
  }, [name, selectedIdx]);

  function handleAnswer(idx: number) {
    if (selectedIdx !== null || !pin) return;
    setSelectedIdx(idx);
    answerTimeRef.current = Date.now();
    getSocket().emit("player:answer", { pin, answerIdx: idx });
  }

  function renderScreen() {
    switch (phase) {
      case "waiting":
      case "leaderboard":
        return <PlayerWaiting name={name} players={lobbyPlayers} />;
      case "question":
        return question ? (
          <PlayerAnswering question={question} qi={qi} onAnswer={handleAnswer} selectedIdx={selectedIdx} />
        ) : null;
      case "reveal":
        return (
          <PlayerResult
            correct={correct} pointsEarned={pointsEarned}
            totalScore={totalScore} rank={rank} totalPlayers={totalPlayers}
          />
        );
      case "podium":
        return (
          <PlayerFinal rank={rank} totalScore={totalScore} totalPlayers={totalPlayers} name={name} />
        );
    }
  }

  return (
    <div style={{ height: "100dvh", background: "#0d0a07" }}>
      {renderScreen()}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayPageInner />
    </Suspense>
  );
}
