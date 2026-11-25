function setupVideo(frame) {
  const video = frame.querySelector("video");

  video.addEventListener("error", () => {
    frame.style.setProperty("--video-poster", `url("${video.poster}")`);
    frame.classList.add("video-unavailable");
    video.hidden = true;
  });

  return {
    frame,
    video,
    dialog: frame.closest("dialog"),
    visible: false,
  };
}

export function initVideos() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frames = document.querySelectorAll(".video-frame");
  const dialogs = document.querySelectorAll(".detail-dialog");
  const players = Array.from(frames, setupVideo);

  function syncPlayback() {
    const openDialog = document.querySelector(".detail-dialog[open]");

    for (const { video, dialog, visible } of players) {
      const inCurrentView = dialog ? openDialog === dialog : !openDialog;
      const shouldPlay = visible && inCurrentView && !document.hidden &&
        !reducedMotion.matches && !video.error;

      if (shouldPlay && video.paused) {
        video.play().catch(() => {
          // A browser that blocks autoplay keeps the poster visible.
        });
      } else if (!shouldPlay && !video.paused) {
        video.pause();
      }
    }
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const player = players.find(({ frame }) => frame === entry.target);
      player.visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
    }

    syncPlayback();
  }, { threshold: 0.15 });

  const dialogObserver = new MutationObserver(syncPlayback);

  for (const dialog of dialogs) {
    dialogObserver.observe(dialog, { attributeFilter: ["open"] });
  }

  for (const { frame } of players) {
    observer.observe(frame);
  }

  reducedMotion.addEventListener("change", syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
}
