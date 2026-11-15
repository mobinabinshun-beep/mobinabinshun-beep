/* N.U Adaptive Performance Governor v0.1
 * Isolated runtime governor: observes real frame pacing and adjusts the shared
 * graphics budget. It does not run synthetic stress tests or touch game state.
 * ES5 syntax is intentional for a wider legacy-browser parse surface.
 */
(function (g) {
  "use strict";
  if (g.NUAdaptiveGovernor) return;

  var profile = null;
  var ceilingLevel = 10;
  var savedProfile = null;
  var running = false;
  var timer = 0;
  var fastWindows = 0;
  var windows = 0;
  var lastDecision = "waiting-for-profile";
  var MIN_LEVEL = 1;
  var MAX_LEVEL = 10;
  var SAMPLE_FRAMES = 24;
  var SAMPLE_DELAY = 4000;

  function now() {
    return g.performance && typeof g.performance.now === "function"
      ? g.performance.now()
      : new Date().getTime();
  }

  function hidden() {
    return !!(g.document && g.document.hidden);
  }

  function schedule(delay) {
    if (timer) g.clearTimeout(timer);
    timer = g.setTimeout(sampleWindow, delay);
  }

  function requestFrame(callback) {
    var raf = g.requestAnimationFrame || g.webkitRequestAnimationFrame ||
      g.mozRequestAnimationFrame || g.msRequestAnimationFrame;
    if (raf) raf.call(g, callback);
    else g.setTimeout(function () { callback(now()); }, 16);
  }

  function readLauncherProfile() {
    try {
      if (!g.localStorage) return null;
      var value = g.localStorage.getItem("nu-launcher-calibration-v1");
      if (!value) return null;
      var parsed = JSON.parse(value);
      return parsed && typeof parsed.level === "number" ? parsed : null;
    } catch (ignore) {
      return null;
    }
  }

  function persistProfile() {
    if (!savedProfile || !g.localStorage || !profile) return;
    try {
      savedProfile.level = profile.level;
      savedProfile.adaptive = profile.adaptive;
      savedProfile.lastAdaptiveAt = new Date().toISOString();
      g.localStorage.setItem("nu-launcher-calibration-v1", JSON.stringify(savedProfile));
    } catch (ignore) {}
  }

  function publish(nextLevel, reason, average, slowPercent) {
    if (!profile || !g.NUGraphicsCore || typeof g.NUGraphicsCore.budget !== "function") return;
    var level = Math.max(MIN_LEVEL, Math.min(ceilingLevel, nextLevel));
    if (level === profile.level) {
      lastDecision = "hold";
      return;
    }

    var next = {};
    var key;
    for (key in profile) {
      if (Object.prototype.hasOwnProperty.call(profile, key)) next[key] = profile[key];
    }
    next.level = level;
    next.budget = g.NUGraphicsCore.budget(level);
    next.locked = false;
    next.adaptive = {
      enabled: true,
      reason: reason,
      averageFrameMs: Math.round(average * 10) / 10,
      slowFramePercent: Math.round(slowPercent),
      adjustedAt: new Date().toISOString()
    };

    profile = next;
    g.NUGraphicsProfile = next;
    persistProfile();
    if (g.NUGameRenderAdapter && typeof g.NUGameRenderAdapter.apply === "function") {
      g.NUGameRenderAdapter.apply(next);
    }
    if (g.NUPixelWorld && typeof g.NUPixelWorld.setQuality === "function") {
      g.NUPixelWorld.setQuality(level);
    }
    lastDecision = reason;
    windows = 0;
    fastWindows = 0;

    var event;
    try {
      event = new g.CustomEvent("nu:graphics-adjusted", { detail: next });
    } catch (ignore) {
      event = g.document.createEvent("CustomEvent");
      event.initCustomEvent("nu:graphics-adjusted", false, false, next);
    }
    g.dispatchEvent(event);
  }

  function sampleWindow() {
    timer = 0;
    if (!running) return;
    if (hidden()) {
      schedule(SAMPLE_DELAY);
      return;
    }

    var frames = [];
    var previous = null;
    function tick(stamp) {
      if (!running || hidden()) {
        schedule(SAMPLE_DELAY);
        return;
      }
      var current = typeof stamp === "number" ? stamp : now();
      if (previous !== null) frames.push(current - previous);
      previous = current;
      if (frames.length < SAMPLE_FRAMES) {
        requestFrame(tick);
        return;
      }

      var total = 0;
      var slow = 0;
      var i;
      for (i = 0; i < frames.length; i++) {
        total += frames[i];
        if (frames[i] > 50) slow++;
      }
      var average = total / frames.length;
      var slowPercent = slow * 100 / frames.length;
      windows++;

      if (average > 48 || slowPercent >= 30) {
        fastWindows = 0;
        publish(profile.level - 1, "frame-pressure", average, slowPercent);
      } else if (average < 27 && slowPercent <= 5) {
        fastWindows++;
        if (fastWindows >= 3) {
          publish(profile.level + 1, "headroom-available", average, slowPercent);
        } else {
          lastDecision = "observing-headroom";
        }
      } else {
        fastWindows = 0;
        lastDecision = "hold";
      }
      schedule(SAMPLE_DELAY);
    }
    requestFrame(tick);
  }

  function start(initial) {
    if (running || !initial || !initial.budget || !g.NUGraphicsCore) return;
    profile = initial;
    g.NUGraphicsProfile = initial;
    savedProfile = readLauncherProfile();
    ceilingLevel = savedProfile
      ? Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Number(savedProfile.stableLevel) || Number(savedProfile.level) || initial.level))
      : Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Number(initial.level) || 3));
    if (savedProfile) {
      profile = {};
      var key;
      for (key in initial) {
        if (Object.prototype.hasOwnProperty.call(initial, key)) profile[key] = initial[key];
      }
      profile.level = Math.max(MIN_LEVEL, Math.min(ceilingLevel, Number(savedProfile.level) || initial.level));
      profile.budget = g.NUGraphicsCore.budget(profile.level);
      profile.launcherCalibrated = true;
      g.NUGraphicsProfile = profile;
      if (g.NUGameRenderAdapter && typeof g.NUGameRenderAdapter.apply === "function") {
        g.NUGameRenderAdapter.apply(profile);
      }
      if (g.NUPixelWorld && typeof g.NUPixelWorld.setQuality === "function") {
        g.NUPixelWorld.setQuality(profile.level);
      }
    }
    running = true;
    lastDecision = "monitoring";
    schedule(1500);
  }

  function stop() {
    running = false;
    if (timer) g.clearTimeout(timer);
    timer = 0;
  }

  g.NUAdaptiveGovernor = {
    start: start,
    stop: stop,
    getState: function () {
      return {
        running: running,
        level: profile ? profile.level : null,
        ceilingLevel: ceilingLevel,
        launcherCalibrated: !!savedProfile,
        windows: windows,
        fastWindows: fastWindows,
        lastDecision: lastDecision
      };
    }
  };

  g.addEventListener("nu:graphics-profile", function (event) {
    start(event && event.detail);
  });
  g.addEventListener("pagehide", stop);
  g.addEventListener("pageshow", function () {
    if (profile && !running) start(profile);
  });
  if (g.NUGraphicsProfile) start(g.NUGraphicsProfile);
})(window);
