(() => {
  const button = document.querySelector('.mascot-button');
  const still = button.querySelector('.mascot-frame');
  const bone = button.querySelector('.mascot-bone');
  const canvas = document.querySelector('.mascot-walkway');
  const status = document.querySelector('.mascot-status');
  const context = canvas.getContext('2d');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Same measured atlas regions and shared baseline as DackelSpriteSheet.swift.
  const regions = [
    [28, 144, 413, 231], [482, 144, 402, 231],
    [922, 144, 406, 231], [1368, 144, 404, 231],
    [25, 581, 416, 228], [482, 581, 402, 228],
    [926, 581, 402, 228], [1371, 581, 401, 228],
  ].map(([x, y, width, height]) => [x - 4, y - 4, width + 8, height + 8]);
  const frameWidth = Math.max(...regions.map((region) => region[2]));
  let generation = 0;
  let frameRequest = 0;
  let boneTimer = 0;
  let sheetPromise;

  function rest(message = '') {
    generation += 1;
    cancelAnimationFrame(frameRequest);
    clearTimeout(boneTimer);
    canvas.hidden = true;
    still.removeAttribute('hidden');
    bone.hidden = true;
    button.removeAttribute('aria-busy');
    status.textContent = message;
  }

  function findBone() {
    bone.hidden = false;
    status.textContent = 'Dackel found a little bone.';
    boneTimer = setTimeout(() => rest(), 3000);
  }

  function loadSheet() {
    if (!sheetPromise) {
      const image = new Image();
      sheetPromise = new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => {
          sheetPromise = undefined;
          reject(new Error('The local walk artwork could not be loaded.'));
        };
        image.src = new URL('assets/dackel-walk.png', document.baseURI).href;
      });
    }
    return sheetPromise;
  }

  async function walk() {
    rest();
    if (motion.matches || !context) {
      findBone();
      return;
    }
    const thisWalk = generation;
    button.setAttribute('aria-busy', 'true');
    let sheet;
    try {
      sheet = await loadSheet();
    } catch {
      if (thisWalk === generation) {
        rest();
        findBone();
      }
      return;
    }
    if (thisWalk !== generation || document.hidden) return;

    // The walkway spans the whole window width so Dackel can leave on the right
    // and come back from the left; it stops at the window edge, so it never adds a scrollbar.
    canvas.hidden = false;
    const header = canvas.offsetParent.getBoundingClientRect();
    canvas.style.left = `${-header.left}px`;
    canvas.style.width = `${document.documentElement.clientWidth}px`;
    const bounds = canvas.getBoundingClientRect();
    const stillBounds = still.getBoundingClientRect();
    // Rest and walking poses share one atlas frame, scale, and baseline.
    const scale = stillBounds.width / frameWidth;
    const dogWidth = frameWidth * scale;
    const home = stillBounds.left - bounds.left;
    const baseline = stillBounds.bottom - bounds.top;
    // One lap: off the right edge, back in from the left, and home behind the wordmark.
    const lap = bounds.width + dogWidth;
    const duration = Math.min(6500, Math.max(2600, lap * 3.4));
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(bounds.width * pixelRatio);
    canvas.height = Math.round(bounds.height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;
    still.setAttribute('hidden', '');
    status.textContent = 'Taking Dackel for a walk.';
    let started;

    function tick(timestamp) {
      if (thisWalk !== generation) return;
      if (started === undefined) started = timestamp;
      const elapsed = timestamp - started;
      if (elapsed >= duration) {
        rest('Dackel is back.');
        return;
      }
      // Distance walked so far, wrapped so that leaving on the right re-enters on the left.
      const travelled = lap * (elapsed / duration);
      let x = home + travelled;
      if (x > bounds.width) x -= lap;
      const pose = Math.floor(elapsed / 110) % regions.length;
      const [sx, sy, sw, sh] = regions[pose];
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.drawImage(sheet, sx, sy, sw, sh, x,
        baseline - sh * scale, sw * scale, sh * scale);
      frameRequest = requestAnimationFrame(tick);
    }
    frameRequest = requestAnimationFrame(tick);
  }

  function cancelWalk() {
    if (button.hasAttribute('aria-busy') || !bone.hidden) rest('Dackel is back.');
  }

  function updateMotion() {
    cancelWalk();
    const label = motion.matches ? 'Find Dackel’s bone' : 'Take Dackel for a walk';
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  button.addEventListener('click', walk);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (button.hasAttribute('aria-busy') || !bone.hidden)) {
      event.preventDefault();
      cancelWalk();
    }
  });
  window.addEventListener('resize', cancelWalk);
  window.addEventListener('pagehide', cancelWalk);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelWalk();
  });
  motion.addEventListener('change', updateMotion);
  updateMotion();
  button.disabled = false;
})();
