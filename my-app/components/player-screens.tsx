"use client";
import React, { useState } from "react";
import { TEAMS, TEAM_COLORS, type Team } from "@/lib/teams";
import {
  INK as P_INK, PAPER as P_PAPER, RED as P_RED, RULE_SOFT as P_RULE,
  SERIF as P_SERIF, SANS as P_SANS, Q_CFG as P_Q, CATEGORY_COLORS,
} from "./quiz-config";

function PlayerShape({ idx, size = 34 }: { idx: number; size?: number }) {
  const fill = P_Q[idx].sf;
  const el = idx === 0
    ? <polygon points="50,12 90,85 10,85" fill={fill} />
    : idx === 1
    ? <rect x={14} y={14} width={72} height={72} fill={fill} />
    : idx === 2
    ? <polygon points="50,8 92,50 50,92 8,50" fill={fill} />
    : <circle cx={50} cy={50} r={40} fill={fill} />;
  return <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>{el}</svg>;
}

function PlayerBanner({ dark }: { dark?: boolean }) {
  return (
    <div style={{ background: dark ? "rgba(0,0,0,.3)" : P_RED, color: "#fff", padding: "10px 20px", textAlign: "center", flexShrink: 0 }}>
      <div style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 21, textTransform: "uppercase", letterSpacing: "-.005em", lineHeight: 1 }}>
        DIE&nbsp;<span style={{ fontWeight: 600 }}>FEIER</span>
      </div>
    </div>
  );
}

// ── JOIN ─────────────────────────────────────────────────────
export function PlayerJoin({ onJoin, error }: { onJoin: (name: string, pin: string, team: Team) => void; error?: string | null }) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState<Team | null>(null);
  const canJoin = name.trim().length > 0 && pin.length === 6 && team !== null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 22px 24px", gap: 20, overflowY: "auto" }}>
        <div>
          <h1 style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 32, margin: "0 0 6px", lineHeight: 1.05, color: P_INK }}>Mitmachen!</h1>
          <p style={{ fontFamily: P_SERIF, fontSize: 16, color: "#5b5547", margin: 0, lineHeight: 1.5 }}>Gib den Code vom großen Bildschirm ein.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_INK }}>Quiz-Code</label>
          <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-stelliger Code" inputMode="numeric" autoComplete="off" enterKeyHint="next"
            style={{ fontFamily: P_SANS, fontWeight: 900, fontSize: 28, textAlign: "center", letterSpacing: ".3em", border: `3px solid ${P_INK}`, borderRadius: 8, padding: "13px 14px", background: "#fff", color: P_INK, width: "100%", boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_INK }}>Dein Spitzname</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="z. B. Brigitte" maxLength={14}
            autoComplete="off" autoCorrect="off" enterKeyHint="done"
            style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 20, border: `3px solid ${P_INK}`, borderRadius: 8, padding: "13px 14px", background: "#fff", color: P_INK, width: "100%", boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_INK }}>Dein Team</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TEAMS.map(t => {
              const col = TEAM_COLORS[t];
              const isSelected = team === t;
              return (
                <button key={t} onClick={() => setTeam(t)} style={{
                  fontFamily: P_SANS, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em",
                  background: isSelected ? col.bg : "#fff", color: isSelected ? col.fg : P_INK,
                  border: `2px solid ${P_INK}`, borderRadius: 999,
                  padding: "8px 15px", cursor: "pointer", outline: "none",
                  display: "inline-flex", alignItems: "center", gap: 6,
                  boxShadow: isSelected ? "none" : `2px 2px 0 ${P_INK}`,
                  transform: isSelected ? "translate(1px,1px)" : "none",
                  transition: "background .15s, transform .1s, box-shadow .1s",
                }}>
                  {isSelected
                    ? <span style={{ fontWeight: 900 }}>✓</span>
                    : <span style={{ width: 8, height: 8, borderRadius: 999, background: col.bg, display: "inline-block", flexShrink: 0 }} />}
                  {t}
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: P_SERIF, fontSize: 14, color: "#5b5547", margin: 0, lineHeight: 1.5 }}>Wähle dein Team für die Team-Wertung.</p>
        </div>
        {error && (
          <div style={{
            fontFamily: P_SANS, fontWeight: 700, fontSize: 14, lineHeight: 1.4,
            background: "#9a1210", color: "#fff", border: `3px solid ${P_INK}`,
            borderRadius: 8, padding: "12px 16px", marginTop: "auto", flexShrink: 0,
          }}>
            {error}
          </div>
        )}
        <button onClick={() => canJoin && onJoin(name.trim(), pin, team!)} style={{
          fontFamily: P_SANS, fontWeight: 900, fontSize: 19, textTransform: "uppercase", letterSpacing: ".06em",
          background: canJoin ? P_INK : P_RULE, color: "#fff",
          border: `3px solid ${canJoin ? P_INK : P_RULE}`, borderRadius: 8,
          padding: "18px 24px", cursor: canJoin ? "pointer" : "default",
          boxShadow: canJoin ? `4px 4px 0 ${P_RED}` : "none",
          transition: "background .2s, box-shadow .2s",
          width: "100%", boxSizing: "border-box",
          marginTop: error ? 0 : "auto", flexShrink: 0,
        }}>
          Beitreten →
        </button>
      </div>
    </div>
  );
}

