export function initAnimations() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const page = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reveals = document.querySelectorAll("[data-reveal]");
  const parallaxFrames = document.querySelectorAll("[data-parallax]");
  const inView = new Set();
  let frameRequest = 0;

  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.dataset.visible = "";
        revealObserver.unobserve(entry.target);
      }
    }
  }, {
    rootMargin: "80px 0px 120px",
    threshold: 0.05,
  });

  const parallaxObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        inView.add(entry.target);
      } else {
        inView.delete(entry.target);
      }
    }

    requestUpdate();
  });

  function updateParallax() {
    frameRequest = 0;
    const viewportHeight = window.innerHeight;

    const offsets = Array.from(inView, (element) => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const progress = Math.max(-1, Math.min(1, 1 - (2 * center) / viewportHeight));
      const distance = rect.height * Number(element.dataset.parallax);
      const offset = progress * Math.min(Math.abs(distance), 12) * Math.sign(distance);

      return { element, offset };
    });

    for (const { element, offset } of offsets) {
      element.style.setProperty("--parallax-offset", `${offset.toFixed(2)}px`);
    }
  }

  function requestUpdate() {
    if (!frameRequest && inView.size) {
      frameRequest = window.requestAnimationFrame(updateParallax);
    }
  }

  function syncMotion() {
    if (reducedMotion.matches) {
      delete page.dataset.motion;
      revealObserver.disconnect();
      parallaxObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      inView.clear();

      for (const element of parallaxFrames) {
        element.style.removeProperty("--parallax-offset");
      }

      return;
    }

    page.dataset.motion = "";

    for (const element of reveals) {
      if (!element.hasAttribute("data-visible")) {
        revealObserver.observe(element);
      }
    }

    for (const element of parallaxFrames) {
      parallaxObserver.observe(element);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
}
