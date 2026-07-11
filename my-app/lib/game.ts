import { TEAMS, isTeam } from "./teams";

export type Question = {
  text: string;
  opts: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category?: string;
};

export type Player = {
  id: string; // stable, client-generated playerId (survives reconnects)
  socketId: string | null;
  connected: boolean;
  name: string;
  team: string;
  score: number;
  lastAnswer?: number;
  answeredAt?: number;
  lastEarned?: number;
};

export type Phase = "lobby" | "question" | "reveal" | "leaderboard" | "podium" | "teamstats";

export type Room = {
  pin: string;
  hostId: string;
  questions: Question[];
  currentIndex: number;
  phase: Phase;
  players: Map<string, Player>;
  questionEndsAt?: number;
};

const QUESTION_TIME_MS = 20_000;

const rooms = new Map<string, Room>();

function makePin(): string {
  let pin: string;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(pin));
  return pin;
}

export function createRoom(hostId: string, questions: Question[]): Room {
  const room: Room = {
    pin: makePin(),
    hostId,
    questions,
    currentIndex: -1,
    phase: "lobby",
    players: new Map(),
  };
  rooms.set(room.pin, room);
  return room;
}

export function getRoom(pin: string): Room | undefined {
  return rooms.get(pin);
}

export function addPlayer(pin: string, playerId: string, socketId: string, name: string, team: string): Room | null {
  const room = rooms.get(pin);
  if (!room || !isTeam(team)) return null;
  const existing = room.players.get(playerId);
  if (existing) {
    // Rejoin (any phase): keep name/team/score, just re-attach the socket
    existing.socketId = socketId;
    existing.connected = true;
    return room;
  }
  if (room.phase !== "lobby") return null;
  room.players.set(playerId, { id: playerId, socketId, connected: true, name, team, score: 0 });
  return room;
}

export function handleDisconnect(room: Room, playerId: string, socketId: string): void {
  const player = room.players.get(playerId);
  // Ignore stale disconnects: the player may already have rejoined on a new socket
  if (!player || player.socketId !== socketId) return;
  if (room.phase === "lobby") {
    room.players.delete(playerId);
    return;
  }
  player.connected = false;
  player.socketId = null;
}

export function playerList(room: Room): { name: string; team: string }[] {
  return [...room.players.values()].map((p) => ({ name: p.name, team: p.team }));
}

export function startQuestion(room: Room): void {
  room.currentIndex++;
  room.phase = "question";
  room.questionEndsAt = Date.now() + QUESTION_TIME_MS;
  room.players.forEach((p) => {
    p.lastAnswer = undefined;
    p.answeredAt = undefined;
    p.lastEarned = undefined;
  });
}

export function recordAnswer(room: Room, id: string, answerIdx: number): boolean {
  const player = room.players.get(id);
  if (!player || player.lastAnswer !== undefined || room.phase !== "question") return false;
  player.lastAnswer = answerIdx;
  player.answeredAt = Date.now();
  return true;
}

export function getAnsweredCount(room: Room): number {
  return [...room.players.values()].filter((p) => p.lastAnswer !== undefined).length;
}

export function getAnswerDist(room: Room): number[] {
  const dist = [0, 0, 0, 0];
  room.players.forEach((p) => {
    if (p.lastAnswer !== undefined) dist[p.lastAnswer]++;
  });
  return dist;
}

export function scoreAnswers(room: Room): void {
  const q = room.questions[room.currentIndex];
  const start = (room.questionEndsAt ?? Date.now()) - QUESTION_TIME_MS;
  room.players.forEach((player) => {
    if (player.lastAnswer === q.correctIndex && player.answeredAt !== undefined) {
      const elapsed = player.answeredAt - start;
      const bonus = Math.round(500 * Math.max(0, 1 - elapsed / QUESTION_TIME_MS));
      player.lastEarned = 500 + bonus;
      player.score += player.lastEarned;
    } else {
      player.lastEarned = 0;
    }
  });
  room.phase = "reveal";
}

export function getLeaderboard(room: Room): { id: string; name: string; score: number; earned: number; answer: number | null }[] {
  return [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p) => ({ id: p.id, name: p.name, score: p.score, earned: p.lastEarned ?? 0, answer: p.lastAnswer ?? null }));
}

export type StateSnapshot = {
  phase: Phase;
  qi: number;
  totalQ: number;
  players: { name: string; team: string }[];
  score: number;
  yourAnswer: number | null;
  pointsEarned?: number;
  question?: { text: string; opts: string[] };
  endsAt?: number;
  correctIndex?: number;
  dist?: number[];
  leaders?: ReturnType<typeof getLeaderboard>;
  teams?: TeamStats[];
};

export function buildStateSnapshot(room: Room, playerId: string): StateSnapshot {
  const player = room.players.get(playerId);
  const snapshot: StateSnapshot = {
    phase: room.phase,
    qi: room.currentIndex,
    totalQ: room.questions.length,
    players: playerList(room),
    score: player?.score ?? 0,
    yourAnswer: player?.lastAnswer ?? null,
  };
  const q = room.questions[room.currentIndex];
  if (room.phase === "question" && q) {
    snapshot.question = { text: q.text, opts: q.opts };
    snapshot.endsAt = room.questionEndsAt;
  } else if (room.phase === "reveal" && q) {
    snapshot.question = { text: q.text, opts: q.opts };
    snapshot.correctIndex = q.correctIndex;
    snapshot.dist = getAnswerDist(room);
    snapshot.leaders = getLeaderboard(room);
    snapshot.pointsEarned = player?.lastEarned ?? 0;
  } else if (room.phase === "leaderboard") {
    snapshot.leaders = getLeaderboard(room);
    snapshot.teams = getTeamStats(room);
  } else if (room.phase === "podium") {
    snapshot.leaders = getLeaderboard(room);
  } else if (room.phase === "teamstats") {
    snapshot.leaders = getLeaderboard(room);
    snapshot.teams = getTeamStats(room);
  }
  return snapshot;
}

export type TeamStats = {
  team: string;
  playerCount: number;
  totalScore: number;
  avgScore: number;
  mvp: { name: string; score: number } | null;
  members: { name: string; score: number }[];
};

export function getTeamStats(room: Room): TeamStats[] {
  const players = [...room.players.values()];
  return TEAMS.map((team) => {
    const members = players
      .filter((p) => p.team === team)
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ name: p.name, score: p.score }));
    const totalScore = members.reduce((sum, m) => sum + m.score, 0);
    return {
      team,
      playerCount: members.length,
      totalScore,
      avgScore: members.length ? Math.round(totalScore / members.length) : 0,
      mvp: members[0] ?? null,
      members,
    };
  }).sort((a, b) => {
    // Empty teams always rank last
    if (!a.playerCount !== !b.playerCount) return a.playerCount ? -1 : 1;
    return b.avgScore - a.avgScore;
  });
}
