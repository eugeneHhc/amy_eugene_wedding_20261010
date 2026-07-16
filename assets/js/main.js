(function () {
  const imgEls = Array.from(document.querySelectorAll('.gallery-grid .photo-frame img'));
  const debugEl = document.getElementById('gallery-debug');
  const BATCH_SIZE = 1;
  const INTERVAL_MS = 3000;
  const PHOTO_FADE_MS = 180;
  const photoPaths = (window.GALLERY_PHOTO_PATHS || []);

  const totalBatches = Math.ceil(photoPaths.length / BATCH_SIZE);
  let activeBatchIndex = 0;
  let timer = null;
  const imageCache = new Map();

  function logDebug(message, detail) {
    const stamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const entry = '[' + stamp + '] ' + message;
    console.log(entry, detail || '');
    if (debugEl) {
      debugEl.textContent = entry + (detail ? ' | ' + detail : '');
    }
  }

  function resetSlot(img) {
    img.classList.remove('is-visible');
    img.classList.add('is-hidden');
    img.style.opacity = '0';
    img.style.transform = 'scale(1.02)';
    img.style.transition = 'opacity ' + PHOTO_FADE_MS + 'ms ease, transform ' + PHOTO_FADE_MS + 'ms ease';
    img.dataset.state = 'hidden';
  }

  function showSlot(img) {
    img.classList.remove('is-hidden');
    img.classList.add('is-visible');
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
    img.dataset.state = 'visible';
  }

  function showError(img, reason) {
    img.classList.remove('is-visible');
    img.classList.add('is-hidden');
    img.style.opacity = '0';
    img.style.transform = 'scale(1.02)';
    img.alt = 'Image unavailable';
    img.dataset.state = 'error';
    logDebug('gallery image failed', reason);
  }

  function loadImage(src) {
    if (imageCache.has(src)) {
      return imageCache.get(src);
    }

    const promise = new Promise((resolve, reject) => {
      const loader = new Image();
      loader.decoding = 'async';
      loader.onload = function () {
        resolve(loader);
      };
      loader.onerror = function () {
        reject(new Error('failed:' + src));
      };
      loader.src = src;
    });

    imageCache.set(src, promise);
    return promise;
  }

  function preloadBatch(batchIndex) {
    const start = batchIndex * BATCH_SIZE;
    const batchNumber = batchIndex + 1;
    const items = [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const pos = start + i;
      if (pos >= photoPaths.length) {
        continue;
      }
      const src = photoPaths[pos];
      const alt = 'Wedding photo ' + (pos + 1);
      items.push({ slotIndex: i, src: src, alt: alt });
    }

    if (!items.length) {
      return Promise.resolve([]);
    }

    const startedAt = performance.now();
    logDebug('gallery preloading batch ' + batchNumber + ' of ' + totalBatches, items.map(function (item) { return item.src; }).join(' | '));

    return Promise.all(items.map(function (item) {
      return loadImage(item.src).then(function () {
        return item;
      });
    })).then(function (results) {
      const duration = Math.round(performance.now() - startedAt);
      logDebug('gallery batch ' + batchNumber + ' ready in ' + duration + 'ms', results.length + ' images');
      return results;
    });
  }

  function applyBatch(batchIndex, batchNumber, preparedItems) {
    const start = batchIndex * BATCH_SIZE;
    const batchItems = preparedItems || [];

    for (let i = 0; i < BATCH_SIZE; i++) {
      const img = imgEls[i];
      if (!img) {
        continue;
      }

      const pos = start + i;
      if (pos >= photoPaths.length) {
        resetSlot(img);
        continue;
      }

      const item = batchItems[i] || null;
      if (!item) {
        resetSlot(img);
        continue;
      }

      const src = item.src;
      const alt = item.alt;
      img.alt = alt;
      img.loading = 'eager';
      img.decoding = 'async';
      img.style.transition = 'opacity ' + PHOTO_FADE_MS + 'ms ease, transform ' + PHOTO_FADE_MS + 'ms ease';

      resetSlot(img);
      img.src = src;

      if (img.complete && img.naturalWidth > 0) {
        window.requestAnimationFrame(function () {
          showSlot(img);
          logDebug('gallery batch ' + batchNumber + ' slot ' + (i + 1) + ' revealed', src);
        });
      } else {
        img.onload = function () {
          window.requestAnimationFrame(function () {
            showSlot(img);
            logDebug('gallery batch ' + batchNumber + ' slot ' + (i + 1) + ' revealed', src);
          });
        };
        img.onerror = function () {
          showError(img, 'src load error');
        };
      }
    }

    activeBatchIndex = batchIndex;
  }

  function renderBatch() {
    if (!photoPaths.length) {
      logDebug('gallery has no photos configured', '');
      return;
    }

    const nextBatchIndex = (activeBatchIndex + 1) % totalBatches;
    const nextBatchNumber = nextBatchIndex + 1;

    logDebug('gallery switching to batch ' + nextBatchNumber + ' of ' + totalBatches, '');

    preloadBatch(nextBatchIndex)
      .then(function (preparedItems) {
        applyBatch(nextBatchIndex, nextBatchNumber, preparedItems);
      })
      .catch(function (error) {
        logDebug('gallery batch preload failed', error && error.message ? error.message : error);
      });
  }

  preloadBatch(activeBatchIndex)
    .then(function (preparedItems) {
      applyBatch(activeBatchIndex, 1, preparedItems);
    })
    .catch(function (error) {
      logDebug('gallery initial preload failed', error && error.message ? error.message : error);
    });

  timer = window.setInterval(renderBatch, INTERVAL_MS);
})();
