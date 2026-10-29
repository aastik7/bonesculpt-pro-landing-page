(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js-ready');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#section-nav');
  const setMenu = (open) => {
    navigation?.classList.toggle('is-open', open);
    menuButton?.setAttribute('aria-expanded', String(open));
    menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav')) setMenu(false);
  });
  window.matchMedia('(min-width: 651px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });

  const brushes = {
    grab: { name: 'Grab', key: '1', tagline: 'Find the gesture.', copy: 'Bend or move bones by dragging in the viewport. Use Rotation to bend the chain, or enable Location to move eligible, unconnected bones.', channel: 'Uses enabled Rotation and/or Location channels.' },
    curl: { name: 'Curl', key: '2', tagline: 'Put a turn into the chain.', copy: 'Drag left and right to curl a chain around the viewing axis. Adjust radius and strength to concentrate the turn or spread it across more bones.', channel: 'Requires Rotation. Respects the enabled bone-local axes.' },
    twist: { name: 'Twist', key: '3', tagline: 'Turn along the length.', copy: 'Twist bones along their length—their local Y axis. Useful for changing the orientation of a strand or feather without translating the chain.', channel: 'Requires Rotation. Applies a local-Y twist filtered by the enabled axes.' },
    inflate: { name: 'Inflate', key: '4', tagline: 'Open up the shape.', copy: 'Spread bone tips away from the brush cursor. Hold Ctrl to pull them inward. Use it to open or gather a group of chains before refining individual areas.', channel: 'Uses enabled Rotation and/or Location; this is not mesh inflation.' },
    stretch: { name: 'Stretch', key: '5', tagline: 'Reach, squash, bend.', copy: 'Drag along a bone to stretch or squash it. With Grab While Stretching enabled, sideways dragging also bends or moves the bones through the enabled Rotation or Location channels.', channel: 'Stretching requires Scale. Optional Grab uses Rotation and/or Location.' },
    smooth: { name: 'Smooth', key: '6', tagline: 'Quiet the kinks.', copy: 'Relax directional kinks using neighboring bones. Brush the areas that need a calmer transition, with radius and strength controlling the reach and influence.', channel: 'Requires Rotation. It smooths the pose, not the animation timing.' },
    reset: { name: 'Reset', key: '7', tagline: 'Ease back toward rest.', copy: 'Gradually bring the enabled transform channels toward the rest pose. Use a lighter strength for a local correction instead of clearing the whole pose at once.', channel: 'Uses supported, enabled Location, Rotation and/or Scale channels.' },
    noise: { name: 'Noise', key: '8', tagline: 'Make room for variation.', copy: 'Add spatial variation to the pose with the brush’s noise controls. Tune the pattern with size, amount, detail and seed, then choose whether it changes each stroke.', channel: 'Uses enabled Location, Rotation and/or Scale channels.' },
    tween: { name: 'Tween', key: '9', tagline: 'Find the in-between.', copy: 'Blend neighboring animated poses with the Earlier/Next bias, in place of Strength. Use neighboring keyframes or sample the animation curves at a chosen frame offset.', channel: 'Needs pose-transform animation curves in the armature’s active action.' }
  };
  const brushButtons = [...document.querySelectorAll('[data-brush]')];
  brushButtons.forEach((button) => button.addEventListener('click', () => {
    const brush = brushes[button.dataset.brush];
    if (!brush) return;
    brushButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('#brush-name').textContent = brush.name;
    document.querySelector('#brush-key').textContent = brush.key;
    document.querySelector('#brush-tagline').textContent = brush.tagline;
    document.querySelector('#brush-copy').textContent = brush.copy;
    document.querySelector('#brush-channel').textContent = brush.channel;
  }));

  if ('IntersectionObserver' in window) {
    const navLinks = [...document.querySelectorAll('.nav-links a')];
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const sectionObserver = new IntersectionObserver((entries) => {
      const entry = entries.filter((item) => item.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!entry) return;
      navLinks.forEach((link) => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-14% 0px -65% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[data-demo]')];
  const motionButton = document.querySelector('.motion-toggle');
  const availableVideos = new Set();
  const unavailableVideos = new Set();
  const inView = new Set();
  const manuallyPaused = new WeakSet();
  const automaticPauses = new WeakSet();
  let motionPaused = reducedMotion.matches;
  let mediaObserver;

  const updateMotionButton = () => {
    if (!motionButton) return;
    motionButton.hidden = false;
    motionButton.disabled = !availableVideos.size;
    motionButton.setAttribute('aria-pressed', String(motionPaused));
    motionButton.querySelector('[data-motion-label]').textContent = !availableVideos.size
      ? (unavailableVideos.size === videos.length ? 'Previews unavailable' : 'Loading previews')
      : (motionPaused ? 'Play demos' : 'Pause demos');
    motionButton.firstElementChild.textContent = motionPaused ? '▷' : 'Ⅱ';
  };
  const pauseAutomatically = (video) => {
    if (video.paused) return;
    automaticPauses.add(video);
    video.pause();
  };
  const playAutomatically = (video) => {
    if (motionPaused || document.hidden || manuallyPaused.has(video) || !inView.has(video) || unavailableVideos.has(video)) return;
    video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
  };
  const showFallback = (video) => {
    const frame = video.closest('[data-media-frame]');
    unavailableVideos.add(video);
    availableVideos.delete(video);
    pauseAutomatically(video);
    video.hidden = true;
    frame?.querySelector('.media-fallback')?.removeAttribute('hidden');
    frame?.querySelector('.media-unavailable')?.removeAttribute('hidden');
    mediaObserver?.unobserve(video);
    updateMotionButton();
  };
  const restoreVideo = (video) => {
    const frame = video.closest('[data-media-frame]');
    unavailableVideos.delete(video);
    availableVideos.add(video);
    video.hidden = false;
    frame?.querySelector('.media-fallback')?.setAttribute('hidden', '');
    frame?.querySelector('.media-unavailable')?.setAttribute('hidden', '');
    mediaObserver?.observe(video);
    updateMotionButton();
  };
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
    // NETWORK_NO_SOURCE can be transient while the parser starts loading a source.
    // Real error events above trigger the fallback; successful metadata restores it.
    if (video.error) showFallback(video);
    else if (video.readyState >= HTMLMediaElement.HAVE_METADATA) restoreVideo(video);
  });
  if ('IntersectionObserver' in window) {
    mediaObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { inView.add(entry.target); playAutomatically(entry.target); }
      else { inView.delete(entry.target); pauseAutomatically(entry.target); }
    }), { threshold: .25 });
    videos.forEach((video) => { if (!unavailableVideos.has(video)) mediaObserver.observe(video); });
  }
  // Without IntersectionObserver, leave playback to each video's native controls.
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
