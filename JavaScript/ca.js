const toggleBtn = document.querySelector('#theme-toggle');
const menuBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

// Theme toggle
toggleBtn.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  if (current === 'dark') {
    document.body.removeAttribute('data-theme');
    toggleBtn.textContent = '🌙';
  } else {
    document.body.setAttribute('data-theme', 'dark');
    toggleBtn.textContent = '☀️';
  }
});

// Mobile menu toggle
menuBtn.addEventListener('click', () => {
  nav.classList.toggle('active');
});
