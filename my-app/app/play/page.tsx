"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { getPlayerId, loadSession } from "@/lib/player-session";
import {
  PlayerWaiting, PlayerQuestionIntro, PlayerAnswering, PlayerResult, PlayerFinal,
} from "@/components/player-screens";

type Phase = "waiting" | "question" | "reveal" | "leaderboard" | "podium";

interface QuestionPayload {
  qi: number;
  totalQ: number;
  text: string;
  opts: string[];
  startsAt: number;
  endsAt: number;
}

interface Leader { id: string; name: string; score: number; earned: number; answer: number | null }

interface RevealPayload {
  qi: number;
  totalQ: number;
  correctIndex: number;
  allCorrect?: boolean;
  dist: number[];
  question: { text: string; opts: string[] };
  leaders: Leader[];
}

interface LeaderboardPayload {
  leaders: Leader[];
  qi: number;
}

interface PodiumPayload {
  leaders: Leader[];
}

interface TeamStatsPayload {
  teams: { team: string; playerCount: number; totalScore: number; avgScore: number; mvp: { name: string; score: number } | null }[];
}

interface StateSnapshot {
  phase: "lobby" | "question" | "reveal" | "leaderboard" | "podium" | "teamstats";
  qi: number;
  totalQ: number;
  players: { name: string; team: string }[];
  score: number;
  yourAnswer: number | null;
  pointsEarned?: number;
  question?: { text: string; opts: string[] };
  startsAt?: number;
  endsAt?: number;
  correctIndex?: number;
  allCorrect?: boolean;
  dist?: number[];
  leaders?: Leader[];
  teams?: TeamStatsPayload["teams"];
}

