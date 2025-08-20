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





document.querySelectorAll('.playLecture').forEach(btn => {
  btn.addEventListener('click', () => {
    const iframe = btn.nextElementSibling;
    iframe.src = btn.getAttribute('data-src'); // set src on click
  });
});
