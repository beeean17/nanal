// app.js - 메인 진입점

import { FirebaseDB, FirebaseAuth } from './firebase-config.js';
import HomeScreen from './modules/home.js';
import CalendarScreen from './modules/calendar.js';
import GrowthScreen from './modules/growth.js';
import TimetableScreen from './modules/timetable.js';
import MoreScreen from './modules/more.js';

// 전역 상태
const AppState = {
  currentScreen: 'home',
  user: null,
  theme: 'light',

  // 임시 데이터 (나중에 Firebase로 옮길 것)
  todos: [],
  events: [],
  budget: [],
  goals: [],
  habits: [],

  setState(newState) {
    Object.assign(this, newState);
    console.log('State updated:', newState);
  }
};

// 라우터 - 화면 전환 관리

class Router {
  constructor() {
    this.currentScreen = 'home';
    this.currentModule = null;
    this.screens = {
      home: HomeScreen,
      calendar: CalendarScreen,
      growth: GrowthScreen,
      timetable: TimetableScreen,
      more: MoreScreen
    };
  }

  navigateTo(screenName) {
    console.log(`Navigating to: ${screenName}`);

    this.hideCurrentScreen();
    this.showScreen(screenName);
    this.updateNavigation(screenName);

    AppState.setState({ currentScreen: screenName });
    window.history.pushState({ screen: screenName }, '', `#${screenName}`);
  }

  hideCurrentScreen() {
    // 이전 모듈 정리
    if (this.currentModule && this.currentModule.destroy) {
      this.currentModule.destroy();
    }

    const container = document.getElementById('screen-container');
    container.innerHTML = '';
  }

  showScreen(screenName) {
    const container = document.getElementById('screen-container');
    const screenModule = this.screens[screenName];

    if (screenModule) {
      // 화면 렌더링
      container.innerHTML = screenModule.render();

      // 모듈 초기화
      if (screenModule.init) {
        screenModule.init();
      }

      // 현재 모듈 저장
      this.currentModule = screenModule;
    } else {
      // 모듈이 없는 경우 플레이스홀더 표시
      container.innerHTML = `
        <div class="screen-placeholder fade-in">
          <h1>${this.getScreenTitle(screenName)}</h1>
          <p>이 화면은 개발 중입니다.</p>
        </div>
      `;
    }
  }

  updateNavigation(screenName) {
    // 이전 active 제거
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    // 새 active 추가
    document.querySelectorAll(`[data-screen="${screenName}"]`).forEach(item => {
      item.classList.add('active');
    });
  }

  getScreenTitle(screenName) {
    const titles = {
      home: '홈',
      calendar: '캘린더',
      growth: '성장 트래킹',
      timetable: '시간표',
      more: '더보기'
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
    if (hash && router.screens[hash] !== undefined) {
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
      const container = document.getElementById('screen-container');
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

  setupEventListeners();
  setupTheme();
  setupAuth();

  // Firebase 연결 테스트
  try {
    console.log('Testing Firebase connection...');
    const testData = {
      message: 'Firebase connected!',
      timestamp: new Date().toISOString()
    };
    await FirebaseDB.set('test', 'connection', testData);
    console.log('✅ Firebase connected successfully');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }

  const hash = window.location.hash.slice(1) || 'home';
  router.navigateTo(hash);

  console.log('✅ App initialized successfully');
});

// 다른 파일에서 쓸 것들

export { AppState, router, Storage, formatDate, debounce, toggleTheme };
