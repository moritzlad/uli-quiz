import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import {
  createRoom, addPlayer, handleDisconnect, getRoom, playerList,
  startQuestion, recordAnswer, getAnsweredCount, getAnswerDist,
  scoreAnswers, getLeaderboard, getTeamStats, buildStateSnapshot,
  type StateSnapshot,
} from "./lib/game";
import { sampleQuestions } from "./lib/quiz-data";

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("host:create", (_payload, cb) => {
      const room = createRoom(socket.id, sampleQuestions);
      socket.join(room.pin);
      cb?.({ pin: room.pin });
    });

    socket.on("player:join", ({ pin, name, team, playerId }: { pin: string; name: string; team: string; playerId: string }, cb: (res: { ok: boolean; error?: string; snapshot?: StateSnapshot }) => void) => {
      if (!playerId) {
        cb?.({ ok: false, error: "Ungültige Sitzung. Lade die Seite neu." });
        return;
      }
      const room = addPlayer(pin, playerId, socket.id, name, team);
      if (!room) {
        cb?.({ ok: false, error: "Raum nicht gefunden, schon gestartet oder ungültiges Team" });
        return;
      }
      socket.join(pin);
      socket.data.pin = pin;
      socket.data.playerId = playerId;
      cb?.({ ok: true, snapshot: buildStateSnapshot(room, playerId) });
      io.to(pin).emit("lobby:update", { players: playerList(room) });
    });

    socket.on("host:start", ({ pin }: { pin: string }) => {
      const room = getRoom(pin);
      if (!room || socket.id !== room.hostId) return;
      startQuestion(room);
      const q = room.questions[room.currentIndex];
      io.to(pin).emit("game:question", {
        qi: room.currentIndex,
        totalQ: room.questions.length,
        text: q.text,
        opts: q.opts,
        endsAt: room.questionEndsAt,
      });
    });

    socket.on("player:answer", ({ pin, answerIdx }: { pin: string; answerIdx: number }) => {
      const room = getRoom(pin);
      const playerId = socket.data.playerId as string | undefined;
      if (!room || !playerId) return;
      const changed = recordAnswer(room, playerId, answerIdx);
      if (changed) {
        const count = getAnsweredCount(room);
        io.to(pin).emit("game:answered", { count, total: room.players.size });
      }
    });

    socket.on("host:next", ({ pin }: { pin: string }) => {
      const room = getRoom(pin);
      if (!room || socket.id !== room.hostId) return;

      if (room.phase === "question") {
        scoreAnswers(room); // sets phase = "reveal"
        const q = room.questions[room.currentIndex];
        io.to(pin).emit("game:reveal", {
          qi: room.currentIndex,
          totalQ: room.questions.length,
          correctIndex: q.correctIndex,
          dist: getAnswerDist(room),
          question: { text: q.text, opts: q.opts },
          leaders: getLeaderboard(room),
        });
      } else if (room.phase === "reveal") {
        if (room.currentIndex < room.questions.length - 1) {
          room.phase = "leaderboard";
          io.to(pin).emit("game:leaderboard", {
            leaders: getLeaderboard(room),
            teams: getTeamStats(room),
            qi: room.currentIndex,
          });
        } else {
          room.phase = "podium";
          io.to(pin).emit("game:podium", { leaders: getLeaderboard(room) });
        }
      } else if (room.phase === "podium") {
        room.phase = "teamstats";
        io.to(pin).emit("game:teamstats", { teams: getTeamStats(room) });
      } else if (room.phase === "leaderboard") {
        startQuestion(room);
        const q = room.questions[room.currentIndex];
        io.to(pin).emit("game:question", {
          qi: room.currentIndex,
          totalQ: room.questions.length,
          text: q.text,
          opts: q.opts,
          endsAt: room.questionEndsAt,
        });
      }
    });

    socket.on("disconnect", () => {
      const pin = socket.data.pin as string | undefined;
      const playerId = socket.data.playerId as string | undefined;
      if (!pin || !playerId) return;
      const room = getRoom(pin);
      if (!room) return;
      handleDisconnect(room, playerId, socket.id);
      io.to(pin).emit("lobby:update", { players: playerList(room) });
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Bereit auf http://${hostname}:${port}`);
  });
});