// ── WAITING ──────────────────────────────────────────────────
export function PlayerWaiting({ name, team, players, mode = "lobby" }: { name: string; team?: string; players: { name: string; team: string }[]; mode?: "lobby" | "between" }) {
  const teamCol = team && team in TEAM_COLORS ? TEAM_COLORS[team as Team] : null;
  const between = mode === "between";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 22px 24px", gap: 18, overflowY: "auto" }}>
        <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>{between ? "📊" : "🎉"}</div>
          <h1 style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 28, margin: "0 0 8px", color: P_INK, lineHeight: 1.05 }}>
            {between ? "Zwischenstand!" : `Du bist dabei, ${name}!`}
          </h1>
          {teamCol && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: ".1em", background: teamCol.bg, color: teamCol.fg, border: `2px solid ${P_INK}`, borderRadius: 999, padding: "5px 14px", display: "inline-block" }}>
                Team {team}
              </span>
            </div>
          )}
          <p style={{ fontFamily: P_SERIF, fontSize: 15, color: "#5b5547", margin: 0, lineHeight: 1.5 }}>
            {between ? "Schau auf den großen Bildschirm — gleich geht's weiter." : "Das Quiz beginnt gleich — halt dein Handy bereit."}
          </p>
        </div>
        <div style={{ borderTop: `2px solid ${P_RULE}`, borderBottom: `2px solid ${P_RULE}`, padding: "14px 0" }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_RED, marginBottom: 10 }}>{players.length} Spieler dabei</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {players.slice(0, 14).map((p) => {
              const col = p.team in TEAM_COLORS ? TEAM_COLORS[p.team as Team] : null;
              return (
              <span key={p.name + p.team} style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 13, border: `2px solid ${P_INK}`, borderRadius: 999, padding: "4px 11px", background: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: col?.bg ?? P_INK, display: "inline-block", flexShrink: 0 }} />
                {p.name}
              </span>
              );
            })}
            {players.length > 14 && <span style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 13, color: "#5b5547", padding: "4px 0" }}>+{players.length - 14} weitere</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "auto" }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: P_RED, display: "inline-block", animation: "jPulse 1.3s ease-in-out infinite" }} />
          <span style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 14, color: "#5b5547" }}>Warte auf den Host …</span>
        </div>
      </div>
    </div>
  );
}

// ── QUESTION INTRO (5s Vorschau: nur die Frage) ──────────────
export function PlayerQuestionIntro({
  question, qi,
}: {
  question: { text: string; category?: string };
  qi: number;
}) {
  const catCol = question.category ? (CATEGORY_COLORS[question.category] ?? { bg: P_INK, color: "#fff" }) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 22px", gap: 16, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 12, textTransform: "uppercase", letterSpacing: ".18em", color: P_RED }}>Frage {qi + 1}</div>
          {catCol && question.category && (
            <span style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", background: catCol.bg, color: catCol.color, borderRadius: 4, padding: "2px 7px" }}>
              {question.category}
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 30, lineHeight: 1.2, margin: 0, color: P_INK }}>{question.text}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: P_RED, display: "inline-block", animation: "jPulse 1.3s ease-in-out infinite" }} />
          <span style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 14, color: "#5b5547" }}>Gleich kannst du antworten …</span>
        </div>
      </div>
    </div>
  );
}

// ── ANSWERING ────────────────────────────────────────────────
export function PlayerAnswering({
  question, qi, onAnswer, selectedIdx,
}: {
  question: { text: string; opts: string[]; category?: string };
  qi: number;
  onAnswer: (idx: number) => void;
  selectedIdx: number | null;
}) {
  const answered = selectedIdx !== null;
  const catCol = question.category ? (CATEGORY_COLORS[question.category] ?? { bg: P_INK, color: "#fff" }) : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 14px 20px", gap: 10, overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".18em", color: P_RED }}>Frage {qi + 1}</div>
          {catCol && question.category && (
            <span style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: ".12em", background: catCol.bg, color: catCol.color, borderRadius: 4, padding: "2px 7px" }}>
              {question.category}
            </span>
          )}
        </div>
        <p style={{ fontFamily: P_SERIF, fontWeight: 700, fontSize: 17, lineHeight: 1.4, margin: 0, color: P_INK, flex: "0 0 auto" }}>{question.text}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, flex: 1 }}>
          {question.opts.map((opt, i) => {
            const cfg = P_Q[i];
            const isSelected = selectedIdx === i;
            const dimmed = answered && !isSelected;
            return (
              <button key={i} onClick={() => !answered && onAnswer(i)} style={{
                background: cfg.bg, border: `3px solid ${P_INK}`, borderRadius: 10,
                padding: "12px 10px", cursor: answered ? "default" : "pointer",
                opacity: dimmed ? 0.34 : 1,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 8,
                boxShadow: isSelected ? "none" : `3px 3px 0 ${P_INK}`,
                transform: isSelected ? "translate(2px,2px)" : "none",
                transition: "opacity .35s, transform .12s, box-shadow .12s",
                position: "relative", outline: "none",
              }}>
                <PlayerShape idx={i} size={34} />
                <span style={{ fontFamily: P_SERIF, fontWeight: 800, fontSize: 16, lineHeight: 1.1, color: cfg.sf, textAlign: "center", flex: 1 }}>{opt}</span>
                {isSelected && <span style={{ position: "absolute", top: 7, right: 9, fontFamily: P_SANS, fontWeight: 900, fontSize: 16, color: cfg.sf }}>✓</span>}
              </button>
            );
          })}
        </div>
        {answered && (
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: ".1em", color: P_INK, textAlign: "center", opacity: 0.6 }}>
            Antwort gesendet — warte auf Auflösung …
          </div>
        )}
      </div>
    </div>
  );
}

