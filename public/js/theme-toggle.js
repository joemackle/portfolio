// public/js/theme-toggle.js

(function () {
	const root = document.documentElement;

	// apply theme ASAP to avoid FOUC
	try {
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || saved === 'light') {
			root.setAttribute('data-theme', saved);
		}
	} catch {}

	// wire up button
	window.addEventListener('DOMContentLoaded', () => {
		const btn = document.getElementById('theme-toggle');
		if (!btn) return;

		const current = root.getAttribute('data-theme') || 'light';
		btn.textContent = current === 'dark' ? '☀️' : '🌙';

		btn.addEventListener('click', () => {
			const now = root.getAttribute('data-theme') || 'light';
			const next = now === 'dark' ? 'light' : 'dark';
			root.setAttribute('data-theme', next);
			try { localStorage.setItem('theme', next); } catch {}
			btn.textContent = next === 'dark' ? '☀️' : '🌙';
		});
	});
})();
