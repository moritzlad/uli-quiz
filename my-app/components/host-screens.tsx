"use client";
import React, { CSSProperties } from "react";
import { INK, PAPER, CARD, RED, RULE_SOFT, SERIF, SANS, Q_CFG, CATEGORY_COLORS } from "./quiz-config";
import { TEAMS, TEAM_COLORS, type Team } from "@/lib/teams";

function teamColor(team: string): { bg: string; fg: string } {
  return team in TEAM_COLORS ? TEAM_COLORS[team as Team] : { bg: INK, fg: "#fff" };
}

// ── Shapes ──────────────────────────────────────────────────
function ShapePath({ idx, fill }: { idx: number; fill: string }) {
  if (idx === 0) return <polygon points="50,12 90,85 10,85" fill={fill} />;
  if (idx === 1) return <rect x={14} y={14} width={72} height={72} fill={fill} />;
  if (idx === 2) return <polygon points="50,8 92,50 50,92 8,50" fill={fill} />;
  return <circle cx={50} cy={50} r={40} fill={fill} />;
}

// ── Countdown ───────────────────────────────────────────────
export function HostCountdown({ value, max }: { value: number; max: number }) {
  const R = 44, circ = 2 * Math.PI * R;
  const pct = Math.max(0, value) / max;
  const offset = circ * (1 - pct);
  const warn = value <= 8;
  const col = warn ? RED : INK;
  return (
    <div style={{ position: "relative", width: 168, height: 168, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx={50} cy={50} r={R} fill="none" stroke="rgba(24,20,13,.1)" strokeWidth="5.5" />
        <circle cx={50} cy={50} r={R} fill="none" stroke={col} strokeWidth="5.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .95s linear, stroke .3s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 62, lineHeight: 1, color: col, transition: "color .3s", fontVariantNumeric: "tabular-nums" }}>{value}</span>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: ".1em", color: INK, opacity: 0.42, marginTop: 2 }}>Sek.</span>
      </div>
    </div>
  );
}

// ── Banner ──────────────────────────────────────────────────
export function HostBanner({ right, kicker }: { right?: string; kicker?: string }) {
  return (
    <div style={{ background: RED, color: "#fff", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 60px" }}>
        <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 46, textTransform: "uppercase", letterSpacing: "-.01em", lineHeight: 1 }}>
          DIE&nbsp;<span style={{ fontWeight: 600 }}>FEIER</span>
        </span>
        {right && <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 22, textTransform: "uppercase", letterSpacing: ".13em", opacity: 0.92 }}>{right}</span>}
      </div>
      {kicker && <>
        <div style={{ borderTop: "2px solid rgba(255,255,255,.38)", margin: "0 60px" }} />
        <div style={{ padding: "6px 60px 10px", fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 18, opacity: 0.9 }}>{kicker}</div>
      </>}
    </div>
  );
}

