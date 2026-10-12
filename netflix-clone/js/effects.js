// Pointer glow, card tilt, magnetic buttons, hero parallax and scroll reveals.
const Effects = (() => {
  const root = document.documentElement;
  const navbar = $("#navbar");
  const heroArt = $("#heroArt");

  let scrollTop = 0;
  let px = 0;
  let py = 0;
  let queued = false;
  let magnet = null;
  let tilted = null;

  function paint() {
    queued = false;
    navbar.classList.toggle("scrolled", scrollTop > 40);
    if (motionOff()) {
      heroArt.style.transform = "";
      return;
    }
    if (scrollTop > innerHeight * 1.1) return;
    heroArt.style.transform = `translate3d(${(px * -14).toFixed(1)}px, ${(scrollTop * 0.28 - py * 10).toFixed(1)}px, 0)`;
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paint);
  }

  function resetMagnet() {
    if (!magnet) return;
    magnet.style.removeProperty("--tx");
    magnet.style.removeProperty("--ty");
    magnet = null;
  }

  function resetTilt() {
    if (!tilted) return;
    tilted.style.removeProperty("--rx");
    tilted.style.removeProperty("--ry");
    tilted = null;
  }

  function onPointer(e) {
    if (e.pointerType === "touch") return;
    px = (e.clientX / innerWidth - 0.5) * 2;
    py = (e.clientY / innerHeight - 0.5) * 2;
    queue();

    const target = e.target;
    if (!(target instanceof Element)) return;

    if (root.dataset.glow !== "off") {
      const lit = target.closest(".glass, .poster-card");
      if (lit) {
        const r = lit.getBoundingClientRect();
        lit.style.setProperty("--mx", `${(e.clientX - r.left).toFixed(0)}px`);
        lit.style.setProperty("--my", `${(e.clientY - r.top).toFixed(0)}px`);
      }
    }

    if (motionOff()) {
      resetMagnet();
      resetTilt();
      return;
    }

    const card = target.closest(".poster-card");
    if (tilted && tilted !== card) resetTilt();
    if (card) {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--rx", `${((0.5 - y) * 9).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
      tilted = card;
    }

    const pull = target.closest("[data-magnetic]");
    if (magnet && magnet !== pull) resetMagnet();
    if (pull) {
      const r = pull.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      pull.style.setProperty("--tx", `${clamp(dx * 0.22, -9, 9).toFixed(1)}px`);
      pull.style.setProperty("--ty", `${clamp(dy * 0.22, -9, 9).toFixed(1)}px`);
      magnet = pull;
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  function reveal(scope = document) {
    $$(".reveal:not(.in)", scope).forEach((el) => io.observe(el));
  }

  window.addEventListener(
    "scroll",
    () => {
      scrollTop = window.scrollY;
      queue();
    },
    { passive: true }
  );
  document.addEventListener("pointermove", onPointer, { passive: true });
  root.addEventListener("mouseleave", () => {
    resetMagnet();
    resetTilt();
  });

  scrollTop = window.scrollY;
  queue();

  return { reveal };
})();
