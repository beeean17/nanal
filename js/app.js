// Main Entry Point
import DataManager from './dataManager.js';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('🍎 Nanal App Initializing...');
  const dm = DataManager.getInstance();
  dm.loadData();

  // Verification: Log today's data
  const today = new Date().toISOString().split('T')[0];
  console.log('DEBUG: Today View Data:', dm.getTodayViewData(today));

  // Initial Route
  window.location.hash = window.location.hash || '#home';
  handleRoute();
});

window.addEventListener('hashchange', handleRoute);

function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  console.log(`Navigating to ${hash}`);

  // Update Nav UI
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-target') === hash);
  });

  // Update Header Title
  const titles = {
    home: 'Today',
    calendar: 'Calendar',
    goals: 'Goals',
    ideas: 'Incubator',
    settings: 'Settings'
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[hash] || 'Nanal';

  // Load View (Placeholder logic)
  renderView(hash);
}

// TODO: Move this to a proper Router class in Phase 2
async function renderView(viewName) {
  const main = document.getElementById('main-view');
  main.innerHTML = `<div class="card" style="animation: fadeIn 0.3s ease;">
        <h2>${viewName.charAt(0).toUpperCase() + viewName.slice(1)}</h2>
        <p>Loading view...</p>
    </div>`;

  try {
    // Dynamic import attempt (will be implemented fully in Phase 2)
    // const module = await import(`./views/${viewName}.js`);
    // module.render(main);
  } catch (e) {
    console.error('View load error:', e);
  }
}