// ── Tile ────────────────────────────────────────────────────
function HostTile({ idx, text, state }: { idx: number; text: string; state: "normal" | "correct" | "wrong" }) {
  const cfg = Q_CFG[idx];
  const isOk = state === "correct";
  const isBad = state === "wrong";
  const tileBg = isOk ? "#169b62" : isBad ? "#9a1210" : CARD;
  const textCol = isOk || isBad ? "#fff" : INK;
  const chipBg = isOk || isBad ? "rgba(255,255,255,.18)" : cfg.bg;
  const shapeFill = isOk || isBad ? "#fff" : cfg.sf;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 26, padding: "0 42px",
      background: tileBg, border: `4px solid ${INK}`, borderRadius: 10,
      boxShadow: `6px 6px 0 ${INK}`, minHeight: 164,
      fontFamily: SERIF, fontWeight: 800, fontSize: 50, color: textCol,
      opacity: isBad ? 0.48 : 1,
      transition: "background .4s, opacity .4s, color .35s",
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <div style={{ width: 94, height: 94, borderRadius: 10, background: chipBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .4s" }}>
        <svg viewBox="0 0 100 100" width={52} height={52} style={{ display: "block" }}>
          <ShapePath idx={idx} fill={shapeFill} />
        </svg>
      </div>
      <span style={{ lineHeight: 1.05, flex: 1 }}>{text}</span>
      <span style={{ position: "absolute", top: 10, right: 18, fontFamily: SANS, fontWeight: 900, fontSize: 22, opacity: isOk ? 1 : 0.28, color: isOk ? "#fff" : textCol }}>
        {isOk ? "✓" : ["A", "B", "C", "D"][idx]}
      </span>
    </div>
  );
}

// ── LOBBY ────────────────────────────────────────────────────
export function HostLobby({ players, pin }: { players: { name: string; team: string }[]; pin: string }) {
  const chunks = String(pin).match(/.{1,2}/g) || [pin];
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right="Sonderausgabe Nr. 60" />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 80px", borderRight: `2px solid ${RULE_SOFT}`, gap: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".2em", fontSize: 24, color: RED, marginBottom: 22 }}>Wie spielst du mit?</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 20, color: INK, opacity: 0.5, marginBottom: 14 }}>Scanne den Code</div>
          <div style={{ background: "#fff", border: `4px solid ${INK}`, borderRadius: 14, padding: 20, boxShadow: `8px 8px 0 ${INK}`, marginBottom: 18, lineHeight: 0 }}>
            <img src="/uli_quiz_qr.png" alt="QR-Code zum Quiz" width={370} height={370} style={{ display: "block", width: 340, height: 340, imageRendering: "pixelated" }} />
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 17, color: INK, opacity: 0.5, marginBottom: 10 }}>oder gehe auf</div>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, color: INK, border: `3px solid ${INK}`, borderRadius: 10, padding: "8px 28px", marginBottom: 26, background: "#fff", boxShadow: `4px 4px 0 ${INK}` }}>
            jubilar60.de/quiz
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 17, color: INK, opacity: 0.5, marginBottom: 14 }}>und gib diesen Code ein</div>
          <div style={{ display: "flex", gap: 16 }}>
            {chunks.map((c, i) => (
              <div key={i} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 104, lineHeight: 1, color: INK, background: "#fff", border: `4px solid ${INK}`, borderRadius: 14, padding: "8px 26px", boxShadow: `6px 6px 0 ${INK}`, letterSpacing: "-.01em" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "56px 70px", overflow: "hidden" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 22, color: RED, marginBottom: 18 }}>
            Bereits dabei — {players.length} Spieler
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
            {TEAMS.map(t => {
              const col = TEAM_COLORS[t];
              const count = players.filter(p => p.team === t).length;
              return (
                <span key={t} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 18, textTransform: "uppercase", letterSpacing: ".08em", background: col.bg, color: col.fg, border: `3px solid ${INK}`, borderRadius: 8, padding: "6px 16px" }}>
                  {t} · {count}
                </span>
              );
            })}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}>
            {players.map((p) => (
              <div key={p.name + p.team} style={{
                fontFamily: SANS, fontWeight: 700, fontSize: 26,
                border: `3px solid ${INK}`, borderRadius: 999,
                padding: "10px 24px", background: "#fff",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: `3px 3px 0 ${INK}`,
              }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, background: teamColor(p.team).bg, border: `2px solid ${INK}`, display: "inline-block", flexShrink: 0 }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Category Badge ───────────────────────────────────────────
function CategoryBadge({ category, size = "host" }: { category?: string; size?: "host" | "player" }) {
  if (!category) return null;
  const col = CATEGORY_COLORS[category] ?? { bg: INK, color: "#fff" };
  const fs = size === "host" ? 18 : 11;
  const px = size === "host" ? 20 : 10;
  const py = size === "host" ? 7 : 4;
  return (
    <span style={{
      display: "inline-block",
      fontFamily: SANS, fontWeight: 800, fontSize: fs,
      textTransform: "uppercase", letterSpacing: ".14em",
      background: col.bg, color: col.color,
      borderRadius: 6, padding: `${py}px ${px}px`,
    }}>
      {category}
    </span>
  );
}

// ── QUESTION INTRO (5s Vorschau: nur die Frage) ──────────────
export function HostQuestionIntro({
  question, qi, totalQ, countdown,
}: {
  question: { text: string; category?: string };
  qi: number; totalQ: number; countdown: number;
}) {
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right={`Frage ${qi + 1} von ${totalQ}`} kicker="Gleich geht's los — lies die Frage!" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 140px", gap: 34, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".2em", fontSize: 26, color: RED }}>Frage {qi + 1} von {totalQ}</div>
          <CategoryBadge category={question.category} size="host" />
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 108, lineHeight: 1.04, margin: 0, color: INK, letterSpacing: "-.015em", maxWidth: "16ch" }}>{question.text}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10 }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, textTransform: "uppercase", letterSpacing: ".14em", color: INK, opacity: 0.5 }}>Antworten in</span>
          <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, lineHeight: 1, color: RED, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "center" }}>{countdown}</span>
        </div>
      </div>
    </div>
  );
}

