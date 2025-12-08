// Main Entry Point
import DataManager from './dataManager.js';
import { router } from './router.js'; // We will create router.js or put it here

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  console.log('Nanal App Initializing...');
  DataManager.getInstance().loadData();

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
  document.getElementById('page-title').textContent = titles[hash] || 'Nanal';

  // Load View (Placeholder)
  const main = document.getElementById('main-view');
  main.innerHTML = `<div class="card"><h2>${titles[hash]}</h2><p>Content for ${hash} goes here.</p></div>`;
}
