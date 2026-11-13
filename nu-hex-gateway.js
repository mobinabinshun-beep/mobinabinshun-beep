/* N.U Hex Gateway — shared navigation controller for all internal spaces */
(() => {
  "use strict";
  const root = document.getElementById("nu-hex-gateway");
  const scrim = document.querySelector(".nu-gateway-scrim");
  if (!root || !scrim) return;

  const trigger = root.querySelector(".nu-gateway-trigger");
  const items = [...root.querySelectorAll(".nu-gateway-item")];
  const pauseButton = document.getElementById("finish-round");
  let open = false;
  let pausedByGateway = false;
  let selected = null;
  let clickArmed = null;
  let hoverTimer = 0;
  let activationTimer = 0;
  let outsideSince = 0;

  items.forEach((item, index) => {
    item.tabIndex = -1;
    const angle = (115 + index * 20) * Math.PI / 180;
    item.style.setProperty("--gx", `${Math.cos(angle) * 116}px`);
    item.style.setProperty("--gy", `${Math.sin(angle) * 116}px`);
  });

  function goHome() {
    const home = document.getElementById("menu-home");
    if (home) home.click();
    else window.location.href = "./index.html";
  }

  function openMainView(view) {
    const home = document.getElementById("menu-home");
    const target = document.getElementById("menu-" + view);
    if (target) {
      if (home) home.click();
      target.click();
    } else {
      window.location.href = "./index.html?view=" + encodeURIComponent(view);
    }
  }

  const routes = {
    back: goHome,
    library: () => {
      const library = document.getElementById("menu-library");
      if (library) {
        goHome();
        library.click();
      } else {
        window.location.href = "./index.html#library-section";
      }
    },
    store: () => openMainView("store"),
    wallet: () => openMainView("wallet"),
    profile: () => openMainView("profile"),\n    resume: () => {},
    launcher: () => { window.location.href = "./launcher.html"; },
    studio: () => { window.location.href = "./pixel-art-studio.html"; }
  };

  function pauseGame() {
    const gameVisible = document.getElementById("game-view")?.classList.contains("active");
    if (gameVisible && pauseButton && pauseButton.textContent.trim() === "PAUSE ROUND") {
      pauseButton.click();
      pausedByGateway = true;
    }
  }

  function resumeGame() {
    if (pausedByGateway && pauseButton && pauseButton.textContent.trim() === "RESUME ROUND") {
      pauseButton.click();
    }
    pausedByGateway = false;
  }

  function setOpen(next, shouldResume = true) {
    if (open === next) return;
    open = next;
    root.classList.toggle("is-open", open);
    document.body.classList.toggle("nu-gateway-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close N.U navigation gateway" : "Open N.U navigation gateway");
    items.forEach(item => { item.tabIndex = open ? 0 : -1; });

    if (open) {
      pauseGame();
      trigger.focus({ preventScroll: true });
    } else {
      clearTimeout(hoverTimer);
      clearTimeout(activationTimer);
      selected = null;
      clickArmed = null;
      items.forEach(item => item.classList.remove("is-selected", "is-confirming"));
      if (shouldResume) resumeGame();
      else pausedByGateway = false;
    }
  }

  function select(item) {
    if (selected && selected !== item) selected.classList.remove("is-selected");
    selected = item;
    item.classList.add("is-selected");
  }

  function activate(item) {
    const action = routes[item.dataset.action];
    if (!action) return;
    item.classList.add("is-confirming");
    clearTimeout(activationTimer);
    activationTimer = window.setTimeout(() => {
      setOpen(false, false);
      action();
    }, 430);
  }

  function confirm(item) {
    if (clickArmed === item) {
      activate(item);
    } else {
      select(item);
      clickArmed = item;
    }
  }

  trigger.addEventListener("click", event => {
    event.preventDefault();
    setOpen(!open);
  });

  trigger.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") setOpen(true);
  });

  items.forEach(item => {
    item.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse" || !open) return;
      select(item);
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activate(item), 320);
    });

    item.addEventListener("pointerleave", () => {
      clearTimeout(hoverTimer);
      clearTimeout(activationTimer);
    });

    item.addEventListener("focus", () => select(item));

    item.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      clearTimeout(hoverTimer);
      confirm(item);
    });
  });

  scrim.addEventListener("click", () => setOpen(false));

  document.addEventListener("pointermove", event => {
    if (!open || event.pointerType !== "mouse") return;
    const tolerance = 10;
    const inside = [trigger, ...items].some(element => {
      const rect = element.getBoundingClientRect();
      return event.clientX >= rect.left - tolerance &&
        event.clientX <= rect.right + tolerance &&
        event.clientY >= rect.top - tolerance &&
        event.clientY <= rect.bottom + tolerance;
    });

    if (inside) {
      outsideSince = 0;
    } else if (!outsideSince) {
      outsideSince = performance.now();
    } else if (performance.now() - outsideSince > 90) {
      setOpen(false);
    }
  }, { passive: true });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && open) setOpen(false);
  });

  window.addEventListener("blur", () => {
    if (open) setOpen(false);
  });

  window.addEventListener("pagehide", () => {
    if (open) setOpen(false);
  });

  const initialView = new URLSearchParams(window.location.search).get("view");
  if (["store", "wallet", "profile"].includes(initialView)) {
    document.getElementById("menu-" + initialView)?.click();
  }
})();
