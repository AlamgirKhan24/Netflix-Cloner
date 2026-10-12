// Per-page logic for landing, profiles, search, movie, my-list, settings and watch.
(() => {
  const page = document.body.dataset.page;
  const qs = new URLSearchParams(location.search);
  const movieById = (id) => movies.find((m) => m.id === Number(id));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const card = (m, ratio) => `<article class="poster-card sk" tabindex="0" role="button" aria-label="${esc(m.title)}" data-id="${m.id}">
    <img alt="" loading="lazy" src="${m.poster}">
    <div class="card-info"><h4>${m.title}</h4><p>${m.match}% match · ${m.year}</p></div>
    <button class="card-add neu round xs" type="button" data-add aria-label="Toggle My List"></button>
    ${ratio ? `<div class="card-progress"><i style="width:${Math.round(ratio * 100)}%"></i></div>` : ""}</article>`;

  function paint(el, items) {
    el.innerHTML = items.map((it) => card(it.m || it, it.ratio)).join("");
    $$("img", el).forEach((img) => {
      const c = img.parentElement;
      const ok = () => {
        c.classList.remove("sk");
        img.classList.add("loaded");
      };
      if (img.complete && img.naturalWidth) ok();
      else {
        img.onload = ok;
        img.onerror = () => {
          c.classList.remove("sk");
          c.classList.add("broken");
        };
      }
    });
    syncAdd();
  }

  function syncAdd() {
    $$("[data-add]").forEach((b) => {
      const on = Store.inList(Number(b.closest(".poster-card").dataset.id));
      b.innerHTML = icon(on ? "check" : "plus");
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  // One setup function per page, picked by <body data-page="...">.
  const pages = {
    index() {
      $("#mosaic").innerHTML = movies.map((m) => `<img alt="" src="${m.poster}">`).join("");
      $("#cta").addEventListener("submit", (e) => {
        e.preventDefault();
        Store.update({ email: $("#email").value.trim() });
        location.href = "profiles.html";
      });
    },

    profiles() {
      let manage = false;
      const grid = $("#pgrid");
      const draw = () => {
        const list = Profiles.all();
        grid.innerHTML =
          list.map((p) => `<div class="profile" data-id="${p.id}">
            <button class="avatar-lg" style="--c:${p.color}" aria-label="${manage ? "Edit" : "Watch as"} ${esc(p.name)}">${esc((p.name || "?")[0].toUpperCase())}</button>
            ${manage ? `<input class="input" value="${esc(p.name)}" maxlength="14" aria-label="Profile name"><button class="neu pill sm" data-del>Delete</button>` : `<span>${esc(p.name)}</span>`}</div>`).join("") +
          (list.length < 5 ? `<div class="profile"><button class="avatar-lg add" data-new aria-label="Add profile">${icon("plus")}</button><span>Add profile</span></div>` : "");
        $("#manage").textContent = manage ? "Done" : "Manage profiles";
      };
      grid.addEventListener("click", (e) => {
        const el = e.target.closest(".profile");
        if (!el) return;
        const list = Profiles.all();
        if (e.target.closest("[data-new]")) {
          const colors = ["#ff9f1c", "#9b5cff", "#ff4d6d", "#2ec27e"];
          Profiles.save([...list, { id: Date.now(), name: `Profile ${list.length + 1}`, color: colors[list.length % 4] }]);
          manage = true;
          return draw();
        }
        const id = Number(el.dataset.id);
        if (e.target.closest("[data-del]")) {
          if (list.length < 2) return toast("Keep at least one profile");
          Profiles.save(list.filter((p) => p.id !== id));
          return draw();
        }
        if (e.target.closest(".avatar-lg") && !manage) {
          Profiles.set(id);
          location.href = "browse.html";
        }
      });
      grid.addEventListener("change", (e) => {
        if (!e.target.matches("input")) return;
        const id = Number(e.target.closest(".profile").dataset.id);
        Profiles.save(Profiles.all().map((p) => (p.id === id ? { ...p, name: e.target.value.trim() || p.name } : p)));
      });
      $("#manage").addEventListener("click", () => { manage = !manage; draw(); });
      draw();
    },

    search() {
      const q = $("#q");
      const grid = $("#grid");
      let genre = "";
      const genres = [...new Set(movies.flatMap((m) => m.genres))].sort();
      $("#genres").innerHTML = ["All", ...genres].map((g, i) => `<button class="neu pill sm${i ? "" : " on"}" type="button">${g}</button>`).join("");
      const run = () => {
        const t = q.value.trim().toLowerCase();
        const hits = movies.filter((m) => (!genre || m.genres.includes(genre)) && `${m.title} ${m.genres.join(" ")} ${m.year}`.toLowerCase().includes(t));
        $("#count").textContent = hits.length ? `${hits.length} title${hits.length > 1 ? "s" : ""}` : "";
        if (hits.length) paint(grid, hits);
        else grid.innerHTML = '<p class="empty">No titles match. Try a different word or genre.</p>';
        try { history.replaceState(null, "", t ? "?q=" + encodeURIComponent(q.value.trim()) : location.pathname); } catch {}
      };
      $("#genres").addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        genre = b.textContent === "All" ? "" : b.textContent;
        $$("#genres button").forEach((x) => x.classList.toggle("on", x === b));
        run();
      });
      q.value = qs.get("q") || "";
      q.addEventListener("input", run);
      run();
    },

    movie() {
      const m = movieById(qs.get("id"));
      if (!m) {
        document.body.innerHTML = '<main class="page"><p class="empty">Title not found. <a href="browse.html">Back to browse</a></p></main>';
        return;
      }
      document.title = `${m.title} - Netflix Clone`;
      $("#mBg").style.backgroundImage = `url(${m.backdrop})`;
      $("#mTitle").textContent = m.title;
      $("#mMeta").innerHTML = `<span class="match">${m.match}% Match</span><span>${m.year}</span><span class="tag">${m.rating}</span><span>${m.length}</span>`;
      $("#mDesc").textContent = m.desc;
      $("#mChips").innerHTML = m.genres.map((g) => `<span>${g}</span>`).join("");
      const saved = Store.state.progress[m.id];
      $("#mPlay").href = `watch.html?id=${m.id}`;
      $("#mPlay").innerHTML = icon("play") + (saved && saved.time > 5 ? "Resume" : "Play");
      const btn = $("#mList");
      const sync = () => {
        const on = Store.inList(m.id);
        btn.innerHTML = icon(on ? "check" : "plus") + (on ? "In My List" : "My List");
        btn.classList.toggle("on", on);
      };
      btn.addEventListener("click", () => Store.toggleList(m.id));
      document.addEventListener("userdata", sync);
      sync();
      const similar = movies
        .filter((x) => x.id !== m.id)
        .map((x) => ({ x, s: x.genres.filter((g) => m.genres.includes(g)).length + (x.category === m.category ? 1 : 0) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 6)
        .map((o) => o.x);
      paint($("#grid"), similar);
    },

    "my-list"() {
      const draw = () => {
        const cont = Store.continueList().map((c) => ({ m: movieById(c.id), ratio: c.ratio })).filter((c) => c.m);
        const list = Store.state.list.map((id) => movieById(id)).filter(Boolean);
        $("#contWrap").hidden = !cont.length;
        $("#listWrap").hidden = !list.length;
        $("#emptyList").hidden = list.length > 0;
        paint($("#contGrid"), cont);
        paint($("#listGrid"), list);
      };
      draw();
      document.addEventListener("userdata", draw);
    },

    settings() {
      const p = Profiles.current();
      const name = $("#setName");
      const vol = $("#setVol");
      const bright = $("#setBright");
      $("#setEmail").textContent = Store.state.email || "Demo account (no email)";
      name.value = p.name;
      name.addEventListener("change", () => {
        Profiles.save(Profiles.all().map((x) => (x.id === p.id ? { ...x, name: name.value.trim() || x.name } : x)));
        toast("Profile name saved");
      });
      vol.value = Math.round(Store.state.volume * 100);
      bright.value = Store.state.brightness;
      [vol, bright].forEach(paintSlider);
      vol.addEventListener("input", () => { Store.update({ volume: vol.value / 100 }); paintSlider(vol); });
      bright.addEventListener("input", () => { Store.update({ brightness: Number(bright.value) }); paintSlider(bright); });
      $("#openStudio").addEventListener("click", () => Studio.open());
      const act = {
        history: () => { Store.update({ progress: {} }); toast("Watch history cleared"); },
        list: () => { Store.update({ list: [] }); toast("My List cleared"); },
        signout: () => { Store.update({ email: "", profileId: null }); location.href = "index.html"; },
        reset: () => {
          if (!confirm("Reset all settings, profiles, My List and history?")) return;
          try { localStorage.removeItem("nf-clone:v1"); } catch {}
          location.href = "index.html";
        }
      };
      $$("[data-act]").forEach((b) => b.addEventListener("click", () => act[b.dataset.act]()));
    },

    watch() {
      const m = movieById(qs.get("id"));
      if (!m) return void (location.href = "browse.html");
      const s = Store.state;
      const root = document.documentElement;
      root.dataset.motion = s.reduceMotion ? "reduce" : "full";
      root.style.setProperty("--accent", s.accent);
      root.style.setProperty("--accent-rgb", [1, 3, 5].map((i) => parseInt(s.accent.slice(i, i + 2), 16)).join(", "));
      const back = () => (location.href = `movie.html?id=${m.id}`);
      Player.open(m.id);
      $("#pClose").addEventListener("click", back);
      document.addEventListener("keydown", (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === "Escape") { Player.close(); return back(); }
        const t = e.target;
        if (t.matches("input[type=range]") && e.key.startsWith("Arrow")) return;
        if (t.closest("button") && e.key === " ") return;
        if (Player.key(e)) e.preventDefault();
      });
    }
  };

  // Cards are re-rendered often, so clicks use one delegated listener on the document.
  const open = (c) => (location.href = `movie.html?id=${c.dataset.id}`);
  document.addEventListener("click", (e) => {
    const c = e.target.closest(".poster-card");
    if (!c || !c.dataset.id) return;
    if (e.target.closest("[data-add]")) Store.toggleList(Number(c.dataset.id));
    else open(c);
  });
  document.addEventListener("keydown", (e) => {
    if (page === "watch" || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if ((e.key === "Enter" || e.key === " ") && t.classList && t.classList.contains("poster-card")) {
      e.preventDefault();
      return open(t);
    }
    if (e.key === "Escape" && typeof Studio !== "undefined") Studio.close();
    if (t.matches("input, textarea")) return;
    if (e.key === "/") {
      const box = $("#q") || $("#search");
      if (box) { e.preventDefault(); box.focus(); }
    } else if (e.key.toLowerCase() === "s" && typeof Studio !== "undefined") Studio.toggle();
  });

  hydrateIcons();
  if (pages[page]) pages[page]();
  document.addEventListener("userdata", syncAdd);
})();
