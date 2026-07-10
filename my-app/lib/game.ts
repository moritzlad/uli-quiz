export type Question = {
  text: string;
  opts: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category?: string;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  lastAnswer?: number;
  answeredAt?: number;
};

export type Phase = "lobby" | "question" | "reveal" | "leaderboard" | "podium";

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

export function addPlayer(pin: string, id: string, name: string): Room | null {
  const room = rooms.get(pin);
  if (!room || room.phase !== "lobby") return null;
  room.players.set(id, { id, name, score: 0 });
  return room;
}

export function removePlayer(room: Room, id: string): void {
  room.players.delete(id);
}

export function playerNames(room: Room): string[] {
  return [...room.players.values()].map((p) => p.name);
}

export function startQuestion(room: Room): void {
  room.currentIndex++;
  room.phase = "question";
  room.questionEndsAt = Date.now() + QUESTION_TIME_MS;
  room.players.forEach((p) => {
    p.lastAnswer = undefined;
    p.answeredAt = undefined;
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
      player.score += 500 + bonus;
    }
  });
  room.phase = "reveal";
}

export function getLeaderboard(room: Room): { name: string; score: number }[] {
  return [...room.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p) => ({ name: p.name, score: p.score }));
}
