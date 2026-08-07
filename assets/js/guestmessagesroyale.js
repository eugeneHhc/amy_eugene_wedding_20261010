// Guest Messages Royal - Vertical Board Logic
(function() {
  'use strict';

  const form = document.getElementById('guestbook-form');
  const nameInput = document.getElementById('guest-name');
  const messageInput = document.getElementById('guest-message');
  const messageGrid = document.getElementById('message-grid');
  const boardFormContainer = document.getElementById('board-form-container');
  
  // Make form draggable
  if (boardFormContainer) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    boardFormContainer.addEventListener('mousedown', dragStart);
    boardFormContainer.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);

    function dragStart(e) {
      initialX = e.clientX || e.touches[0].clientX;
      initialY = e.clientY || e.touches[0].clientY;
      
      if (e.target === boardFormContainer || boardFormContainer.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      currentX = e.clientX || e.touches[0].clientX;
      currentY = e.clientY || e.touches[0].clientY;

      xOffset = currentX - initialX;
      yOffset = currentY - initialY;

      // Get current position
      const rect = boardFormContainer.getBoundingClientRect();
      const parentRect = boardFormContainer.parentElement.getBoundingClientRect();
      
      // Calculate new position relative to parent
      let newLeft = rect.left - parentRect.left + xOffset;
      let newTop = rect.top - parentRect.top + yOffset;

      // Apply new position
      boardFormContainer.style.left = newLeft + 'px';
      boardFormContainer.style.top = newTop + 'px';
      boardFormContainer.style.bottom = 'auto';
      boardFormContainer.style.transform = 'none';

      initialX = currentX;
      initialY = currentY;
    }

    function dragEnd() {
      isDragging = false;
    }
  }

  // Click outside to collapse expanded messages
  document.addEventListener('click', function(e) {
    const expandedMessages = document.querySelectorAll('.board-message.expanded');
    expandedMessages.forEach(function(msg) {
      if (!msg.contains(e.target) && e.target !== boardFormContainer && !boardFormContainer.contains(e.target)) {
        msg.classList.remove('expanded');
      }
    });
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) return;

      // Create message element
      const messageDiv = document.createElement('div');
      messageDiv.className = 'board-message';
      messageDiv.setAttribute('tabindex', '0');
      messageDiv.setAttribute('role', 'button');
      messageDiv.setAttribute('aria-label', 'Message from ' + name + ': ' + message);

      // Escape HTML to prevent XSS
      const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      };

      messageDiv.innerHTML = `
        <span class="message-text">"${escapeHTML(message)}"</span>
        <span class="message-author">— ${escapeHTML(name)}</span>
      `;

      // Add click to expand functionality
      messageDiv.addEventListener('click', function(e) {
        e.stopPropagation();
        this.classList.toggle('expanded');
      });

      // Add keyboard support
      messageDiv.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.classList.toggle('expanded');
        }
      });

      // Add to grid (prepend to show latest first)
      if (messageGrid) {
        messageGrid.insertBefore(messageDiv, messageGrid.firstChild);
      }

      // Clear form
      form.reset();
    });
  }
})();