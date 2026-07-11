"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { SANS } from "@/components/quiz-config";
import {
  HostLobby, HostQuestion, HostQuestionIntro, HostReveal, HostLeaderboard, HostPodium, HostTeamStats,
  type TeamStatsRow,
} from "@/components/host-screens";

const COUNTDOWN_MAX = 20;

type Phase = "lobby" | "question" | "reveal" | "leaderboard" | "podium" | "teamstats";

interface QuestionPayload {
  qi: number;
  totalQ: number;
  text: string;
  opts: string[];
  startsAt: number;
  endsAt: number;
}

interface RevealPayload {
  qi: number;
  totalQ: number;
  correctIndex: number;
  allCorrect?: boolean;
  dist: number[];
  question: { text: string; opts: string[] };
}

interface LeaderboardPayload {
  leaders: { name: string; score: number }[];
  teams: TeamStatsRow[];
  qi: number;
}

interface PodiumPayload {
  leaders: { name: string; score: number }[];
}

export default function HostPage() {
  const [pin, setPin]           = useState("");
  const [players, setPlayers]   = useState<{ name: string; team: string }[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStatsRow[]>([]);
  const [phase, setPhase]       = useState<Phase>("lobby");
  const [scale, setScale]       = useState(1);
  const [stageH, setStageH]     = useState(1080);
  const [countdown, setCountdown] = useState(COUNTDOWN_MAX);
  const [preview, setPreview] = useState(false);
  const [previewCountdown, setPreviewCountdown] = useState(5);
  const [answered, setAnswered] = useState(0);
  const [playerCount, setPlayerCount] = useState(0);

  const [question, setQuestion] = useState<{ text: string; opts: string[] } | null>(null);
  const [qIdx, setQIdx]         = useState(0);
  const [totalQ, setTotalQ]     = useState(0);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [allCorrect, setAllCorrect] = useState(false);
  const [dist, setDist]         = useState([0, 0, 0, 0]);
  const [leaders, setLeaders]   = useState<{ name: string; score: number }[]>([]);

  const stageRef  = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scale the stage to fill the full stage-area width; the design height
  // follows the stage area's aspect ratio so nothing slides under the control bar.
  useEffect(() => {
    if (!stageRef.current) return;
    function doScale() {
      if (!stageRef.current) return;
      const s = stageRef.current.clientWidth / 1920;
      setScale(s);
      setStageH(Math.round(stageRef.current.clientHeight / s));
    }
    doScale();
    const ro = new ResizeObserver(doScale);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Socket setup
  useEffect(() => {
    const socket = getSocket();

    socket.emit("host:create", {}, (res: { pin: string }) => setPin(res.pin));

    socket.on("lobby:update", ({ players: p }: { players: { name: string; team: string }[] }) => {
      setPlayers(p);
      setPlayerCount(p.length);
    });

    socket.on("game:question", (payload: QuestionPayload) => {
      setQuestion({ text: payload.text, opts: payload.opts });
      setQIdx(payload.qi);
      setTotalQ(payload.totalQ);
      setAnswered(0);
      setPhase("question");

      const { startsAt, endsAt } = payload;
      if (timerRef.current) clearInterval(timerRef.current);
      const tick = () => {
        const now = Date.now();
        if (now < startsAt) {
          setPreview(true);
          setPreviewCountdown(Math.max(1, Math.ceil((startsAt - now) / 1000)));
        } else {
          setPreview(false);
          setCountdown(Math.max(0, Math.round((endsAt - now) / 1000)));
        }
      };
      tick();
      timerRef.current = setInterval(tick, 250);
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
      setAllCorrect(!!payload.allCorrect);
      setDist(payload.dist);
      setPhase("reveal");
    });

    socket.on("game:leaderboard", (payload: LeaderboardPayload) => {
      setLeaders(payload.leaders);
      setTeamStats(payload.teams);
      setQIdx(payload.qi);
      setPhase("leaderboard");
    });

    socket.on("game:podium", (payload: PodiumPayload) => {
      setLeaders(payload.leaders);
      setPhase("podium");
    });

    socket.on("game:teamstats", ({ teams }: { teams: TeamStatsRow[] }) => {
      setTeamStats(teams);
      setPhase("teamstats");
    });

    return () => {
      socket.off("lobby:update");
      socket.off("game:question");
      socket.off("game:answered");
      socket.off("game:reveal");
      socket.off("game:leaderboard");
      socket.off("game:podium");
      socket.off("game:teamstats");
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
        if (question && preview) {
          return <HostQuestionIntro question={question} qi={qIdx} totalQ={totalQ} countdown={previewCountdown} />;
        }
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
            dist={dist} correctIndex={correctIndex} allCorrect={allCorrect}
          />
        ) : null;
      case "leaderboard":
        return <HostLeaderboard leaders={leaders} teams={teamStats} qi={qIdx} />;
      case "podium":
        return <HostPodium leaders={leaders} />;
      case "teamstats":
        return <HostTeamStats teams={teamStats} />;
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0d0a07", overflow: "hidden" }}>

      {/* Stage */}
      <div ref={stageRef} style={{ flex: 1, overflow: "hidden", position: "relative", background: "#0a0806", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 1920, height: stageH, flexShrink: 0,
          transformOrigin: "center center",
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
        {(phase === "question" || phase === "reveal" || phase === "leaderboard" || phase === "podium") && (
          <button onClick={handleNext} style={{
            fontFamily: SANS, fontWeight: 900, fontSize: 15,
            textTransform: "uppercase", letterSpacing: ".06em",
            background: "#d51317", color: "#fff",
            border: "2px solid #a40f12", borderRadius: 6,
            padding: "10px 32px", cursor: "pointer",
          }}>
            {phase === "question" ? "Auflösung →" : phase === "reveal" ? "Weiter →" : phase === "podium" ? "Team-Wertung →" : "Nächste Frage →"}
          </button>
        )}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12, color: "#5b5547", textTransform: "uppercase", letterSpacing: ".1em" }}>
          PIN: {pin} · {players.length} Spieler
        </div>
      </div>
    </div>
  );
}
