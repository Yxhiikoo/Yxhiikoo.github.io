// Jetons fictifs partagés entre les jeux du casino (aucune valeur réelle).
const KEY = "arcade-chips";
const START = 1000;
let mem = START;

function read() {
  try { const v = localStorage.getItem(KEY); return v === null ? START : Math.max(0, +v || 0); } catch { return mem; }
}
function write(v) {
  mem = v;
  try { localStorage.setItem(KEY, String(v)); } catch {}
  render();
}

export const chips = {
  get: read,
  add(n) { write(read() + n); bump(); },
  take(n) { const c = read(); if (n > c) return false; write(c - n); return true; },
  refill() { write(START); bump(); },
};

function render() {
  const el = document.getElementById("chips");
  if (el) el.textContent = "🪙 " + read().toLocaleString("fr-FR");
  const r = document.getElementById("refill");
  if (r) r.hidden = read() >= 10;
}
function bump() {
  const el = document.getElementById("chips");
  if (!el) return;
  el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
}

export function confetti(n = 80) {
  const colors = ["#7F00FF", "#E100FF", "#00D4FF", "#39FF14", "#FFD23F"];
  for (let i = 0; i < n; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
    c.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

let actx;
export function beep(freq, dur = 0.08, type = "square", vol = 0.05) {
  try {
    actx ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch {}
}
export function jingle() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, "square", 0.05), i * 90)); }

// Sélecteur de mise commun
export function betControl(el, { min = 10, step = 10, initial = 50 } = {}) {
  let bet = initial;
  const out = el.querySelector("output");
  const upd = () => { bet = Math.max(min, Math.min(bet, Math.max(min, read()))); out.textContent = bet; };
  el.querySelector("[data-d='-']").onclick = () => { bet -= step; upd(); beep(400, 0.03); };
  el.querySelector("[data-d='+']").onclick = () => { bet += step; upd(); beep(600, 0.03); };
  el.querySelector("[data-d='x2']")?.addEventListener("click", () => { bet *= 2; upd(); beep(700, 0.03); });
  el.querySelector("[data-d='max']")?.addEventListener("click", () => { bet = read(); upd(); beep(800, 0.03); });
  upd();
  return { get: () => bet, refresh: upd };
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  document.getElementById("refill")?.addEventListener("click", () => { chips.refill(); jingle(); });
});
render();
