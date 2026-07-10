"use client";
import React, { useState } from "react";

const P_INK = "#18140d";
const P_PAPER = "#f6f2e9";
const P_RED = "#d51317";
const P_RULE = "#d9d1bf";
const P_SERIF = '"Bitter",Georgia,"Times New Roman",serif';
const P_SANS = '"Archivo","Helvetica Neue",Arial,sans-serif';

const P_Q = [
  { bg: "#e2231a", sf: "#fff" },
  { bg: "#2563d9", sf: "#fff" },
  { bg: "#f4a800", sf: "#18140d" },
  { bg: "#169b62", sf: "#fff" },
] as const;

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
        DER&nbsp;<span style={{ fontWeight: 600 }}>JUBILAR</span>
      </div>
    </div>
  );
}

// ── JOIN ─────────────────────────────────────────────────────
export function PlayerJoin({ onJoin }: { onJoin: (name: string, pin: string) => void }) {
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const canJoin = name.trim().length > 0 && pin.replace(/\s/g, "").length >= 6;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 22px 24px", gap: 22, overflowY: "auto" }}>
        <div>
          <h1 style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 32, margin: "0 0 6px", lineHeight: 1.05, color: P_INK }}>Mitmachen!</h1>
          <p style={{ fontFamily: P_SERIF, fontSize: 16, color: "#5b5547", margin: 0, lineHeight: 1.5 }}>Gib den Code vom großen Bildschirm ein.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_INK }}>Quiz-Code</label>
          <input value={pin} onChange={e => setPin(e.target.value)} placeholder="6-stelliger Code"
            style={{ fontFamily: P_SANS, fontWeight: 900, fontSize: 28, textAlign: "center", letterSpacing: ".3em", border: `3px solid ${P_INK}`, borderRadius: 8, padding: "13px 14px", background: "#fff", color: P_INK, width: "100%", boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_INK }}>Dein Spitzname</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="z. B. Brigitte" maxLength={14}
            style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 20, border: `3px solid ${P_INK}`, borderRadius: 8, padding: "13px 14px", background: "#fff", color: P_INK, width: "100%", boxSizing: "border-box", outline: "none" }} />
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => canJoin && onJoin(name.trim(), pin.replace(/\s/g, ""))} style={{
          fontFamily: P_SANS, fontWeight: 900, fontSize: 19, textTransform: "uppercase", letterSpacing: ".06em",
          background: canJoin ? P_INK : P_RULE, color: "#fff",
          border: `3px solid ${canJoin ? P_INK : P_RULE}`, borderRadius: 8,
          padding: "18px 24px", cursor: canJoin ? "pointer" : "default",
          boxShadow: canJoin ? `4px 4px 0 ${P_RED}` : "none",
          transition: "background .2s, box-shadow .2s",
          width: "100%",
        }}>
          Beitreten →
        </button>
      </div>
    </div>
  );
}

// ── WAITING ──────────────────────────────────────────────────
export function PlayerWaiting({ name, players }: { name: string; players: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: P_PAPER }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 22px 24px", gap: 18, overflowY: "auto" }}>
        <div style={{ textAlign: "center", padding: "20px 0 12px" }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🎉</div>
          <h1 style={{ fontFamily: P_SERIF, fontWeight: 900, fontSize: 28, margin: "0 0 8px", color: P_INK, lineHeight: 1.05 }}>Du bist dabei, {name}!</h1>
          <p style={{ fontFamily: P_SERIF, fontSize: 15, color: "#5b5547", margin: 0, lineHeight: 1.5 }}>Das Quiz beginnt gleich — halt dein Handy bereit.</p>
        </div>
        <div style={{ borderTop: `2px solid ${P_RULE}`, borderBottom: `2px solid ${P_RULE}`, padding: "14px 0" }}>
          <div style={{ fontFamily: P_SANS, fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: ".16em", color: P_RED, marginBottom: 10 }}>{players.length} Spieler dabei</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {players.slice(0, 14).map((n, i) => (
              <span key={n} style={{ fontFamily: P_SANS, fontWeight: 700, fontSize: 13, border: `2px solid ${P_INK}`, borderRadius: 999, padding: "4px 11px", background: "#fff", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: P_Q[i % 4].bg, display: "inline-block", flexShrink: 0 }} />
                {n}
              </span>
            ))}
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

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Zeitgeschichte": { bg: "#2563d9", color: "#fff" },
  "Personenfragen": { bg: "#f4a800", color: "#18140d" },
};

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
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: P_PAPER }}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 22px", gap: 16 }}>
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
  );
}

// ── FINAL ────────────────────────────────────────────────────
export function PlayerFinal({ rank, totalScore, totalPlayers, name }: { rank: number; totalScore: number; totalPlayers: number; name: string }) {
  const isTop3 = rank <= 3;
  const medals = ["🥇", "🥈", "🥉"];
  const heroBg = isTop3 ? "#f4a800" : P_PAPER;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: heroBg }}>
      <PlayerBanner />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 22px", gap: 18, textAlign: "center" }}>
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
        <div style={{ fontFamily: P_SERIF, fontSize: 18, color: P_INK, fontStyle: "italic" }}>Auf Uli! 🥂</div>
      </div>
    </div>
  );
}
