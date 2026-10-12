// Small DOM helpers, the SVG icon set, toast and other shared utilities.
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const STROKE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  play: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
  pause: '<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/>',
  volume: '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" ' + STROKE + "/>",
  mute: '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16 9.5l5 5m0-5l-5 5" ' + STROKE + "/>",
  sun: '<circle cx="12" cy="12" r="4" ' + STROKE + '/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" ' + STROKE + "/>",
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" ' + STROKE + "/>",
  close: '<path d="M6 6l12 12M18 6L6 18" ' + STROKE + "/>",
  plus: '<path d="M12 5v14M5 12h14" ' + STROKE + "/>",
  check: '<path d="M5 12.5l4.5 4.5L19 7.5" ' + STROKE + "/>",
  tune: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9" ' + STROKE + '/><circle cx="16" cy="7" r="2.2" ' + STROKE + '/><circle cx="8" cy="17" r="2.2" ' + STROKE + "/>",
  left: '<path d="M15 5l-7 7 7 7" ' + STROKE + "/>",
  right: '<path d="M9 5l7 7-7 7" ' + STROKE + "/>",
  info: '<circle cx="12" cy="12" r="9" ' + STROKE + '/><path d="M12 11v5M12 8h.01" ' + STROKE + "/>",
  search: '<circle cx="11" cy="11" r="6.5" ' + STROKE + '/><path d="M16 16l4.5 4.5" ' + STROKE + "/>"
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

function hydrateIcons(root = document) {
  $$("[data-icon]", root).forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function motionOff() {
  return document.documentElement.dataset.motion === "reduce";
}

function animate(el, frames, options) {
  const opts = { ...options };
  if (motionOff()) {
    opts.duration = 1;
    opts.delay = 0;
  }
  return el.animate(frames, opts);
}

function paintSlider(el) {
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty("--fill", `${pct}%`);
}

function syncLock() {
  document.body.classList.toggle("lock", !!$(".details:not([hidden]), .player:not([hidden])"));
}

let toastTimer = 0;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}
