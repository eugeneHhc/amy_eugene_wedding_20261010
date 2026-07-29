(function () {
  const container = document.querySelector('.gallery-stack');
  const frontImg = container ? container.querySelector('.gallery-img-front') : null;
  const backImg = container ? container.querySelector('.gallery-img-back') : null;
  const debugEl = document.getElementById('gallery-debug');
  const INTERVAL_MS = 3000;
  const CROSSFADE_MS = 1000;
  const photoPaths = (window.GALLERY_PHOTO_PATHS || []);

  let currentIndex = 0;
  let timer = null;
  let swapping = false;
  const imageCache = new Map();

  function loadImage(src) {
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }
    const promise = new Promise(function (resolve, reject) {
      var loader = new Image();
      loader.decoding = 'async';
      loader.onload = function () { resolve(loader); };
      loader.onerror = function () { reject(new Error('failed:' + src)); };
      loader.src = src;
    });
    imageCache.set(src, promise);
    return promise;
  }

  // Set an image element's src and fade it in
  function setImageAndFadeIn(img, src, alt, callback) {
    img.alt = alt || '';
    img.style.opacity = '0';
    img.style.transform = 'scale(1.05)';
    img.src = src;

    function onReady() {
      // Force reflow so the hidden state paints before we transition
      void img.offsetWidth;
      img.style.transition = 'opacity ' + CROSSFADE_MS + 'ms ease-out, transform ' + CROSSFADE_MS + 'ms ease-out';
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
      if (callback) setTimeout(callback, CROSSFADE_MS + 50);
    }

    if (img.complete && img.naturalWidth > 0) {
      onReady();
    } else {
      img.onload = onReady;
      img.onerror = function () {
        img.alt = 'Image unavailable';
        if (callback) callback();
      };
    }
  }

  // Crossfade: fade front in, then swap layers
  function crossfadeTo(src, alt) {
    if (swapping) return;
    swapping = true;

    var currentFront = frontImg;
    var currentBack = backImg;

    // Back layer shows the old image (already visible)
    // Set the new image on the front layer (hidden), then fade it in
    setImageAndFadeIn(currentFront, src, alt, function () {
      // After fade completes, swap: make front the new back, and back the new front
      // Keep front visible, set back to the same src (so it's ready for next swap)
      currentBack.src = currentFront.src;
      currentBack.alt = currentFront.alt;
      currentBack.style.transition = 'none';
      currentBack.style.opacity = '1';
      currentBack.style.transform = 'scale(1)';

      // Reset front to hidden state for next use
      currentFront.style.transition = 'none';
      currentFront.style.opacity = '0';
      currentFront.style.transform = 'scale(1.05)';

      swapping = false;
    });
  }

  function showNext() {
    if (!photoPaths.length || !frontImg || !backImg) return;

    var nextIndex = (currentIndex + 1) % photoPaths.length;
    var src = photoPaths[nextIndex];
    var alt = 'Wedding photo ' + (nextIndex + 1);

    // Preload then crossfade
    loadImage(src).then(function () {
      crossfadeTo(src, alt);
      currentIndex = nextIndex;
    }).catch(function () {
      // skip on error
    });
  }

  // Initialise: load first photo on both layers
  function init() {
    if (!photoPaths.length || !frontImg || !backImg) return;

    var firstSrc = photoPaths[0];
    var firstAlt = 'Wedding photo 1';

    // Set back layer immediately (no transition)
    backImg.style.transition = 'none';
    backImg.style.opacity = '1';
    backImg.style.transform = 'scale(1)';
    backImg.alt = firstAlt;
    backImg.src = firstSrc;

    // Set front hidden with same src
    frontImg.style.transition = 'none';
    frontImg.style.opacity = '0';
    frontImg.style.transform = 'scale(1.05)';
    frontImg.alt = firstAlt;
    frontImg.src = firstSrc;

    // After preload, crossfade to second photo
    if (photoPaths.length > 1) {
      var secondSrc = photoPaths[1];
      loadImage(secondSrc).then(function () {
        // Wait a moment then show the second
        setTimeout(function () {
          crossfadeTo(secondSrc, 'Wedding photo 2');
          currentIndex = 1;
        }, 500);
      });
    }

    // Start interval for subsequent swaps
    timer = window.setInterval(showNext, INTERVAL_MS + CROSSFADE_MS + 200);
  }

  init();
})();