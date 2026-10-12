// Shared page chrome: profiles, navbar, studio panel, toast and the side dock.
const Profiles = (() => {
  const base = [
    { id: 1, name: "You", color: "#e50914" },
    { id: 2, name: "Kids", color: "#2d8cff" },
    { id: 3, name: "Guest", color: "#2ec27e" }
  ];
  const all = () => Store.state.profiles || base;
  return {
    all,
    current: () => all().find((p) => p.id === Store.state.profileId) || all()[0],
    save: (profiles) => Store.update({ profiles }),
    set: (profileId) => Store.update({ profileId })
  };
})();

(() => {
  const page = document.body.dataset.page;
  const bare = page === "index" || page === "profiles";
  const links = [["browse", "Home"], ["search", "Search"], ["my-list", "My List"], ["settings", "Settings"]];
  const body = document.body;

  if (!$("#navbar")) {
    const nav = bare ? "" : `<nav class="nav-links" aria-label="Main">${links.map(([k, t]) => `<a href="${k}.html"${k === page ? ' class="active"' : ""}>${t}</a>`).join("")}</nav>`;
    const search = bare || page === "search" ? "" : `<label class="search" id="searchBox"><i data-icon="search"></i><input id="search" type="search" placeholder="Titles, genres" autocomplete="off" aria-label="Search titles"></label>`;
    const studioBtn = `<button class="neu round sm" id="studioBtn" aria-label="Open studio" aria-expanded="false" aria-controls="studio" data-magnetic><i data-icon="tune"></i></button>`;
    const who = page === "index" ? `<a class="neu pill sm" href="profiles.html">Sign In</a>` : page === "profiles" ? "" : `<a class="avatar" id="navAvatar" href="profiles.html" aria-label="Switch profile"></a>`;
    body.insertAdjacentHTML("afterbegin", `<header class="navbar glass" id="navbar"><a class="logo" href="${page === "index" ? "index" : "browse"}.html">NETFLIX</a>${nav}<div class="nav-right">${search}${studioBtn}${who}</div></header>`);
  }
  if (!$("#studio")) body.insertAdjacentHTML("beforeend", `<aside class="studio glass" id="studio" aria-label="Personalization studio" inert>
    <header class="studio-head">
      <h2>Studio</h2>
      <button class="neu round sm" id="studioClose" aria-label="Close studio"><i data-icon="close"></i></button>
    </header>
    <div class="studio-body">
      <section>
        <h3>Theme</h3>
        <div class="segmented" id="themeSeg">
          <button class="neu" data-theme-btn="dark">Dark</button>
          <button class="neu" data-theme-btn="light">Light</button>
          <button class="neu" data-theme-btn="oled">OLED</button>
        </div>
      </section>
      <section>
        <h3>Accent</h3>
        <div class="swatches" id="swatches">
          <button class="swatch" style="--c:#e50914" data-color="#e50914" aria-label="Red"></button>
          <button class="swatch" style="--c:#ff4d6d" data-color="#ff4d6d" aria-label="Rose"></button>
          <button class="swatch" style="--c:#ff9f1c" data-color="#ff9f1c" aria-label="Amber"></button>
          <button class="swatch" style="--c:#2ec27e" data-color="#2ec27e" aria-label="Green"></button>
          <button class="swatch" style="--c:#2d8cff" data-color="#2d8cff" aria-label="Blue"></button>
          <button class="swatch" style="--c:#9b5cff" data-color="#9b5cff" aria-label="Violet"></button>
          <input class="color-pick" id="accent" type="color" value="#e50914" aria-label="Custom accent color">
        </div>
      </section>
      <section>
        <h3>Liquid glass</h3>
        <label class="field"><span>Intensity</span><input class="slider" id="glass" type="range" min="0" max="100"></label>
        <label class="field"><span>Blur</span><input class="slider" id="blur" type="range" min="0" max="40"></label>
      </section>
      <section>
        <h3>Posters</h3>
        <label class="field"><span>Size</span><input class="slider" id="poster" type="range" min="130" max="260"></label>
        <div class="segmented" id="layoutSeg">
          <button class="neu" data-layout-btn="carousel">Carousel</button>
          <button class="neu" data-layout-btn="grid">Grid</button>
        </div>
      </section>
      <section>
        <h3>Preferences</h3>
        <label class="toggle-row"><span>Reduce motion</span><span class="toggle"><input type="checkbox" id="optReduce"><i></i></span></label>
        <label class="toggle-row"><span>Cursor glow</span><span class="toggle"><input type="checkbox" id="optGlow"><i></i></span></label>
        <label class="toggle-row"><span>Rotate featured title</span><span class="toggle"><input type="checkbox" id="optHero"><i></i></span></label>
      </section>
      <section>
        <h3>Presets</h3>
        <div class="preset-form">
          <input id="presetName" type="text" maxlength="24" placeholder="Name your look" aria-label="Preset name">
          <button class="neu pill sm" id="presetSave">Save</button>
        </div>
        <ul class="presets" id="presetList"></ul>
      </section>
      <section class="keys">
        <h3>Shortcuts</h3>
        <p><kbd>/</kbd> search <kbd>S</kbd> studio <kbd>P</kbd> play <kbd>L</kbd> my list <kbd>Esc</kbd> close</p>
        <p>Player: <kbd>Space</kbd> play <kbd>&larr;</kbd><kbd>&rarr;</kbd> seek <kbd>&uarr;</kbd><kbd>&darr;</kbd> volume <kbd>M</kbd> mute <kbd>F</kbd> fullscreen</p>
      </section>
      <button class="neu pill" id="resetLook">Reset look</button>
    </div>
  </aside>`);
  if (!$("#toast")) body.insertAdjacentHTML("beforeend", '<div class="toast glass" id="toast" role="status" aria-live="polite"></div>');
  if (!$("#heroArt")) body.insertAdjacentHTML("beforeend", '<div id="heroArt" hidden></div>');
  hydrateIcons();

  const avatar = $("#navAvatar");
  if (avatar) {
    const p = Profiles.current();
    avatar.textContent = (p.name || "?")[0].toUpperCase();
    avatar.style.background = `linear-gradient(145deg, ${p.color}, color-mix(in srgb, ${p.color} 55%, black))`;
  }

  const q = $("#search");
  if (q && page !== "browse") {
    q.addEventListener("input", () => $("#searchBox").classList.toggle("filled", !!q.value));
    q.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && q.value.trim()) location.href = "search.html?q=" + encodeURIComponent(q.value.trim());
    });
  }
})();