// ── RESULT ───────────────────────────────────────────────────
export function PlayerResult({
  correct, pointsEarned, totalScore, rank, totalPlayers,
}: {
  correct: boolean; pointsEarned: number; totalScore: number; rank: number; totalPlayers: number;
}) {
  const bg = correct ? "#169b62" : "#9a1210";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: bg }}>
      <PlayerBanner dark />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "24px 22px" }}>
        <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 72, lineHeight: 1 }}>{correct ? "✅" : "❌"}</div>
        <div style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 40, color: "#fff", textAlign: "center", lineHeight: 1.05 }}>{correct ? "Richtig!" : "Falsch!"}</div>
        <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "18px 28px", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,255,255,.75)", marginBottom: 4 }}>Punkte diese Runde</div>
          <div style={{ fontFamily: P_SANS, fontWeight: 900, fontSize: 52, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {correct ? `+${pointsEarned.toLocaleString("de-DE")}` : "–"}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
          {[
            { label: "Gesamt", val: totalScore.toLocaleString("de-DE") + " Pkt." },
            { label: "Aktueller Rang", val: `${rank} / ${totalPlayers}` },
          ].map(item => (
            <div key={item.label} style={{ background: "rgba(255,255,255,.15)", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: ".14em", color: "rgba(255,255,255,.7)", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: P_SANS, fontWeight: 900, fontSize: 24, color: "#fff", lineHeight: 1 }}>{item.val}</div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FINAL ────────────────────────────────────────────────────
export function PlayerFinal({
  rank, totalScore, totalPlayers, name, team, teamRank, teamCount,
}: {
  rank: number; totalScore: number; totalPlayers: number; name: string;
  team?: string; teamRank?: number; teamCount?: number;
}) {
  const isTop3 = rank <= 3;
  const medals = ["🥇", "🥈", "🥉"];
  const heroBg = isTop3 ? "#f4a800" : P_PAPER;
  const teamCol = team && team in TEAM_COLORS ? TEAM_COLORS[team as Team] : null;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: heroBg }}>
      <PlayerBanner />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "24px 22px", textAlign: "center" }}>
        <div style={{ margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ fontSize: 68, lineHeight: 1 }}>{isTop3 ? medals[rank - 1] : "🎊"}</div>
        <div style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 28, color: P_INK, lineHeight: 1.1 }}>
          {isTop3 ? `Glückwunsch, ${name}!` : `Danke fürs Mitspielen, ${name}!`}
        </div>
        <div style={{ background: P_INK, borderRadius: 12, padding: "20px 30px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: "rgba(255,255,255,.6)", marginBottom: 4 }}>Endplatzierung</div>
          <div style={{ fontFamily: P_SANS, fontWeight: 900, fontSize: 50, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>Platz {rank}</div>
          <div style={{ fontFamily: P_SANS, fontWeight: 600, fontSize: 16, color: "rgba(255,255,255,.6)", marginTop: 4 }}>von {totalPlayers} Spielern</div>
        </div>
        <div style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 15, color: "#5b5547" }}>
          Gesamt: <b style={{ fontWeight: 900, color: P_INK }}>{totalScore.toLocaleString("de-DE")} Punkte</b>
        </div>
        {team && teamCol && (
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: ".08em", background: teamCol.bg, color: teamCol.fg, border: `2px solid ${P_INK}`, borderRadius: 999, padding: "7px 18px" }}>
            Team {team}{teamRank && teamCount ? ` · Platz ${teamRank} von ${teamCount}` : ""}
          </div>
        )}
        <div style={{ fontFamily: P_SERIF, fontSize: 18, color: P_INK, fontStyle: "italic" }}>Auf Uli! 🥂</div>
        </div>
      </div>
    </div>
  );
}
