export function initMenu() {
  const header = document.querySelector(".site-header");
  const toggle = header.querySelector(".menu-toggle");
  const menu = header.querySelector(".site-nav");
  const mobile = window.matchMedia("(max-width: 767px)");

  function isOpen() {
    return toggle.getAttribute("aria-expanded") === "true";
  }

  function setOpen(open) {
    menu.hidden = mobile.matches && !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  }

  function syncLayout() {
    const hadToggleFocus = document.activeElement === toggle;
    const hadMenuFocus = menu.contains(document.activeElement);

    toggle.hidden = !mobile.matches;

    if (mobile.matches && hadMenuFocus) {
      toggle.focus({ preventScroll: true });
    }

    setOpen(false);

    if (!mobile.matches && hadToggleFocus) {
      menu.querySelector("a").focus({ preventScroll: true });
    }
  }

  toggle.addEventListener("click", () => {
    setOpen(!isOpen());
  });

  menu.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link || !isOpen()) {
      return;
    }

    const destination = document.getElementById(link.hash.slice(1));

    if (destination) {
      destination.tabIndex = -1;
      destination.focus({ preventScroll: true });
    }

    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      toggle.focus({ preventScroll: true });
      setOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (isOpen() && !header.contains(event.target)) {
      if (menu.contains(document.activeElement)) {
        toggle.focus({ preventScroll: true });
      }

      setOpen(false);
    }
  });

  header.addEventListener("focusout", (event) => {
    if (isOpen() && event.relatedTarget && !header.contains(event.relatedTarget)) {
      setOpen(false);
    }
  });

  mobile.addEventListener("change", syncLayout);

  header.dataset.menuReady = "";
  syncLayout();
}
