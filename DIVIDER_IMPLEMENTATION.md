# Page Divider Implementation

## Changes Made

### 1. HTML (index2.html)
Added a page divider section between the countdown-box and gallery-grid:

```html
<!-- Page Divider Image -->
<div class="page-divider">
    <img src="photos/pd1.png" alt="Wedding moment" class="divider-image" loading="lazy">
    <div class="divider-overlay"></div>
</div>
```

**Location:** Lines 54-58 in index2.html
**Position:** Between `.countdown-box` (line 48-51) and `.gallery-grid` (line 60)

### 2. CSS (assets/css/components.css)
Added styles for the page divider with white overlay:

```css
/* ===== Page Divider Image ===== */
.page-divider {
  position: relative;
  max-width: 100%;
  margin: 2rem auto;
  overflow: hidden;
  border-radius: var(--radius);
}

.page-divider .divider-image {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: cover;
  border-radius: var(--radius);
}

.page-divider .divider-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.65);
  pointer-events: none;
  border-radius: var(--radius);
}
```

## Key Features

✅ **Responsive Width:** Image constrained to `max-width: 100%` to prevent overflow
✅ **White Overlay:** Semi-transparent white shade (rgba 255,255,255,0.65) for elegant, light appearance
✅ **Consistent Styling:** Uses existing `var(--radius)` for rounded corners
✅ **Lazy Loading:** Image uses `loading="lazy"` for performance
✅ **Maintains Aspect Ratio:** `height: auto` and `object-fit: cover` ensure proper display

## Visual Effect

The pd1.png image will appear:
- Full width within its container
- With a soft white wash/overlay (65% opacity) to match the light, elegant wedding theme
- Rounded corners consistent with other elements
- Positioned seamlessly between the countdown and gallery sections

## Note

Ensure `photos/pd1.png` exists in your project directory. If the file is missing, the image will not display but the layout will remain intact.
