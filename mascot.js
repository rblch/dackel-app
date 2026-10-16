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

    canvas.hidden = false;
    const bounds = canvas.getBoundingClientRect();
    const stillBounds = still.getBoundingClientRect();
    // Rest and walking poses share one atlas frame, scale, and baseline.
    const scale = stillBounds.width / frameWidth;
    const dogWidth = frameWidth * scale;
    const home = Math.max(0, Math.min(bounds.width - dogWidth,
      stillBounds.left - bounds.left));
    const baseline = stillBounds.bottom - bounds.top;
    const textBounds = document.querySelector('.intro > div').getBoundingClientRect();
    const leftLimit = Math.min(home, Math.max(0, textBounds.right - bounds.left + 12));
    const distance = home - leftLimit;
    const travelTime = Math.min(2400, Math.max(1000, distance * 5));
    const pause = 450;
    const duration = travelTime * 2 + pause;
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
      const outbound = elapsed < travelTime;
      const waiting = elapsed >= travelTime && elapsed < travelTime + pause;
      const x = outbound ? home - distance * (elapsed / travelTime)
        : waiting ? leftLimit
          : leftLimit + distance * ((elapsed - travelTime - pause) / travelTime);
      const pose = waiting ? 0 : Math.floor(elapsed / 110) % regions.length;
      const [sx, sy, sw, sh] = regions[pose];
      context.clearRect(0, 0, bounds.width, bounds.height);
      context.save();
      context.translate(x + (outbound ? dogWidth : 0), 0);
      context.scale(outbound ? -1 : 1, 1);
      context.drawImage(sheet, sx, sy, sw, sh, 0,
        baseline - sh * scale, sw * scale, sh * scale);
      context.restore();
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
