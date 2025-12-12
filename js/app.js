import { dataManager } from './state.js';
import { FirebaseDB, FirebaseAuth } from './firebase-config.js';

// New views (component-based architecture)
import HomeView from './views/Home.js';
import IdeasView from './views/Ideas.js';
import CalendarView from './views/Calendar.js';
import GoalsView from './views/Goals.js';
import SettingsView from './views/Settings.js';

// Legacy modules (to be refactored later if needed)
// import WeeklyScreen from './modules/weekly.js';
// import TimetableScreen from './modules/timetable.js';

// 전역 상태 (legacy - will be replaced by dataManager)
const AppState = {
  currentScreen: 'home',
  user: null,
  theme: 'light',

  setState(newState) {
    Object.assign(this, newState);
    console.log('State updated:', newState);
  }
};

// 라우터 - 화면 전환 관리

class Router {
  constructor() {
    this.currentScreen = 'home';
    this.currentView = null;

    // New views (class instances)
    this.views = {
      home: new HomeView(),
      ideas: new IdeasView(),
      calendar: new CalendarView(),
      goals: new GoalsView(),
      settings: new SettingsView()
    };

    // Legacy modules (objects with render/init methods)
    // this.legacyModules = {
    //   weekly: WeeklyScreen,
    //   timetable: TimetableScreen
    // };
    this.legacyModules = {};
  }

  navigateTo(screenName) {
    console.log(`[Router] Navigating to: ${screenName}`);

    this.hideCurrentScreen();
    this.showScreen(screenName);
    this.updateNavigation(screenName);

    AppState.setState({ currentScreen: screenName });
    window.history.pushState({ screen: screenName }, '', `#${screenName}`);
  }

  hideCurrentScreen() {
    // Clean up current view/module
    if (this.currentView) {
      if (this.currentView.destroy) {
        this.currentView.destroy();
      }
      this.currentView = null;
    }

    const container = document.getElementById('main-content');
    container.innerHTML = '';
  }

  showScreen(screenName) {
    const container = document.getElementById('main-content');

    // Check if it's a new view
    if (this.views[screenName]) {
      const view = this.views[screenName];

      // Render view
      container.innerHTML = view.render();

      // Initialize view
      if (view.init) {
        view.init();
      }

      // Store current view
      this.currentView = view;

      console.log(`[Router] Loaded view: ${screenName}`);
    }
    // Check if it's a legacy module
    else if (this.legacyModules[screenName]) {
      const module = this.legacyModules[screenName];

      // Render module (legacy pattern)
      container.innerHTML = module.render();

      // Initialize module
      if (module.init) {
        module.init();
      }

      // Store current module as view
      this.currentView = module;

      console.log(`[Router] Loaded legacy module: ${screenName}`);
    }
    // Screen not found
    else {
      container.innerHTML = `
        <div class="screen-placeholder fade-in">
          <h1>${this.getScreenTitle(screenName)}</h1>
          <p>이 화면은 개발 중입니다.</p>
        </div>
      `;

      console.warn(`[Router] Screen not found: ${screenName}`);
    }
  }

  updateNavigation(screenName) {
    // Remove previous active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add new active state
    document.querySelectorAll(`[data-screen="${screenName}"]`).forEach(item => {
      item.classList.add('active');
    });
  }

  getScreenTitle(screenName) {
    const titles = {
      home: '홈',
      ideas: '아이디어',
      weekly: '주간',
      calendar: '캘린더',
      goals: '성장',
      timetable: '시간표',
      settings: '설정'
    };
    return titles[screenName] || '알 수 없는 화면';
  }
}

// 이벤트 리스너

function setupEventListeners() {
  // 네비게이션 클릭
  document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
      e.preventDefault();
      const screen = navItem.dataset.screen;
      if (screen) {
        router.navigateTo(screen);
      }
    }
  });

  // 뒤로가기/앞으로가기
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.screen) {
      router.navigateTo(e.state.screen);
    }
  });

  // 페이지 로드 시 해시로 화면 결정
  window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && router.views[hash] !== undefined) {
      router.navigateTo(hash);
    } else {
      router.navigateTo('home');
    }
  });

  // 플로팅 버튼
  const floatingBtn = document.getElementById('floating-action');
  if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
      console.log('Floating action button clicked');
      alert('빠른 액션 메뉴 (개발 예정)');
    });
  }

  // 테마 전환 버튼 제거됨 (2025-11-25)
}

// 다크모드

function setupTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  AppState.setState({ theme });
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// 유틸리티

const Storage = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }
};

function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Firebase Auth 초기화

function setupAuth() {
  // Firebase Auth 상태 변화 감지
  FirebaseAuth.onAuthChange((user) => {
    console.log('Auth state changed:', user ? user.email : 'Not logged in');
    AppState.setState({ user });

    // 현재 화면이 More 화면이면 다시 렌더링
    if (AppState.currentScreen === 'more') {
      const container = document.getElementById('main-content');
      if (container) {
        container.innerHTML = MoreScreen.render();
        MoreScreen.init();
      }
    }
  });
}

// 앱 시작

const router = new Router();

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 App initializing...');

  try {
    // CRITICAL: Initialize dataManager first (runs migration if needed)
    console.log('[App] Initializing dataManager...');
    await dataManager.initialize();
    console.log('✅ DataManager initialized');

    // Setup event listeners and theme
    setupEventListeners();
    setupTheme();
    setupAuth();

    // Firebase 연결 테스트
    try {
      console.log('[App] Testing Firebase connection...');
      const testData = {
        message: 'Firebase connected!',
        timestamp: new Date().toISOString()
      };
      await FirebaseDB.set('test', 'connection', testData);
      console.log('✅ Firebase connected successfully');
    } catch (error) {
      console.error('⚠️ Firebase connection failed:', error);
    }

    // Navigate to initial screen
    const hash = window.location.hash.slice(1) || 'home';
    router.navigateTo(hash);

    console.log('✅ App initialized successfully');

  } catch (error) {
    console.error('❌ App initialization failed:', error);

    // Show error to user
    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = `
        <div class="error-screen fade-in">
          <h1>⚠️ 초기화 오류</h1>
          <p>앱을 시작하는 중 오류가 발생했습니다.</p>
          <p class="error-detail">${error.message}</p>
          <button class="btn-primary" onclick="location.reload()">다시 시도</button>
        </div>
      `;
    }
  }
});

// 다른 파일에서 쓸 것들

export { AppState, router, Storage, formatDate, debounce, toggleTheme };
