(() => {
  'use strict';

  document.documentElement.classList.add('js-ready');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[data-demo]')];
  const motionButton = document.querySelector('.motion-toggle');
  const available = new Set();
  const unavailable = new Set();
  const inView = new Set();
  const manuallyPaused = new WeakSet();
  const automaticPauses = new WeakSet();
  let motionPaused = reducedMotion.matches;
  let mediaObserver;

  function updateMotionButton() {
    if (!motionButton) return;
    motionButton.hidden = false;
    motionButton.disabled = !available.size;
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.querySelector('[data-motion-label]').textContent = !available.size
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

  // One full-size guided player at a time. With no JS, all guides remain usable.
  const tabs = [...document.querySelectorAll('[data-scene]')];
  const panels = [...document.querySelectorAll('[data-scene-panel]')];
  function selectScene(tab, focus = false) {
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
  });

  if ('IntersectionObserver' in window) {
    mediaObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { inView.add(entry.target); playAutomatically(entry.target); }
      else { inView.delete(entry.target); pauseAutomatically(entry.target); }
    }), { threshold: .25 });
    videos.forEach((video) => { if (!unavailable.has(video)) mediaObserver.observe(video); });
  }
  // Without IntersectionObserver, visitors use native controls.
  motionButton?.addEventListener('click', () => {
    motionPaused = !motionPaused;
    videos.forEach((video) => {
      if (motionPaused) pauseAutomatically(video);
      else { manuallyPaused.delete(video); playAutomatically(video); }
    });
    updateMotionButton();
  });
  reducedMotion.addEventListener('change', (event) => {
    if (!event.matches) return;
    motionPaused = true;
    videos.forEach(pauseAutomatically);
    updateMotionButton();
  });
  document.addEventListener('visibilitychange', () => {
    videos.forEach((video) => document.hidden ? pauseAutomatically(video) : playAutomatically(video));
  });
  updateMotionButton();
})();
