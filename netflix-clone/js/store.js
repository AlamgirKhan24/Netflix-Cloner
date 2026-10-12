// Saved settings, My List and watch progress (localStorage key "nf-clone:v1").
const Store = (() => {
  const KEY = "nf-clone:v1";
  const defaults = {
    theme: "dark",
    accent: "#e50914",
    glass: 55,
    blur: 18,
    poster: 190,
    layout: "carousel",
    reduceMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    glow: true,
    autoHero: true,
    volume: 0.8,
    brightness: 100,
    list: [],
    progress: {},
    presets: []
  };

  const state = { ...defaults };
  try {
    Object.assign(state, JSON.parse(localStorage.getItem(KEY) || "{}"));
  } catch {}

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  };

  const emit = () => document.dispatchEvent(new Event("userdata"));

  return {
    state,
    defaults,
    update(patch) {
      Object.assign(state, patch);
      save();
    },
    inList(id) {
      return state.list.includes(id);
    },
    toggleList(id) {
      const on = !state.list.includes(id);
      state.list = on ? [id, ...state.list] : state.list.filter((x) => x !== id);
      save();
      emit();
      toast(on ? "Added to My List" : "Removed from My List");
      return on;
    },
    setProgress(id, time, duration) {
      state.progress[id] = { time, duration, at: Date.now() };
      save();
    },
    clearProgress(id) {
      delete state.progress[id];
      save();
    },
    continueList() {
      return Object.entries(state.progress)
        .map(([id, p]) => ({ id: Number(id), ratio: p.duration ? p.time / p.duration : 0, at: p.at }))
        .filter((p) => p.ratio > 0.02 && p.ratio < 0.97)
        .sort((a, b) => b.at - a.at);
    }
  };
})();
