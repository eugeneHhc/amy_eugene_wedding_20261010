(function () {
  const imgEls = Array.from(document.querySelectorAll('.gallery-grid .photo-frame img'));
  const BATCH_SIZE = 4;
  const INTERVAL_MS = 3000;
  const photoPaths = (window.GALLERY_PHOTO_PATHS || []);

  let batchIndex = 0;
  const totalBatches = Math.ceil(photoPaths.length / BATCH_SIZE);
  let timer = null;

  function clearSlot(img) {
    img.classList.remove('is-visible');
    img.classList.add('is-hidden');
    img.style.opacity = '0';
    img.style.transform = 'scale(1.03)';
    img.removeAttribute('src');
    img.alt = '';
  }

  function revealImage(img, src, alt) {
    img.classList.remove('is-hidden');
    img.classList.remove('is-visible');
    img.style.opacity = '0';
    img.style.transform = 'scale(1.03)';

    function showImage() {
      img.classList.add('is-visible');
      img.style.opacity = '1';
      img.style.transform = 'scale(1)';
    }

    function showError() {
      img.classList.remove('is-visible');
      img.classList.add('is-hidden');
      img.style.opacity = '0';
      img.style.transform = 'scale(1.03)';
      img.alt = 'Image unavailable';
    }

    img.onload = null;
    img.onerror = null;
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';

    if (img.complete && img.naturalWidth > 0) {
      showImage();
    } else {
      img.onload = function () {
        window.setTimeout(showImage, 120);
      };
      img.onerror = function () {
        showError();
      };
    }
  }

  function renderBatch() {
    const start = batchIndex * BATCH_SIZE;
    for (let i = 0; i < BATCH_SIZE; i++) {
      const pos = start + i;
      const img = imgEls[i];
      if (!img) continue;

      clearSlot(img);

      if (pos < photoPaths.length) {
        const src = photoPaths[pos];
        const alt = 'Wedding photo ' + (pos + 1);
        revealImage(img, src, alt);
      }
    }

    batchIndex = (batchIndex + 1) % totalBatches;
  }

  renderBatch();
  timer = window.setInterval(renderBatch, INTERVAL_MS);
})();