(() => {
  const page = document.body.dataset.page;
  Object.assign(ICONS, {
    home: `<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" ${STROKE}/>`,
    film: `<rect x="3" y="4" width="18" height="16" rx="2" ${STROKE}/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" ${STROKE}/>`,
    tv: `<rect x="3" y="5" width="18" height="12" rx="2" ${STROKE}/><path d="M8 21h8M12 17v4" ${STROKE}/>`,
    tray: `<path d="M5 9h14l-1 10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM7.5 9V5.5h9V9" ${STROKE}/><path d="M9.5 14.5l2 2 3.5-3.5" ${STROKE}/>`,
    apps: `<circle cx="7.5" cy="7.5" r="2.5" ${STROKE}/><circle cx="16.5" cy="7.5" r="2.5" ${STROKE}/><circle cx="7.5" cy="16.5" r="2.5" ${STROKE}/><circle cx="16.5" cy="16.5" r="2.5" ${STROKE}/>`
  });

  const items = [
    ["browse.html", "Home", "home"],
    ["browse.html#trending", "Trending", "film"],
    ["browse.html#top-rated", "Top rated", "tv"],
    ["my-list.html", "My List", "tray"],
    ["profiles.html", "Profiles", "apps"],
    ["search.html", "Search", "search"]
  ];
  const hash = location.hash.slice(1);
  const current = { browse: hash === "trending" ? 1 : hash === "top-rated" ? 2 : 0, "my-list": 3, profiles: 4, search: 5 }[page];
  let active = current === undefined ? -1 : current;

  document.body.classList.add("has-dock");
  document.body.insertAdjacentHTML(
    "beforeend",
    `<nav class="dock glass" id="dock" aria-label="Quick navigation"><span class="dock-pill"></span>${items
      .map(([h, t, i], n) => `<a class="dock-item${n === active ? " on" : ""}" href="${h}" data-tip="${t}" aria-label="${t}"${n === active ? ' aria-current="page"' : ""}>${icon(i)}</a>`)
      .join("")}</nav>`
  );

  const dock = $("#dock");
  const links = $$(".dock-item", dock);
  const paint = (n) => {
    dock.classList.toggle("none", n < 0);
    if (n >= 0) dock.style.setProperty("--i", n);
    links.forEach((a, k) => a.classList.toggle("on", k === n));
  };

  let prev = -1;
  try { prev = Number(sessionStorage.getItem("dock-i") ?? -1); } catch {}
  paint(prev >= 0 && active >= 0 ? prev : active);
  // Wait two frames so the pill is first painted at the previous page's icon, then slides to the new one.
  requestAnimationFrame(() => requestAnimationFrame(() => paint(active)));
  try { sessionStorage.setItem("dock-i", active); } catch {}

  const jump = (key) => {
    if (!key) return window.scrollTo({ top: 0, behavior: motionOff() ? "auto" : "smooth" });
    const node = document.getElementById(key);
    if (node) node.scrollIntoView({ behavior: motionOff() ? "auto" : "smooth", block: "center" });
  };
  if (hash) setTimeout(() => jump(hash), 900);

  dock.addEventListener("click", (e) => {
    const a = e.target.closest(".dock-item");
    if (!a || page !== "browse" || !a.getAttribute("href").startsWith("browse.html")) return;
    e.preventDefault();
    active = links.indexOf(a);
    paint(active);
    jump(a.getAttribute("href").split("#")[1]);
  });
})();
