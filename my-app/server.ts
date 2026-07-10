import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import {
  createRoom, addPlayer, removePlayer, getRoom, playerNames,
  startQuestion, recordAnswer, getAnsweredCount, getAnswerDist,
  scoreAnswers, getLeaderboard,
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

    socket.on("player:join", ({ pin, name }: { pin: string; name: string }, cb: (res: { ok: boolean; error?: string }) => void) => {
      const room = addPlayer(pin, socket.id, name);
      if (!room) {
        cb?.({ ok: false, error: "Raum nicht gefunden oder schon gestartet" });
        return;
      }
      socket.join(pin);
      socket.data.pin = pin;
      cb?.({ ok: true });
      io.to(pin).emit("lobby:update", { players: playerNames(room) });
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
      if (!room) return;
      const changed = recordAnswer(room, socket.id, answerIdx);
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
        });
      } else if (room.phase === "reveal") {
        if (room.currentIndex < room.questions.length - 1) {
          room.phase = "leaderboard";
          io.to(pin).emit("game:leaderboard", {
            leaders: getLeaderboard(room),
            qi: room.currentIndex,
          });
        } else {
          room.phase = "podium";
          io.to(pin).emit("game:podium", { leaders: getLeaderboard(room) });
        }
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
      if (!pin) return;
      const room = getRoom(pin);
      if (!room) return;
      removePlayer(room, socket.id);
      if (room.phase === "lobby") {
        io.to(pin).emit("lobby:update", { players: playerNames(room) });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Bereit auf http://${hostname}:${port}`);
  });
});
