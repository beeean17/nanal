import DataManager from './dataManager.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('🍎 Nanal App Initializing...');
  DataManager.getInstance().loadData();

  // Initial Route
  window.location.hash = window.location.hash || '#home';
  handleRoute();
});

window.addEventListener('hashchange', handleRoute);

async function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  console.log(`Navigating to ${hash}`);

  // Update Nav UI
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-target') === hash);
  });

  const main = document.getElementById('main-view');

  // Show loading state (optional, or keeping previous view until new one loads)
  // main.innerHTML = '<div class="spinner"></div>';

  try {
    const module = await import(`./views/${hash}.js`);
    const ViewClass = module.default;
    const view = new ViewClass();
    await view.render(main);

    // Update Title found in Header
    const headerTitle = main.querySelector('h2')?.textContent || 'Nanal';
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = headerTitle;

  } catch (e) {
    console.error('Routing Error:', e);
    main.innerHTML = `<div class="error-state">
            <h3>Page Not Found</h3>
            <p>Could not load view: ${hash}</p>
        </div>`;
  }
}
