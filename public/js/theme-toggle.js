// public/js/theme-toggle.js

// Get the toggle button
const themeToggle = document.getElementById('theme-toggle');

// Check for a saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Add event listener for toggling
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Apply the new theme
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  // Update button text/icon
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});
