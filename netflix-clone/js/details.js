// Card-to-details modal transition.
const Details = (() => {
  const el = $("#details");
  const card = $(".details-card", el);
  const backdrop = $("#dBackdrop");
  const listBtn = $("#dList");

  let movie = null;
  let source = null;
  let lastFocus = null;
  let busy = false;

  function metaHtml(m) {
    return `<span class="match">${m.match}% Match</span><span>${m.year}</span><span class="tag">${m.rating}</span><span>${m.length}</span>`;
  }

  function syncList() {
    if (!movie) return;
    const on = Store.inList(movie.id);
    listBtn.innerHTML = `${icon(on ? "check" : "plus")}${on ? "In My List" : "My List"}`;
    listBtn.classList.toggle("on", on);
  }

  function fill(m) {
    $("#dTitle").textContent = m.title;
    $("#dArt").style.backgroundImage = `url(${m.backdrop})`;
    $("#dMeta").innerHTML = metaHtml(m);
    $("#dDesc").textContent = m.desc;
    $("#dChips").innerHTML = m.genres.map((g) => `<span>${g}</span>`).join("");
    syncList();
  }

  function offsetFrom(rect, to) {
    return `translate(${rect.left - to.left}px, ${rect.top - to.top}px) scale(${rect.width / to.width}, ${rect.height / to.height})`;
  }

  function open(id, from) {
    if (busy || !el.hidden) return;
    movie = movies.find((m) => m.id === id);
    if (!movie) return;
    source = from || null;
    lastFocus = document.activeElement;
    fill(movie);
    el.hidden = false;
    syncLock();

    const to = card.getBoundingClientRect();
    animate(backdrop, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "ease-out" });

    if (source) {
      animate(
        card,
        [
          { transformOrigin: "top left", transform: offsetFrom(source.getBoundingClientRect(), to), borderRadius: "18px" },
          { transformOrigin: "top left", transform: "none", borderRadius: "28px" }
        ],
        { duration: 580, easing: "cubic-bezier(0.34, 1.22, 0.64, 1)" }
      );
    } else {
      animate(card, [{ opacity: 0, transform: "scale(0.92)" }, { opacity: 1, transform: "none" }], {
        duration: 460,
        easing: "cubic-bezier(0.34, 1.4, 0.64, 1)"
      });
    }

    $$(".details-info, .details-title", card).forEach((part) =>
      animate(part, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], {
        duration: 420,
        delay: 240,
        easing: "ease-out",
        fill: "backwards"
      })
    );

    $("#dClose").focus({ preventScroll: true });
  }

  function finish() {
    el.hidden = true;
    card.getAnimations().forEach((a) => a.cancel());
    backdrop.getAnimations().forEach((a) => a.cancel());
    busy = false;
    syncLock();
  }

  function hideNow() {
    if (el.hidden) return;
    finish();
  }

  function close() {
    if (el.hidden || busy) return;
    busy = true;
    const from = card.getBoundingClientRect();
    const canReturn = source && document.contains(source);

    animate(backdrop, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: "forwards" });
    const exit = canReturn
      ? animate(
          card,
          [
            { transformOrigin: "top left", transform: "none" },
            { transformOrigin: "top left", transform: offsetFrom(source.getBoundingClientRect(), from), opacity: 0.2 }
          ],
          { duration: 400, easing: "cubic-bezier(0.5, 0, 0.2, 1)", fill: "forwards" }
        )
      : animate(card, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(0.94)" }], {
          duration: 260,
          fill: "forwards"
        });

    exit.onfinish = () => {
      finish();
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    };
  }

  function play() {
    if (!movie) return;
    const id = movie.id;
    hideNow();
    Player.open(id);
  }

  $("#dClose").addEventListener("click", close);
  backdrop.addEventListener("click", close);
  $("#dPlay").addEventListener("click", play);
  listBtn.addEventListener("click", () => movie && Store.toggleList(movie.id));
  document.addEventListener("userdata", syncList);

  return { open, close, play, isOpen: () => !el.hidden, current: () => movie };
})();
