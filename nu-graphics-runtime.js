/* N.U Graphics Runtime v0.5 — image-only background policy. */
(function (g) {
  "use strict";
  var running = false;

  function emitReady(profile) {
    var status = g.NUBackgroundEngine && g.NUBackgroundEngine.getStatus
      ? g.NUBackgroundEngine.getStatus()
      : { state: "unavailable", loaded: false };
    var detail = {
      profile: profile,
      background: status,
      imageOnly: true,
      visualOverlays: "none",
      fallback: status.loaded ? null : "solid-color"
    };
    var event;
    try {
      event = new g.CustomEvent("nu:graphics-ready", { detail: detail });
    } catch (ignore) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent("nu:graphics-ready", false, false, detail);
    }
    g.dispatchEvent(event);
  }

  function start(sample) {
    if (running) return;
    running = true;
    g.NUGraphicsCore.start(sample).then(function (profile) {
      var activeProfile = g.NUGraphicsProfile || profile;
      g.NUBackgroundEngine.mount();
      g.NUBackgroundEngine.setQuality(activeProfile.budget);
      g.NUGameRenderAdapter.apply(activeProfile);

      // Image failure is fail-closed: keep the neutral CSS base and never
      // activate a procedural renderer, canvas, particle system or overlay.
      g.addEventListener("nu:background-ready", function () {
        emitReady(activeProfile);
      }, { once: true });
      g.addEventListener("nu:background-missing", function () {
        emitReady(activeProfile);
      }, { once: true });
      emitReady(activeProfile);
    }).catch(function (error) {
      running = false;
      if (g.console && g.console.warn) g.console.warn("N.U graphics runtime fallback", error);
    });
  }

  g.NUGraphicsRuntime = {
    start: start,
    setGameActive: function () {
      if (g.NUBackgroundEngine) g.NUBackgroundEngine.setMode("ambient");
    },
    setMode: function () {
      if (g.NUBackgroundEngine) g.NUBackgroundEngine.setMode("ambient");
    }
  };

  g.addEventListener("nu:calibrated", function (event) {
    start(event && event.detail && event.detail.performance);
  });
  document.addEventListener("DOMContentLoaded", function () {
    if (g.NUBackgroundEngine) g.NUBackgroundEngine.mount();
  }, { once: true });
})(window);
