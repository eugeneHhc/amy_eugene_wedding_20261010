document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("guestbook-form");
  const board = document.getElementById("notice-board");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("guest-name");
    const messageInput = document.getElementById("guest-message");

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    // Create new royal parchment note
    const note = document.createElement("div");
    note.className = "parchment-note";

    // Randomize slight rotation for natural court board look (-4deg to +4deg)
    const randomRotation = (Math.random() * 8 - 4).toFixed(1);

    note.innerHTML = `
      <div class="gold-wax-seal">⚜</div>
      <p class="message">"${escapeHTML(message)}"</p>
      <span class="author">— ${escapeHTML(name)}</span>
    `;

    // Prepend to top of board
    board.prepend(note);

    // GSAP Elegant Royal Entry Animation
    gsap.fromTo(
      note,
      {
        scale: 2.2,
        opacity: 0,
        rotation: 0,
        y: -120,
      },
      {
        scale: 1,
        opacity: 1,
        rotation: randomRotation,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
        onComplete: () => {
          // Subtle royal pulse on the gold wax seal upon impact
          gsap.fromTo(
            note.querySelector(".gold-wax-seal"),
            { scale: 1.6, boxShadow: "0 0 15px #fcf6ba" },
            { scale: 1, boxShadow: "0 3px 6px rgba(0,0,0,0.5)", duration: 0.3 }
          );
        },
      }
    );

    // Reset input fields
    form.reset();
  });

  // Basic HTML sanitization helper
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});