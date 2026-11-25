function isPlainClick(event) {
  return !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey;
}

function setupDialog(dialog) {
  let pressedBackdrop = false;

  dialog.querySelector("[data-close]").addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("pointerdown", (event) => {
    pressedBackdrop = event.target === dialog;
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && pressedBackdrop) {
      dialog.close();
    }

    pressedBackdrop = false;
  });

  const contactLink = dialog.querySelector("[data-dialog-contact]");

  contactLink?.addEventListener("click", (event) => {
    if (isPlainClick(event)) {
      dialog.close();
    }
  });
}

function setupTeamProfiles() {
  const dialog = document.getElementById("dettaglio-studio");
  const toolbar = dialog.querySelector(".dialog-toolbar");

  for (const profile of dialog.querySelectorAll(".team-profile")) {
    profile.addEventListener("toggle", () => {
      if (!profile.open || !dialog.open) {
        return;
      }

      const card = profile.getBoundingClientRect();
      const panel = dialog.getBoundingClientRect();
      const toolbarBottom = toolbar.getBoundingClientRect().bottom;
      const overflow = card.bottom - panel.bottom + 12;
      const available = card.top - toolbarBottom - 12;

      if (overflow > 0 && available > 0) {
        dialog.scrollBy(0, Math.min(overflow, available));
      }
    });
  }
}

export function initDetails() {
  if (typeof HTMLDialogElement === "undefined" ||
      typeof HTMLDialogElement.prototype.showModal !== "function") {
    return;
  }

  for (const dialog of document.querySelectorAll(".detail-dialog")) {
    setupDialog(dialog);
  }

  for (const trigger of document.querySelectorAll("[data-dialog]")) {
    const dialog = document.getElementById(trigger.dataset.dialog);

    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", dialog.id);
    trigger.addEventListener("click", (event) => {
      if (!isPlainClick(event)) {
        return;
      }

      event.preventDefault();
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  }

  setupTeamProfiles();
}
