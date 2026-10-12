// Video player and its keyboard controls.
const Player = (() => {
  const el = $("#player");
  const video = $("#video");
  const seek = $("#pSeek");
  const vol = $("#pVol");
  const bright = $("#pBright");
  const spinner = $("#pSpin");
  const errorBox = $("#pError");
  const playBtns = [$("#pPlay"), $("#pCenter")];
  const speeds = [1, 1.25, 1.5, 2, 0.75];

  let movie = null;
  let idleTimer = 0;
  let lastSave = 0;
  let speedIndex = 0;

  function setIcons() {
    const name = video.paused ? "play" : "pause";
    playBtns.forEach((b) => (b.innerHTML = icon(name)));
    el.classList.toggle("paused", video.paused);
    $("#pMute").innerHTML = icon(video.muted || video.volume === 0 ? "mute" : "volume");
  }

  function wake() {
    el.classList.remove("idle");
    clearTimeout(idleTimer);
    if (!video.paused) idleTimer = setTimeout(() => el.classList.add("idle"), 2800);
  }

  function persist() {
    if (!movie || !video.duration) return;
    if (video.currentTime / video.duration > 0.97) Store.clearProgress(movie.id);
    else Store.setProgress(movie.id, video.currentTime, video.duration);
  }

  function toggle() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function skip(seconds) {
    if (!video.duration) return;
    video.currentTime = clamp(video.currentTime + seconds, 0, video.duration);
  }

  function setVolume(v) {
    video.volume = clamp(v, 0, 1);
    video.muted = video.volume === 0;
    vol.value = Math.round(video.volume * 100);
    paintSlider(vol);
    Store.update({ volume: video.volume });
    setIcons();
  }

  function toggleMute() {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 0.5;
      vol.value = Math.round(video.volume * 100);
    } else {
      video.muted = true;
    }
    paintSlider(vol);
    setIcons();
  }

  function setBrightness(v) {
    bright.value = v;
    video.style.filter = `brightness(${v / 100})`;
    paintSlider(bright);
    Store.update({ brightness: v });
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  }

  function showError(message) {
    spinner.hidden = true;
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function open(id) {
    movie = movies.find((m) => m.id === id);
    if (!movie) return;
    el.hidden = false;
    syncLock();
    $("#pTitle").textContent = movie.title;
    errorBox.hidden = true;
    spinner.hidden = false;
    speedIndex = 0;
    $("#pSpeed").textContent = "1x";
    seek.value = 0;
    paintSlider(seek);
    $("#pCur").textContent = "0:00";
    $("#pDur").textContent = "0:00";

    video.volume = Store.state.volume;
    video.muted = false;
    vol.value = Math.round(Store.state.volume * 100);
    paintSlider(vol);
    setBrightness(Store.state.brightness);

    video.addEventListener(
      "loadedmetadata",
      () => {
        const saved = Store.state.progress[movie.id];
        if (saved && saved.time > 5 && saved.time < video.duration - 10) video.currentTime = saved.time;
      },
      { once: true }
    );
    video.src = movie.video;
    video.play().catch(() => {});

    animate(el, [{ opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1 }], {
      duration: 420,
      easing: "cubic-bezier(0.34, 1.3, 0.64, 1)"
    });
    setIcons();
    wake();
    $("#pClose").focus({ preventScroll: true });
  }

  function close() {
    if (el.hidden) return;
    persist();
    video.pause();
    video.removeAttribute("src");
    video.load();
    if (document.fullscreenElement) document.exitFullscreen();
    el.hidden = true;
    movie = null;
    clearTimeout(idleTimer);
    syncLock();
    document.dispatchEvent(new Event("userdata"));
  }

  function key(e) {
    switch (e.key) {
      case " ":
      case "k":
        toggle();
        return true;
      case "ArrowRight":
        skip(10);
        return true;
      case "ArrowLeft":
        skip(-10);
        return true;
      case "ArrowUp":
        setVolume(video.volume + 0.1);
        return true;
      case "ArrowDown":
        setVolume(video.volume - 0.1);
        return true;
      case "m":
      case "M":
        toggleMute();
        return true;
      case "f":
      case "F":
        toggleFullscreen();
        return true;
    }
    return false;
  }

  video.addEventListener("timeupdate", () => {
    if (!video.duration) return;
    $("#pCur").textContent = formatTime(video.currentTime);
    if (document.activeElement !== seek || !seek.matches(":active")) {
      seek.value = (video.currentTime / video.duration) * 1000;
      paintSlider(seek);
    }
    if (Date.now() - lastSave > 3000) {
      lastSave = Date.now();
      persist();
    }
  });
  video.addEventListener("loadedmetadata", () => ($("#pDur").textContent = formatTime(video.duration)));
  video.addEventListener("play", () => {
    setIcons();
    wake();
  });
  video.addEventListener("pause", () => {
    setIcons();
    wake();
  });
  video.addEventListener("waiting", () => (spinner.hidden = false));
  video.addEventListener("playing", () => (spinner.hidden = true));
  video.addEventListener("canplay", () => (spinner.hidden = true));
  video.addEventListener("ended", () => {
    persist();
    setIcons();
  });
  video.addEventListener("error", () => {
    if (!video.getAttribute("src")) return;
    showError("This video could not be loaded. Check your internet connection and try again.");
  });
  video.addEventListener("click", toggle);

  seek.addEventListener("input", () => {
    if (!video.duration) return;
    video.currentTime = (seek.value / 1000) * video.duration;
    $("#pCur").textContent = formatTime(video.currentTime);
    paintSlider(seek);
  });
  vol.addEventListener("input", () => setVolume(vol.value / 100));
  bright.addEventListener("input", () => setBrightness(Number(bright.value)));
  [seek, vol, bright].forEach((r) => r.addEventListener("pointerup", () => r.blur()));

  playBtns.forEach((b) => b.addEventListener("click", toggle));
  $("#pMute").addEventListener("click", toggleMute);
  $("#pFull").addEventListener("click", toggleFullscreen);
  $("#pClose").addEventListener("click", close);
  $("#pSpeed").addEventListener("click", () => {
    speedIndex = (speedIndex + 1) % speeds.length;
    video.playbackRate = speeds[speedIndex];
    $("#pSpeed").textContent = `${speeds[speedIndex]}x`;
  });
  $("#playerUi").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) toggle();
  });

  ["pointermove", "pointerdown", "touchstart"].forEach((type) =>
    el.addEventListener(type, wake, { passive: true })
  );
  window.addEventListener("pagehide", persist);

  return { open, close, key, isOpen: () => !el.hidden };
})();
