// Home page: hero, rows, inline search and keyboard shortcuts.
(() => {
  const userRows = $("#userRows");
  const catRows = $("#catRows");
  const searchRows = $("#searchRows");
  const searchBox = $("#searchBox");
  const searchInput = $("#search");
  const heroTitle = $("#heroTitle");
  const heroMeta = $("#heroMeta");
  const heroDesc = $("#heroDesc");
  const heroText = $("#heroText");
  const heroList = $("#heroList");
  const dots = $("#heroDots");
  const layers = $$(".hero-layer");

  const featured = [1, 6, 11, 3, 7].map((id) => movies.find((m) => m.id === id));
  let heroIndex = 0;
  let layer = 0;
  let heroTimer = 0;

  const overlayOpen = () => !!$(".details:not([hidden]), .player:not([hidden])");
  const smooth = () => (motionOff() ? "auto" : "smooth");

  function metaHtml(m) {
    return `<span class="match">${m.match}% Match</span><span>${m.year}</span><span class="tag">${m.rating}</span><span>${m.length}</span><span>${m.genres.join(" · ")}</span>`;
  }

  function setHero(i) {
    heroIndex = (i + featured.length) % featured.length;
    const m = featured[heroIndex];
    const next = layers[1 - layer];
    const swap = () => {
      next.style.backgroundImage = `url(${m.backdrop})`;
      next.classList.add("show");
      layers[layer].classList.remove("show");
      layer = 1 - layer;
    };
    const img = new Image();
    img.onload = swap;
    img.onerror = swap;
    img.src = m.backdrop;

    heroTitle.textContent = m.title;
    heroMeta.innerHTML = metaHtml(m);
    heroDesc.textContent = m.desc;
    animate(heroText, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], {
      duration: 650,
      easing: "cubic-bezier(0.34, 1.2, 0.64, 1)"
    });
    $$("button", dots).forEach((d, n) => d.classList.toggle("on", n === heroIndex));
    syncAddButtons();
  }

  function startHero() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      if (!Store.state.autoHero || document.hidden || overlayOpen() || window.scrollY > innerHeight) return;
      setHero(heroIndex + 1);
    }, 8000);
  }

  function buildDots() {
    featured.forEach((m, n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Show ${m.title}`);
      b.addEventListener("click", () => {
        setHero(n);
        startHero();
      });
      dots.appendChild(b);
    });
  }

  function createCard(m, ratio) {
    const t = document.createElement("template");
    t.innerHTML = `<article class="poster-card sk" tabindex="0" role="button" aria-label="${m.title}" data-id="${m.id}">
      <img alt="" decoding="async" loading="lazy" src="${m.poster}">
      <div class="card-info"><h4>${m.title}</h4><p>${m.match}% match · ${m.year}</p></div>
      <button class="card-add neu round xs" type="button" data-add aria-label="Toggle My List"></button>
      ${ratio ? `<div class="card-progress"><i style="width:${Math.round(ratio * 100)}%"></i></div>` : ""}
    </article>`.trim();
    const card = t.content.firstElementChild;
    const img = $("img", card);
    const ready = () => {
      card.classList.remove("sk");
      img.classList.add("loaded");
    };
    if (img.complete && img.naturalWidth) ready();
    else {
      img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", () => {
        card.classList.remove("sk");
        card.classList.add("broken");
      }, { once: true });
    }
    return card;
  }

  function buildRow(info, cards, wrap = false) {
    const row = document.createElement("section");
    row.className = wrap ? "row results" : "row reveal";
    row.id = info.key;
    row.innerHTML = `<div class="row-head"><h3></h3></div>
      <div class="row-wrap">
        ${wrap ? "" : `<button class="neu round row-arrow left" type="button" data-dir="-1" aria-label="Scroll left">${icon("left")}</button>`}
        <div class="row-track"></div>
        ${wrap ? "" : `<button class="neu round row-arrow right" type="button" data-dir="1" aria-label="Scroll right">${icon("right")}</button>`}
      </div>`;
    $("h3", row).textContent = info.label;
    $(".row-track", row).append(...cards);
    return row;
  }

  function skeletonRows() {
    return [0, 1, 2]
      .map(
        () => `<section class="row"><div class="sk sk-title"></div><div class="row-track">${'<div class="poster-card sk"></div>'.repeat(8)}</div></section>`
      )
      .join("");
  }

  function renderCategories() {
    catRows.innerHTML = "";
    categories.forEach((c) => {
      const cards = movies.filter((m) => m.category === c.key).map((m) => createCard(m));
      catRows.appendChild(buildRow(c, cards));
    });
    Effects.reveal(catRows);
    syncAddButtons();
  }

  function renderUserRows() {
    userRows.innerHTML = "";
    const cont = Store.continueList()
      .map((c) => ({ m: movies.find((x) => x.id === c.id), ratio: c.ratio }))
      .filter((c) => c.m);
    if (cont.length) {
      userRows.appendChild(buildRow({ key: "continueRow", label: "Continue Watching" }, cont.map((c) => createCard(c.m, c.ratio))));
    }
    const list = Store.state.list.map((id) => movies.find((m) => m.id === id)).filter(Boolean);
    if (list.length) {
      userRows.appendChild(buildRow({ key: "listRow", label: "My List" }, list.map((m) => createCard(m))));
    }
    Effects.reveal(userRows);
    syncAddButtons();
  }

  function renderSearch(term) {
    const q = term.trim().toLowerCase();
    const active = q.length > 0;
    searchBox.classList.toggle("filled", active);
    userRows.hidden = active;
    catRows.hidden = active;
    searchRows.hidden = !active;
    searchRows.innerHTML = "";
    if (!active) return;

    const hits = movies.filter((m) => `${m.title} ${m.genres.join(" ")} ${m.year}`.toLowerCase().includes(q));
    if (!hits.length) {
      const p = document.createElement("p");
      p.className = "empty";
      p.textContent = `No titles match "${term.trim()}".`;
      searchRows.appendChild(p);
      return;
    }
    searchRows.appendChild(buildRow({ key: "results", label: `Results for "${term.trim()}"` }, hits.map((m) => createCard(m)), true));
    syncAddButtons();
  }

  function syncAddButtons() {
    $$("[data-add]").forEach((btn) => {
      const id = Number(btn.closest(".poster-card").dataset.id);
      const on = Store.inList(id);
      btn.innerHTML = icon(on ? "check" : "plus");
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    const hero = featured[heroIndex];
    if (hero) {
      const on = Store.inList(hero.id);
      heroList.innerHTML = icon(on ? "check" : "plus");
      heroList.classList.toggle("on", on);
    }
  }

  function currentMovie() {
    return Details.isOpen() ? Details.current() : featured[heroIndex];
  }

  function bind() {
    $("#rows").addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      const card = e.target.closest(".poster-card");
      if (add && card) {
        Store.toggleList(Number(card.dataset.id));
        return;
      }
      const arrow = e.target.closest(".row-arrow");
      if (arrow) {
        const track = $(".row-track", arrow.parentElement);
        track.scrollBy({ left: Number(arrow.dataset.dir) * track.clientWidth * 0.85, behavior: smooth() });
        return;
      }
      if (card && card.dataset.id) Details.open(Number(card.dataset.id), card);
    });

    $("#rows").addEventListener("keydown", (e) => {
      const card = e.target.closest(".poster-card");
      if (card && e.target === card && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        Details.open(Number(card.dataset.id), card);
      }
    });

    $("#heroPlay").addEventListener("click", () => Player.open(featured[heroIndex].id));
    $("#heroInfo").addEventListener("click", () => Details.open(featured[heroIndex].id, $("#heroPanel")));
    heroList.addEventListener("click", () => Store.toggleList(featured[heroIndex].id));

    $$("[data-target]").forEach((link) =>
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        if (searchInput.value) {
          searchInput.value = "";
          renderSearch("");
        }
        if (target === "top") {
          window.scrollTo({ top: 0, behavior: smooth() });
        } else {
          const node = document.getElementById(target);
          if (node) window.scrollTo({ top: node.getBoundingClientRect().top + window.scrollY - 100, behavior: smooth() });
          else toast("Your list is empty. Use the + on a poster to add titles.");
        }
        $$(".nav-links a").forEach((a) => a.classList.toggle("active", a === link));
      })
    );

    searchInput.addEventListener("input", () => renderSearch(searchInput.value));

    document.addEventListener("userdata", () => {
      renderUserRows();
      syncAddButtons();
    });

    document.addEventListener("keydown", (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;

      if (e.key === "Escape") {
        if (Player.isOpen()) Player.close();
        else if (Details.isOpen()) Details.close();
        else if (Studio.isOpen()) Studio.close();
        else if (t === searchInput || searchInput.value) {
          searchInput.value = "";
          searchInput.blur();
          renderSearch("");
        }
        return;
      }

      if (t.matches("input:not([type=range]):not([type=color]), textarea, select")) return;

      if (Player.isOpen()) {
        if (t.matches("input[type=range]") && e.key.startsWith("Arrow")) return;
        if (t.closest("button") && e.key === " ") return;
        if (Player.key(e)) e.preventDefault();
        return;
      }

      if (t.closest("button") && (e.key === " " || e.key === "Enter")) return;

      switch (e.key.toLowerCase()) {
        case "/":
          e.preventDefault();
          searchInput.focus();
          break;
        case "s":
          Studio.toggle();
          break;
        case "?":
          Studio.open();
          break;
        case "p":
          Details.isOpen() ? Details.play() : Player.open(currentMovie().id);
          break;
        case "l":
          Store.toggleList(currentMovie().id);
          break;
      }
    });
  }

  hydrateIcons();
  buildDots();
  bind();
  catRows.innerHTML = skeletonRows();
  setHero(0);
  startHero();
  setTimeout(() => {
    renderCategories();
    renderUserRows();
  }, 550);
})();
