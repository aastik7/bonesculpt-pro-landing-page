(() => {
  'use strict';

  document.documentElement.classList.add('js-ready');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[data-demo]')];
  const motionButton = document.querySelector('.motion-toggle');
  const tabs = [...document.querySelectorAll('[data-scene]')];
  const panels = [...document.querySelectorAll('[data-scene-panel]')];
  const sceneSection = document.querySelector('.demos');
  const available = new Set();
  const unavailable = new Set();
  const inView = new Set();
  const manuallyPaused = new WeakSet();
  const automaticPauses = new WeakSet();
  let motionPaused = reducedMotion.matches;
  let mediaObserver;
  const sceneDuration = 5000;
  const fullscreenVideos = new Set();
  let activeTab = tabs[0];
  let sceneInView = false;
  let sceneElapsed = 0;
  let sceneLastTick = null;
  let sceneFrame = 0;

  function updateMotionButton() {
    if (!motionButton) return;
    motionButton.hidden = false;
    const hasDemos = tabs.length > 1 || available.size > 0;
    motionButton.disabled = !hasDemos;
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.querySelector('[data-motion-label]').textContent = !hasDemos
      ? (unavailable.size === videos.length ? 'Previews unavailable' : 'Loading previews')
      : (motionPaused ? 'Play demos' : 'Pause demos');
  }

  function pauseAutomatically(video) {
    if (video.paused) return;
    automaticPauses.add(video);
    video.pause();
  }

  function playAutomatically(video) {
    if (motionPaused || document.hidden || manuallyPaused.has(video) || !inView.has(video)
      || unavailable.has(video) || video.closest('[data-scene-panel][hidden]')) return;
    video.play().catch(() => { /* Native controls remain usable if autoplay is blocked. */ });
  }

  function showFallback(video) {
    const frame = video.closest('[data-media-frame]');
    unavailable.add(video);
    available.delete(video);
    pauseAutomatically(video);
    video.hidden = true;
    frame?.querySelector('.media-fallback')?.removeAttribute('hidden');
    frame?.querySelector('.media-unavailable')?.removeAttribute('hidden');
    mediaObserver?.unobserve(video);
    updateMotionButton();
  }

  function restoreVideo(video) {
    const frame = video.closest('[data-media-frame]');
    unavailable.delete(video);
    available.add(video);
    video.hidden = false;
    frame?.querySelector('.media-fallback')?.setAttribute('hidden', '');
    frame?.querySelector('.media-unavailable')?.setAttribute('hidden', '');
    mediaObserver?.observe(video);
    updateMotionButton();
  }

  function canRotateScenes() {
    return tabs.length > 1 && !motionPaused && !document.hidden && sceneInView
      && !document.fullscreenElement && !fullscreenVideos.size;
  }

  function renderSceneProgress() {
    tabs.forEach((tab) => tab.style.setProperty('--scene-progress',
      tab === activeTab ? String(Math.min(sceneElapsed / sceneDuration, 1)) : '0'));
  }

  function rotateScene(now) {
    sceneFrame = 0;
    if (!canRotateScenes()) { updateSceneRotation(); return; }
    sceneElapsed += now - sceneLastTick;
    sceneLastTick = now;
    if (sceneElapsed >= sceneDuration) {
      selectScene(tabs[(tabs.indexOf(activeTab) + 1) % tabs.length]);
      return;
    }
    renderSceneProgress();
    sceneFrame = requestAnimationFrame(rotateScene);
  }

  function updateSceneRotation() {
    const now = performance.now();
    if (sceneLastTick !== null) sceneElapsed += now - sceneLastTick;
    sceneLastTick = null;
    cancelAnimationFrame(sceneFrame);
    sceneFrame = 0;
    renderSceneProgress();
    if (canRotateScenes()) {
      sceneLastTick = now;
      sceneFrame = requestAnimationFrame(rotateScene);
    }
  }

  // One full-size guided player at a time. With no JS, all guides remain usable.
  function selectScene(tab, focus = false) {
    activeTab = tab;
    sceneElapsed = 0;
    sceneLastTick = null;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.scenePanel === tab.dataset.scene;
      panel.hidden = !selected;
      panel.querySelectorAll('video').forEach((video) => {
        if (!selected) { inView.delete(video); pauseAutomatically(video); }
        // Re-observing a previously hidden scene refreshes its intersection state.
        if (selected && mediaObserver && !unavailable.has(video)) {
          mediaObserver.unobserve(video);
          mediaObserver.observe(video);
        }
      });
    });
    if (focus) tab.focus();
    // Every manual selection, including the active tab, starts a fresh five seconds.
    // Focus on a clicked tab does not block the next automatic selection.
    updateSceneRotation();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScene(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectScene(tabs[next], true);
    });
  });
  if (tabs.length) {
    selectScene(tabs[0]);
    document.querySelector('.scene-tabs').hidden = false;
  }

  videos.forEach((video) => {
    video.muted = true;
    video.addEventListener('loadedmetadata', () => {
      restoreVideo(video);
      playAutomatically(video);
    });
    video.addEventListener('pause', () => {
      if (automaticPauses.has(video)) automaticPauses.delete(video);
      else if (!video.ended) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
    video.addEventListener('error', () => showFallback(video));
    video.querySelectorAll('source').forEach((source) => source.addEventListener('error', () => {
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || video.querySelectorAll('source').length === 1) showFallback(video);
    }));
    const posterProbe = new Image();
    posterProbe.onerror = () => { video.poster = './media/interface.webp'; };
    posterProbe.src = video.poster;
    // Initial NETWORK_NO_SOURCE can be transient. Only real errors trigger fallback;
    // successful metadata restores a video even after a prior failure.
    if (video.error) showFallback(video);
    else if (video.readyState >= HTMLMediaElement.HAVE_METADATA) restoreVideo(video);
    video.addEventListener('webkitbeginfullscreen', () => {
      fullscreenVideos.add(video);
      updateSceneRotation();
    });
    video.addEventListener('webkitendfullscreen', () => {
      fullscreenVideos.delete(video);
      updateSceneRotation();
    });
  });

  if ('IntersectionObserver' in window) {
    mediaObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { inView.add(entry.target); playAutomatically(entry.target); }
      else { inView.delete(entry.target); pauseAutomatically(entry.target); }
    }), { threshold: .25 });
    videos.forEach((video) => { if (!unavailable.has(video)) mediaObserver.observe(video); });
  }
  // Without IntersectionObserver, visitors use native controls.
  if (sceneSection) {
    if ('IntersectionObserver' in window) {
      const sceneObserver = new IntersectionObserver(([entry]) => {
        sceneInView = entry.isIntersecting;
        updateSceneRotation();
      });
      sceneObserver.observe(sceneSection);
    } else {
      const updateSceneVisibility = () => {
        const rect = sceneSection.getBoundingClientRect();
        sceneInView = rect.bottom > 0 && rect.top < window.innerHeight
          && rect.right > 0 && rect.left < window.innerWidth;
        updateSceneRotation();
      };
      window.addEventListener('scroll', updateSceneVisibility, { passive: true });
      window.addEventListener('resize', updateSceneVisibility);
      updateSceneVisibility();
    }
  }
  motionButton?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    videos.forEach((video) => {
      if (motionPaused) pauseAutomatically(video);
      else { manuallyPaused.delete(video); playAutomatically(video); }
    });
    updateSceneRotation();
    updateMotionButton();
  });
  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) return;
    motionPaused = true;
    videos.forEach(pauseAutomatically);
    updateSceneRotation();
    updateMotionButton();
  });
  document.addEventListener('visibilitychange', () => {
    videos.forEach((video) => document.hidden ? pauseAutomatically(video) : playAutomatically(video));
    updateSceneRotation();
  });
  document.addEventListener('fullscreenchange', updateSceneRotation);

  // Native named details handle exclusivity where supported. Attribute records
  // provide a fallback that keeps the latest opening, even when toggle events coalesce.
  const helpList = document.querySelector('.details-list');
  const helpDetails = [...document.querySelectorAll('.details-list details')];
  if (helpList) {
    new MutationObserver((records) => {
      let latestOpened;
      records.forEach(({ target, oldValue }) => {
        if (oldValue === null && target.open && helpDetails.includes(target)) latestOpened = target;
      });
      if (latestOpened) helpDetails.forEach((detail) => {
        if (detail !== latestOpened) detail.open = false;
      });
    }).observe(helpList, { subtree: true, attributes: true, attributeFilter: ['open'], attributeOldValue: true });
  }
  updateMotionButton();
})();