function PlayPageInner() {
  const params  = useSearchParams();
  const router  = useRouter();
  const session = loadSession();
  const pin     = params.get("pin")  || session?.pin  || "";
  const name    = params.get("name") || session?.name || "";
  const team    = params.get("team") || session?.team || "";

  const [phase, setPhase]           = useState<Phase>("waiting");
  const [lobbyPlayers, setLobbyPlayers] = useState<{ name: string; team: string }[]>([]);
  const [teamStats, setTeamStats]   = useState<TeamStatsPayload["teams"] | null>(null);
  const [question, setQuestion]     = useState<{ text: string; opts: string[] } | null>(null);
  const [qi, setQi]                 = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answersOpen, setAnswersOpen] = useState(true);
  const [correct, setCorrect]       = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [rank, setRank]             = useState(1);
  const [totalPlayers, setTotalPlayers] = useState(1);

  const selectedIdxRef = useRef<number | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pin || !name || !team) {
      router.replace("/");
      return;
    }
    const socket = getSocket();
    const playerId = getPlayerId();

    function applyLeaders(leaders: Leader[] | undefined) {
      if (!leaders) return;
      const idx = leaders.findIndex(l => l.id === playerId);
      setRank(idx >= 0 ? idx + 1 : leaders.length);
      setTotalPlayers(leaders.length);
      if (idx >= 0) setTotalScore(leaders[idx].score);
    }

    // Antworten erst nach der 5s-Vorschau freischalten
    function openAnswersAt(startsAt?: number) {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      const wait = (startsAt ?? 0) - Date.now();
      if (wait > 0) {
        setAnswersOpen(false);
        previewTimerRef.current = setTimeout(() => setAnswersOpen(true), wait);
      } else {
        setAnswersOpen(true);
      }
    }

    function applySnapshot(snap: StateSnapshot) {
      setLobbyPlayers(snap.players);
      setTotalScore(snap.score);
      if (snap.qi >= 0) setQi(snap.qi);
      setSelectedIdx(snap.yourAnswer);
      selectedIdxRef.current = snap.yourAnswer;
      switch (snap.phase) {
        case "lobby":
          setPhase("waiting");
          break;
        case "question":
          if (snap.question) setQuestion(snap.question);
          openAnswersAt(snap.startsAt);
          setPhase("question");
          break;
        case "reveal":
          if (snap.question) setQuestion(snap.question);
          setCorrect(snap.yourAnswer !== null && (snap.allCorrect || snap.yourAnswer === snap.correctIndex));
          setPointsEarned(snap.pointsEarned ?? 0);
          applyLeaders(snap.leaders);
          setPhase("reveal");
          break;
        case "leaderboard":
          applyLeaders(snap.leaders);
          setPhase("leaderboard");
          break;
        case "podium":
          applyLeaders(snap.leaders);
          setPhase("podium");
          break;
        case "teamstats":
          applyLeaders(snap.leaders);
          setTeamStats(snap.teams ?? null);
          setPhase("podium");
          break;
      }
    }

    // (Re-)join the room: restores name/team/score after a refresh or a
    // dropped connection, and returns the current phase so the right screen renders.
    function rejoin() {
      socket.emit(
        "player:join",
        { pin, name, team, playerId },
        (res: { ok: boolean; error?: string; snapshot?: StateSnapshot }) => {
          if (res.ok && res.snapshot) applySnapshot(res.snapshot);
          else router.replace("/");
        }
      );
    }

    socket.on("connect", rejoin);
    if (socket.connected) rejoin();

    socket.on("lobby:update", ({ players: p }: { players: { name: string; team: string }[] }) => {
      setLobbyPlayers(p);
    });

    socket.on("game:question", (payload: QuestionPayload) => {
      setQuestion({ text: payload.text, opts: payload.opts });
      setQi(payload.qi);
      setSelectedIdx(null);
      selectedIdxRef.current = null;
      openAnswersAt(payload.startsAt);
      setPhase("question");
    });

    socket.on("game:reveal", (payload: RevealPayload) => {
      const idx = payload.leaders.findIndex(l => l.id === playerId);
      if (idx >= 0) {
        const me = payload.leaders[idx];
        // Server-recorded answer, not the local selection — they can differ
        // if the answer packet was lost or arrived after the deadline.
        setCorrect(me.answer !== null && (payload.allCorrect || me.answer === payload.correctIndex));
        setSelectedIdx(me.answer);
        selectedIdxRef.current = me.answer;
        setPointsEarned(me.earned);
        setTotalScore(me.score);
        setRank(idx + 1);
      } else {
        setCorrect(false);
        setPointsEarned(0);
      }
      setTotalPlayers(payload.leaders.length);
      setPhase("reveal");
    });

    socket.on("game:leaderboard", (payload: LeaderboardPayload) => {
      applyLeaders(payload.leaders);
      setPhase("leaderboard");
    });

    socket.on("game:podium", (payload: PodiumPayload) => {
      applyLeaders(payload.leaders);
      setPhase("podium");
    });

    socket.on("game:teamstats", (payload: TeamStatsPayload) => {
      setTeamStats(payload.teams);
    });

    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      socket.off("connect", rejoin);
      socket.off("lobby:update");
      socket.off("game:question");
      socket.off("game:reveal");
      socket.off("game:leaderboard");
      socket.off("game:podium");
      socket.off("game:teamstats");
    };
  }, [pin, name, team, router]);

  function handleAnswer(idx: number) {
    if (selectedIdx !== null || !pin) return;
    setSelectedIdx(idx);
    selectedIdxRef.current = idx;
    getSocket().emit("player:answer", { pin, answerIdx: idx });
  }

  function renderScreen() {
    switch (phase) {
      case "waiting":
      case "leaderboard":
        return <PlayerWaiting name={name} team={team} players={lobbyPlayers} mode={phase === "leaderboard" ? "between" : "lobby"} />;
      case "question":
        if (!question) return null;
        if (!answersOpen) return <PlayerQuestionIntro question={question} qi={qi} />;
        return <PlayerAnswering question={question} qi={qi} onAnswer={handleAnswer} selectedIdx={selectedIdx} />;
      case "reveal":
        return (
          <PlayerResult
            correct={correct} pointsEarned={pointsEarned}
            totalScore={totalScore} rank={rank} totalPlayers={totalPlayers}
          />
        );
      case "podium": {
        const ranked = teamStats?.filter(t => t.playerCount > 0) ?? [];
        const teamIdx = ranked.findIndex(t => t.team === team);
        return (
          <PlayerFinal
            rank={rank} totalScore={totalScore} totalPlayers={totalPlayers} name={name}
            team={team || undefined}
            teamRank={teamIdx >= 0 ? teamIdx + 1 : undefined}
            teamCount={teamIdx >= 0 ? ranked.length : undefined}
          />
        );
      }
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
