/* N.U Hex Gateway — isolated, reversible navigation controller */
(() => {
  "use strict";
  const root = document.getElementById("nu-hex-gateway");
  const scrim = document.querySelector(".nu-gateway-scrim");
  if (!root || !scrim) return;
  const trigger = root.querySelector(".nu-gateway-trigger");
  const items = [...root.querySelectorAll(".nu-gateway-item")];
  const pauseButton = document.getElementById("finish-round");
  let open = false, pausedByGateway = false, selected = null, hoverTimer = 0, outsideSince = 0;
  const routes = {
    back: () => document.getElementById("menu-home")?.click(),
    library: () => document.getElementById("menu-library")?.click(),
    store: () => document.getElementById("menu-store")?.click(),
    wallet: () => document.getElementById("menu-wallet")?.click(),
    profile: () => document.getElementById("menu-profile")?.click(),
    launcher: () => { window.location.href = "./launcher.html"; },
    studio: () => { window.location.href = "./pixel-art-studio.html"; }
  };
  function pauseGame() {
    const gameVisible = document.getElementById("game-view")?.classList.contains("active");
    if (gameVisible && pauseButton && pauseButton.textContent.trim() === "PAUSE ROUND") {
      pauseButton.click(); pausedByGateway = true;
    }
  }
  function resumeGame() {
    if (pausedByGateway && pauseButton && pauseButton.textContent.trim() === "RESUME ROUND") pauseButton.click();
    pausedByGateway = false;
  }
  function setOpen(next) {
    if (open === next) return;
    open = next;
    root.classList.toggle("is-open", open);
    document.body.classList.toggle("nu-gateway-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    trigger.setAttribute("aria-label", open ? "Close N.U navigation gateway" : "Open N.U navigation gateway");
    if (open) { pauseGame(); trigger.focus({preventScroll:true}); }
    else { clearTimeout(hoverTimer); selected = null; items.forEach(i => i.classList.remove("is-selected","is-confirming")); resumeGame(); }
  }
  function select(item) {
    if (selected && selected !== item) selected.classList.remove("is-selected");
    selected = item; item.classList.add("is-selected");
  }
  function activate(item) {
    const key = item.dataset.action;
    const action = routes[key];
    if (!action) return;
    item.classList.add("is-confirming");
    window.setTimeout(() => { setOpen(false); action(); }, 430);
  }
  function confirm(item) {
    if (selected === item) activate(item);
    else select(item);
  }
  trigger.addEventListener("click", e => { e.preventDefault(); setOpen(!open); });
  trigger.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") setOpen(true); });
  root.addEventListener("pointerleave", e => { if (e.pointerType === "mouse" && open) { clearTimeout(hoverTimer); } });
  items.forEach(item => {
    item.addEventListener("pointerenter", e => {
      if (e.pointerType !== "mouse" || !open) return;
      select(item);
      clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(() => activate(item), 320);
    });
    item.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
    item.addEventListener("click", e => {
      e.preventDefault(); e.stopPropagation(); clearTimeout(hoverTimer);
      confirm(item);
    });
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); confirm(item); }
    });
  });
  scrim.addEventListener("click", () => setOpen(false));
  document.addEventListener("pointermove", e => {
    if (!open || e.pointerType !== "mouse") return;
    const r = root.getBoundingClientRect(), pad = 10;
    const inside = e.clientX >= r.left-pad && e.clientX <= r.right+pad && e.clientY >= r.top-pad && e.clientY <= r.bottom+pad;
    if (inside) outsideSince = 0;
    else if (!outsideSince) outsideSince = performance.now();
    else if (performance.now() - outsideSince > 90) setOpen(false);
  }, {passive:true});
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && open) setOpen(false);
  });
  window.addEventListener("blur", () => { if (open) setOpen(false); });
  window.addEventListener("pagehide", () => { if (open) setOpen(false); });
  trigger.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !open) setOpen(true); });
  // Touch: first tap opens/selects; second tap on the same destination confirms.
  root.addEventListener("touchstart", () => { if (!open) setOpen(true); }, {passive:true});
})();