// ── QUESTION ─────────────────────────────────────────────────
export function HostQuestion({
  question, qi, totalQ, countdown, maxCountdown, answered, playerCount,
}: {
  question: { text: string; opts: string[]; category?: string };
  qi: number; totalQ: number; countdown: number; maxCountdown: number;
  answered: number; playerCount: number;
}) {
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right={`Frage ${qi + 1} von ${totalQ}`} kicker="Das Quiz läuft!" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "38px 60px 34px", gap: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 40, marginBottom: "auto" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
              <div style={{ fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".2em", fontSize: 24, color: RED }}>Frage {qi + 1} von {totalQ}</div>
              <CategoryBadge category={question.category} size="host" />
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 74, lineHeight: 1.03, margin: 0, color: INK, letterSpacing: "-.015em", maxWidth: "18ch" }}>{question.text}</h1>
          </div>
          <HostCountdown value={countdown} max={maxCountdown} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 36 }}>
          {question.opts.map((opt, i) => <HostTile key={i} idx={i} text={opt} state="normal" />)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 24 }}>
          <div style={{ flex: 1, height: 18, border: `2px solid ${INK}`, borderRadius: 999, background: "#fff", overflow: "hidden" }}>
            <div style={{ height: "100%", background: INK, width: `${Math.round((answered / Math.max(playerCount, 1)) * 100)}%`, transition: "width .6s ease" }} />
          </div>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, whiteSpace: "nowrap", color: INK }}>
            <b style={{ fontWeight: 900 }}>{answered}</b> von <b style={{ fontWeight: 900 }}>{playerCount}</b> haben geantwortet
          </span>
        </div>
      </div>
    </div>
  );
}

// ── REVEAL ───────────────────────────────────────────────────
export function HostReveal({
  question, qi, totalQ, dist, correctIndex, allCorrect,
}: {
  question: { text: string; opts: string[]; category?: string };
  qi: number; totalQ: number; dist: number[]; correctIndex: number; allCorrect?: boolean;
}) {
  const total = Math.max(dist.reduce((a, b) => a + b, 0), 1);
  const maxBar = Math.max(...dist, 1);
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right={`Frage ${qi + 1} von ${totalQ}`} kicker="Auflösung" />
      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1.25, display: "flex", flexDirection: "column", padding: "40px 48px 40px 60px", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <CategoryBadge category={question.category} size="host" />
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 52, lineHeight: 1.05, color: INK, maxWidth: "22ch" }}>{question.text}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1 }}>
            {question.opts.map((opt, i) => (
              <HostTile key={i} idx={i} text={opt} state={allCorrect || i === correctIndex ? "correct" : "wrong"} />
            ))}
          </div>
        </div>
        <div style={{ flex: 0.85, padding: "40px 60px 40px 36px", borderLeft: `2px solid ${RULE_SOFT}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".18em", fontSize: 20, color: RED, marginBottom: 4 }}>Antwort-Verteilung</div>
          {question.opts.map((_, i) => {
            const cfg = Q_CFG[i];
            const pct = Math.round(dist[i] / total * 100);
            const barW = Math.round(dist[i] / maxBar * 100);
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "58px 1fr 60px", gap: 14, alignItems: "center" }}>
                <div style={{ width: 54, height: 54, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${INK}`, flexShrink: 0 }}>
                  <svg viewBox="0 0 100 100" width={28} height={28} style={{ display: "block" }}>
                    <ShapePath idx={i} fill={cfg.sf} />
                  </svg>
                </div>
                <div style={{ height: 54, border: `3px solid ${INK}`, borderRadius: 7, background: "#fff", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: cfg.bg, width: `${barW}%`, transition: "width .9s cubic-bezier(.4,0,.2,1) .15s" }} />
                </div>
                <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 28, color: INK, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── LEADERBOARD ──────────────────────────────────────────────
