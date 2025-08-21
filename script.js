// Start Learning dropdown toggle (click)
const startBtn = document.getElementById('startBtn');
const dropdown = startBtn?.closest('.dropdown');

if (startBtn && dropdown) {
  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('open');
  });

  // outside click pe band
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.remove('open');
  });
}
 // Inner Tabs functionality
const innerButtons = document.querySelectorAll('.inner-tab-button');
const innerContents = document.querySelectorAll('.tab-content');

innerButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    innerButtons.forEach(b => b.classList.remove('active'));
    innerContents.forEach(c => c.classList.remove('active'));
    // Add active to clicked
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});




const modal = document.getElementById("videoModal");
const iframe = document.getElementById("videoIframe");
const closeBtn = modal.querySelector(".close");

document.querySelectorAll(".lecture-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const videoURL = btn.getAttribute("data-video");
    iframe.src = videoURL + "?autoplay=1";
    modal.style.display = "block";
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  iframe.src = "";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    iframe.src = "";
  }
});