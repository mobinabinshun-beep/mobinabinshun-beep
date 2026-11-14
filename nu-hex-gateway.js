/* N.U Hex Gateway — shared, input-calibrated navigation controller */
(() => {
  "use strict";
  const root = document.getElementById("nu-hex-gateway");
  const scrim = document.querySelector(".nu-gateway-scrim");
  const gameView = document.getElementById("game-view");
  // The owner approved Gateway only for the main game page. Other internal
  // pages keep their legacy navigation and remain untouched by this controller.
  if (!root || !scrim || !gameView) return;

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
  let suppressClickUntil = 0;

  function syncGatewayScope() {
    document.body.classList.add("nu-gateway-enabled","nu-main-game-page");
    document.body.classList.toggle("nu-game-active", Boolean(gameView?.classList.contains("active")));
  }
  syncGatewayScope();
  if (gameView) new MutationObserver(syncGatewayScope).observe(gameView, {attributes:true,attributeFilter:["class"]});

  function layoutItems() {
    const compact = window.matchMedia("(max-width: 600px)").matches;
    const radius = compact ? 100 : 112;
    const step = items.length > 1 ? 144 / (items.length - 1) : 0;
    items.forEach((item,index) => {
      item.tabIndex = open ? 0 : -1;
      const angle = (112 + index * step) * Math.PI / 180;
      item.style.setProperty("--gx", `${Math.cos(angle) * radius}px`);
      item.style.setProperty("--gy", `${Math.sin(angle) * radius}px`);
    });
  }
  layoutItems();
  window.addEventListener("resize",layoutItems,{passive:true});
  window.addEventListener("orientationchange",layoutItems,{passive:true});

  function goHome() {
    const home = document.getElementById("menu-home");
    if (home) home.click();
    else window.location.href = "./index.html";
  }
  function openMainView(view) {
    const target = document.getElementById("menu-" + view);
    if (target) {
      const home = document.getElementById("menu-home");
      if (home && target !== home) home.click();
      target.click();
    } else window.location.href = "./index.html?view=" + encodeURIComponent(view);
  }
  const routes = {
    back: goHome,
    library: () => {
      const library = document.getElementById("menu-library");
      if (library) { goHome(); library.click(); }
      else window.location.href = "./index.html#library-section";
    },
    store: () => openMainView("store"),
    wallet: () => openMainView("wallet"),
    profile: () => openMainView("profile"),
    launcher: () => { window.location.href = "./launcher.html"; },
    studio: () => { window.location.href = "./pixel-art-studio.html"; },
    casino: () => { window.location.href = "./casino.html"; },
    resume: () => {
      if (!gameView) window.location.href = "./index.html";
    }
  };

  function pauseGame() {
    const gameVisible = Boolean(gameView?.classList.contains("active"));
    if (gameVisible && pauseButton && pauseButton.textContent.trim() === "PAUSE ROUND") {
      pauseButton.click();
      pausedByGateway = true;
    }
  }
  function resumeGame() {
    if (pausedByGateway && pauseButton && pauseButton.textContent.trim() === "RESUME ROUND") pauseButton.click();
    pausedByGateway = false;
  }
  function clearPending() {
    clearTimeout(hoverTimer);
    clearTimeout(activationTimer);
    hoverTimer = 0;
    activationTimer = 0;
  }
  function setOpen(next, shouldResume = true) {
    if (open === next) return;
    open = next;
    outsideSince = 0;
    root.classList.toggle("is-open", open);
    document.body.classList.toggle("nu-gateway-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close N.U navigation gateway" : "Open N.U navigation gateway");
    items.forEach(item => { item.tabIndex = open ? 0 : -1; });
    if (open) {
      pauseGame();
      trigger.focus({preventScroll:true});
    } else {
      clearPending();
      selected = null;
      clickArmed = null;
      items.forEach(item => item.classList.remove("is-selected","is-confirming"));
      if (shouldResume) resumeGame();
      else pausedByGateway = false;
    }
  }
  function select(item) {
    if (selected && selected !== item) selected.classList.remove("is-selected","is-confirming");
    selected = item;
    item.classList.add("is-selected");
  }
  function activate(item) {
    const actionKey = item.dataset.action;
    const action = routes[actionKey];
    if (!action || !open) return;
    clearPending();
    item.classList.add("is-selected","is-confirming");
    activationTimer = window.setTimeout(() => {
      setOpen(false, actionKey === "resume");
      action();
    }, 420);
  }
  function confirm(item) {
    if (clickArmed === item) activate(item);
    else { select(item); clickArmed = item; }
  }

  trigger.addEventListener("click",event => {
    event.preventDefault();
    setOpen(!open);
  });
  trigger.addEventListener("pointerenter",event => {
    if (event.pointerType === "mouse") setOpen(true);
  });

  items.forEach(item => {
    item.addEventListener("pointerenter",event => {
      if (event.pointerType !== "mouse" || !open) return;
      select(item);
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => {
        if (open && clickArmed !== item) activate(item);
      }, 520);
    });
    item.addEventListener("pointerleave",event => {
      clearTimeout(hoverTimer);
      if (event.pointerType === "mouse") {
        clearTimeout(activationTimer);
        activationTimer = 0;
        if (clickArmed === item) clickArmed = null;
      }
    });
    item.addEventListener("pointerup",event => {
      if (event.pointerType !== "touch" || !open) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClickUntil = Date.now() + 900;
      select(item);
      activate(item);
    });
    item.addEventListener("focus",() => select(item));
    item.addEventListener("click",event => {
      event.preventDefault();
      event.stopPropagation();
      if (Date.now() < suppressClickUntil) return;
      clearTimeout(hoverTimer);
      confirm(item);
    });
  });

  scrim.addEventListener("click",() => setOpen(false));
  document.addEventListener("pointermove",event => {
    if (!open || !["mouse","touch","pen"].includes(event.pointerType)) return;
    const tolerance = 10;
    const inside = [trigger,...items].some(element => {
      const rect = element.getBoundingClientRect();
      return event.clientX >= rect.left - tolerance && event.clientX <= rect.right + tolerance &&
        event.clientY >= rect.top - tolerance && event.clientY <= rect.bottom + tolerance;
    });
    if (inside) outsideSince = 0;
    else if (!outsideSince) outsideSince = performance.now();
    else if (performance.now() - outsideSince > 110) setOpen(false);
  },{passive:true});

  document.addEventListener("keydown",event => {
    if (event.key === "Escape" && open) setOpen(false);
    if (event.key === "Tab" && open) {
      const focusable = items.filter(item => item.tabIndex === 0);
      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault(); trigger.focus();
      }
    }
  });
  window.addEventListener("blur",() => { if (open) setOpen(false); });
  window.addEventListener("pagehide",() => { if (open) setOpen(false); });

  const initialView = new URLSearchParams(window.location.search).get("view");
  if (["store","wallet","profile"].includes(initialView)) document.getElementById("menu-" + initialView)?.click();
})();
