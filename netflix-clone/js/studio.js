// Personalization panel: theme, accent colour, glass, presets.
const Studio = (() => {
  const root = document.documentElement;
  const panel = $("#studio");
  const openBtn = $("#studioBtn");
  const presetList = $("#presetList");
  const nameInput = $("#presetName");

  const el = {
    accent: $("#accent"),
    glass: $("#glass"),
    blur: $("#blur"),
    poster: $("#poster"),
    reduce: $("#optReduce"),
    glow: $("#optGlow"),
    hero: $("#optHero")
  };

  const LOOK_KEYS = ["theme", "accent", "glass", "blur", "poster", "layout"];
  const builtIn = [
    { name: "Netflix Red", theme: "dark", accent: "#e50914", glass: 55, blur: 18, poster: 190, layout: "carousel" },
    { name: "Ocean Glass", theme: "dark", accent: "#2d8cff", glass: 70, blur: 26, poster: 200, layout: "carousel" },
    { name: "Violet OLED", theme: "oled", accent: "#9b5cff", glass: 40, blur: 16, poster: 180, layout: "carousel" },
    { name: "Daylight", theme: "light", accent: "#ff4d6d", glass: 60, blur: 20, poster: 200, layout: "grid" }
  ];

  let opened = false;

  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  };

  function apply() {
    const s = Store.state;
    root.dataset.theme = s.theme;
    root.dataset.layout = s.layout;
    root.dataset.motion = s.reduceMotion ? "reduce" : "full";
    root.dataset.glow = s.glow ? "on" : "off";
    root.dataset.blur = s.blur === 0 ? "off" : "on";
    root.style.setProperty("--accent", s.accent);
    root.style.setProperty("--accent-rgb", hexToRgb(s.accent));
    root.style.setProperty("--glass-alpha", (0.04 + (s.glass / 100) * 0.26).toFixed(3));
    root.style.setProperty("--glass-blur", `${s.blur}px`);
    root.style.setProperty("--poster-w", `${s.poster}px`);
  }

  function syncControls() {
    const s = Store.state;
    el.accent.value = s.accent;
    el.glass.value = s.glass;
    el.blur.value = s.blur;
    el.poster.value = s.poster;
    [el.glass, el.blur, el.poster].forEach(paintSlider);
    el.reduce.checked = s.reduceMotion;
    el.glow.checked = s.glow;
    el.hero.checked = s.autoHero;
    $$("[data-theme-btn]").forEach((b) => b.classList.toggle("on", b.dataset.themeBtn === s.theme));
    $$("[data-layout-btn]").forEach((b) => b.classList.toggle("on", b.dataset.layoutBtn === s.layout));
    $$(".swatch").forEach((b) => b.classList.toggle("on", b.dataset.color.toLowerCase() === s.accent.toLowerCase()));
  }

  function withFade(change) {
    if (!motionOff() && document.startViewTransition) {
      document.startViewTransition(change);
      return;
    }
    root.classList.add("theme-fade");
    change();
    setTimeout(() => root.classList.remove("theme-fade"), 700);
  }

  function change(patch, fade = false) {
    const run = () => {
      Store.update(patch);
      apply();
      syncControls();
    };
    fade ? withFade(run) : run();
  }

  function pickLook(source) {
    return Object.fromEntries(LOOK_KEYS.map((k) => [k, source[k]]));
  }

  function applyPreset(preset) {
    change(pickLook(preset), true);
    toast(`${preset.name} applied`);
  }

  function renderPresets() {
    presetList.innerHTML = "";
    const all = [...builtIn.map((p) => ({ ...p, locked: true })), ...Store.state.presets];
    all.forEach((preset) => {
      const li = document.createElement("li");
      const use = document.createElement("button");
      use.className = "neu preset";
      use.type = "button";
      const dot = document.createElement("i");
      dot.style.background = preset.accent;
      dot.style.color = preset.accent;
      use.append(dot, document.createTextNode(preset.name));
      use.addEventListener("click", () => applyPreset(preset));
      li.appendChild(use);

      if (!preset.locked) {
        const del = document.createElement("button");
        del.className = "neu round sm";
        del.type = "button";
        del.setAttribute("aria-label", `Delete ${preset.name}`);
        del.innerHTML = icon("close");
        del.addEventListener("click", () => {
          Store.update({ presets: Store.state.presets.filter((p) => p.name !== preset.name) });
          renderPresets();
        });
        li.appendChild(del);
      }
      presetList.appendChild(li);
    });
  }

  function savePreset() {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.focus();
      return;
    }
    const preset = { name, ...pickLook(Store.state) };
    Store.update({ presets: [preset, ...Store.state.presets.filter((p) => p.name !== name)] });
    nameInput.value = "";
    renderPresets();
    toast(`Saved "${name}"`);
  }

  function open() {
    if (opened) return;
    opened = true;
    panel.inert = false;
    panel.classList.add("open");
    openBtn.setAttribute("aria-expanded", "true");
    setTimeout(() => $("#studioClose").focus({ preventScroll: true }), 50);
  }

  function close() {
    if (!opened) return;
    opened = false;
    panel.classList.remove("open");
    panel.inert = true;
    openBtn.setAttribute("aria-expanded", "false");
  }

  function bind() {
    openBtn.addEventListener("click", () => (opened ? close() : open()));
    $("#studioClose").addEventListener("click", close);
    document.addEventListener("pointerdown", (e) => {
      if (opened && !panel.contains(e.target) && !openBtn.contains(e.target)) close();
    });

    $$("[data-theme-btn]").forEach((b) =>
      b.addEventListener("click", () => {
        if (Store.state.theme !== b.dataset.themeBtn) change({ theme: b.dataset.themeBtn }, true);
      })
    );
    $$("[data-layout-btn]").forEach((b) => b.addEventListener("click", () => change({ layout: b.dataset.layoutBtn })));
    $$(".swatch").forEach((b) => b.addEventListener("click", () => change({ accent: b.dataset.color })));

    el.accent.addEventListener("input", () => change({ accent: el.accent.value }));
    el.glass.addEventListener("input", () => change({ glass: Number(el.glass.value) }));
    el.blur.addEventListener("input", () => change({ blur: Number(el.blur.value) }));
    el.poster.addEventListener("input", () => change({ poster: Number(el.poster.value) }));
    el.reduce.addEventListener("change", () => change({ reduceMotion: el.reduce.checked }));
    el.glow.addEventListener("change", () => change({ glow: el.glow.checked }));
    el.hero.addEventListener("change", () => change({ autoHero: el.hero.checked }));

    $("#presetSave").addEventListener("click", savePreset);
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") savePreset();
    });
    $("#resetLook").addEventListener("click", () => {
      change(pickLook(Store.defaults), true);
      toast("Look reset");
    });
  }

  apply();
  syncControls();
  renderPresets();
  bind();

  return { open, close, toggle: () => (opened ? close() : open()), isOpen: () => opened };
})();