export function HostLeaderboard({ leaders, teams, qi }: { leaders: { name: string; score: number }[]; teams: TeamStatsRow[]; qi: number }) {
  const top5 = leaders.slice(0, 5);
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right="Zwischenstand" kicker={`Nach Frage ${qi + 1}`} />
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "36px 48px 36px 60px", borderRight: `2px solid ${RULE_SOFT}` }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48, color: INK, letterSpacing: "-.01em", marginBottom: 6 }}>Top 5</div>
          {top5.map((p, i) => (
            <div key={p.name} style={{
              display: "flex", alignItems: "center", gap: 22,
              background: i === 0 ? "#f4a800" : CARD,
              border: `4px solid ${INK}`, borderRadius: 10,
              padding: "16px 28px", boxShadow: `5px 5px 0 ${INK}`,
              fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK,
            }}>
              <span style={{ fontSize: 36, width: 52, textAlign: "center", flexShrink: 0, lineHeight: 1 }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
              </span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              <span style={{ fontWeight: 900, letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {p.score.toLocaleString("de-DE")} Pkt.
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, padding: "36px 60px 36px 48px" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 48, color: INK, letterSpacing: "-.01em", marginBottom: 0 }}>Teams</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 20, color: INK, opacity: 0.55, marginTop: -10, marginBottom: 6 }}>Ø Punkte pro Spieler</div>
          {teams.map((t, i) => {
            const empty = t.playerCount === 0;
            const col = teamColor(t.team);
            return (
              <div key={t.team} style={{
                display: "flex", alignItems: "center", gap: 20,
                background: i === 0 && !empty ? "#f4a800" : CARD,
                border: `4px solid ${INK}`, borderRadius: 10,
                padding: "16px 28px", boxShadow: `5px 5px 0 ${INK}`,
                fontFamily: SANS, fontWeight: 800, fontSize: 34, color: INK,
                opacity: empty ? 0.45 : 1,
              }}>
                <span style={{ fontSize: 34, width: 52, textAlign: "center", flexShrink: 0, lineHeight: 1 }}>
                  {empty ? "—" : i === 0 ? "🏆" : `${i + 1}.`}
                </span>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: col.bg, border: `3px solid ${INK}`, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.team}
                  <span style={{ fontWeight: 600, fontSize: 21, opacity: 0.6, marginLeft: 14 }}>{t.playerCount} Spieler</span>
                </span>
                <span style={{ fontWeight: 900, letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {empty ? "—" : `Ø ${t.avgScore.toLocaleString("de-DE")}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── TEAM STATS ───────────────────────────────────────────────
export type TeamStatsRow = {
  team: string;
  playerCount: number;
  totalScore: number;
  avgScore: number;
  mvp: { name: string; score: number } | null;
};

export function HostTeamStats({ teams }: { teams: TeamStatsRow[] }) {
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right="Team-Wertung" kicker="Durchschnitt pro Spieler entscheidet" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 200px", gap: 20 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 60, color: INK, letterSpacing: "-.01em", marginBottom: 6, alignSelf: "flex-start" }}>Team-Wertung</div>
        {teams.map((t, i) => {
          const empty = t.playerCount === 0;
          const col = teamColor(t.team);
          const isWinner = i === 0 && !empty;
          return (
            <div key={t.team} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 30,
              background: isWinner ? "#f4a800" : CARD,
              border: `4px solid ${INK}`, borderRadius: 10,
              padding: "18px 36px", boxShadow: `5px 5px 0 ${INK}`,
              fontFamily: SANS, fontWeight: 800, fontSize: 40, color: INK,
              opacity: empty ? 0.45 : 1,
            }}>
              <span style={{ fontSize: 44, width: 64, textAlign: "center", flexShrink: 0, lineHeight: 1 }}>
                {empty ? "—" : i === 0 ? "🏆" : `${i + 1}.`}
              </span>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: col.bg, border: `3px solid ${INK}`, flexShrink: 0 }} />
              <span style={{ flex: 1 }}>
                {t.team}
                <span style={{ fontWeight: 600, fontSize: 26, opacity: 0.6, marginLeft: 18 }}>
                  {t.playerCount} {t.playerCount === 1 ? "Spieler" : "Spieler"} · {t.totalScore.toLocaleString("de-DE")} Pkt. gesamt
                </span>
              </span>
              {t.mvp && (
                <span style={{ fontWeight: 700, fontSize: 26, opacity: 0.75, whiteSpace: "nowrap" }}>
                  MVP: {t.mvp.name} ({t.mvp.score.toLocaleString("de-DE")})
                </span>
              )}
              <span style={{ fontWeight: 900, letterSpacing: "-.01em", fontVariantNumeric: "tabular-nums", fontSize: 44, whiteSpace: "nowrap" }}>
                {empty ? "—" : `Ø ${t.avgScore.toLocaleString("de-DE")} Pkt.`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PODIUM ───────────────────────────────────────────────────
export function HostPodium({ leaders }: { leaders: { name: string; score: number }[] }) {
  const top3 = leaders.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]];
  const heights = [420, 560, 340];
  const bgs = ["#c8c0b0", "#f4a800", "#b87333"];
  const ranks = ["2", "1", "3"];
  return (
    <div style={{ width: "100%", height: "100%", background: PAPER, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <HostBanner right="Finale" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0 0" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 66, color: INK, letterSpacing: "-.015em", marginBottom: 36 }}>Herzlichen Glückwunsch!</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 28, flex: 1 }}>
          {order.map((p, i) => !p ? null : (
            <div key={p.name} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 42, color: INK }}>{p.name}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: INK, opacity: 0.65 }}>{p.score.toLocaleString("de-DE")} Pkt.</div>
              </div>
              <div style={{
                width: 360, height: heights[i],
                background: bgs[i], border: `4px solid ${INK}`,
                borderTopLeftRadius: 10, borderTopRightRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `6px 0 0 ${INK}, -6px 0 0 ${INK}`,
              }}>
                <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, color: INK, lineHeight: 1 }}>{ranks[i]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
