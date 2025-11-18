// more.js - 더보기 화면 모듈
// 부가 기능과 설정을 제공하는 메뉴

import { AppState, toggleTheme } from '../app.js';
import { FirebaseAuth } from '../firebase-config.js';

const MoreScreen = {
  // 통계 계산
  getStatistics() {
    try {
      const goals = JSON.parse(localStorage.getItem('nanal_goals') || '[]');
      const habits = JSON.parse(localStorage.getItem('nanal_habits') || '[]');
      const events = JSON.parse(localStorage.getItem('nanal_events') || '[]');
      const timetable = JSON.parse(localStorage.getItem('nanal_timetable') || '[]');

      // 이번 주 습관 달성률 계산
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      let totalHabitChecks = 0;
      let expectedHabitChecks = 0;

      habits.forEach(habit => {
        const daysInWeek = today.getDay() + 1; // 일요일부터 오늘까지의 일수

        if (habit.frequency === 'daily') {
          expectedHabitChecks += daysInWeek;
        } else {
          expectedHabitChecks += Math.min(habit.targetDays, daysInWeek);
        }

        const thisWeekChecks = (habit.checks || []).filter(check => {
          const checkDate = new Date(check);
          return checkDate >= startOfWeek;
        });

        totalHabitChecks += thisWeekChecks.length;
      });

      const habitCompletionRate = expectedHabitChecks > 0
        ? Math.round((totalHabitChecks / expectedHabitChecks) * 100)
        : 0;

      return {
        goalsCount: goals.length,
        habitsCount: habits.length,
        eventsCount: events.length,
        timetableCount: timetable.length,
        habitCompletionRate
      };
    } catch (error) {
      console.error('Statistics error:', error);
      return {
        goalsCount: 0,
        habitsCount: 0,
        eventsCount: 0,
        timetableCount: 0,
        habitCompletionRate: 0
      };
    }
  },

  // 화면 렌더링
  render() {
    const currentTheme = AppState.theme;
    const user = AppState.user;
    const stats = this.getStatistics();

    return `
      <div class="more-screen fade-in">
        <div class="more-header">
          <h1 class="screen-title">더보기</h1>
          <p class="screen-subtitle">설정 및 추가 기능</p>
        </div>

        <!-- 사용자 정보 -->
        <section class="user-section">
          ${user ? `
            <div class="user-info">
              <div class="user-avatar">👤</div>
              <div class="user-details">
                <h3 class="user-name">${user.email || '사용자'}</h3>
                <p class="user-status">✓ 로그인됨</p>
                <button class="btn-secondary logout-btn" id="logout-btn">로그아웃</button>
              </div>
            </div>
          ` : `
            <div class="login-prompt">
              <div class="login-prompt-icon">🔒</div>
              <h3>로그인하여 데이터를 동기화하세요</h3>
              <p>클라우드에 안전하게 저장하고 어디서나 접근하세요</p>
              <button class="btn-primary login-btn" id="show-login-btn">로그인</button>
            </div>
          `}
        </section>

        <!-- 통계 대시보드 -->
        <section class="statistics-section">
          <h2>📊 내 데이터 통계</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">${stats.goalsCount}</div>
              <div class="stat-label">진행 중인 목표</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-value">${stats.habitsCount}</div>
              <div class="stat-label">등록된 습관</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-value">${stats.eventsCount + stats.timetableCount}</div>
              <div class="stat-label">총 일정</div>
            </div>
            <div class="stat-card ${stats.habitCompletionRate >= 80 ? 'success' : stats.habitCompletionRate >= 50 ? 'warning' : ''}">
              <div class="stat-icon">🔥</div>
              <div class="stat-value">${stats.habitCompletionRate}%</div>
              <div class="stat-label">이번 주 습관 달성률</div>
            </div>
          </div>
        </section>

        <!-- 설정 -->
        <section class="settings-section">
          <h2>설정</h2>
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">${currentTheme === 'light' ? '☀️' : '🌙'}</span>
                <span class="label">테마</span>
              </div>
              <button class="toggle-btn" id="theme-toggle-more">
                ${currentTheme === 'light' ? '라이트' : '다크'}
              </button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">💾</span>
                <span class="label">데이터 백업</span>
                <span class="setting-desc">모든 데이터를 JSON 파일로 다운로드</span>
              </div>
              <button class="action-btn" id="backup-btn">💾 백업</button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">📥</span>
                <span class="label">데이터 복원</span>
                <span class="setting-desc">백업 파일에서 데이터 복원</span>
              </div>
              <button class="action-btn" id="restore-btn">📥 복원</button>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <span class="icon">🗑️</span>
                <span class="label">전체 데이터 삭제</span>
                <span class="setting-desc">모든 로컬 데이터 삭제 (복구 불가)</span>
              </div>
              <button class="action-btn danger" id="delete-all-btn">🗑️ 삭제</button>
            </div>
          </div>
        </section>

        <!-- 앱 정보 -->
        <section class="app-info">
          <p class="app-version">나날 (Nanal) v1.0.0</p>
          <p class="app-description">일상 관리 허브</p>
          <div class="app-links">
            <a href="https://github.com/beeean17/nanal" target="_blank" class="app-link">
              <span class="icon">📦</span>
              <span>GitHub</span>
            </a>
            <a href="https://github.com/beeean17/nanal/issues" target="_blank" class="app-link">
              <span class="icon">❓</span>
              <span>도움말</span>
            </a>
          </div>
        </section>

        <!-- File input for restore (hidden) -->
        <input type="file" id="restore-file-input" accept=".json" style="display: none;" />

        <!-- 로그인 모달 -->
        <div class="auth-modal" id="auth-modal" style="display: none;">
          <div class="auth-modal-content">
            <div class="auth-modal-header">
              <h2 id="auth-modal-title">로그인</h2>
              <button class="auth-modal-close" id="close-modal">&times;</button>
            </div>

            <div class="auth-modal-body">
              <!-- 탭 -->
              <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">로그인</button>
                <button class="auth-tab" data-tab="signup">회원가입</button>
              </div>

              <!-- 로그인 폼 -->
              <form id="login-form" class="auth-form" style="display: block;">
                <div class="form-group">
                  <label for="login-email">이메일</label>
                  <input type="email" id="login-email" placeholder="email@example.com" required />
                </div>
                <div class="form-group">
                  <label for="login-password">비밀번호</label>
                  <input type="password" id="login-password" placeholder="비밀번호" required />
                </div>
                <button type="submit" class="btn-primary auth-submit-btn">로그인</button>
                <div class="auth-error" id="login-error"></div>
              </form>

              <!-- 회원가입 폼 -->
              <form id="signup-form" class="auth-form" style="display: none;">
                <div class="form-group">
                  <label for="signup-email">이메일</label>
                  <input type="email" id="signup-email" placeholder="email@example.com" required />
                </div>
                <div class="form-group">
                  <label for="signup-password">비밀번호</label>
                  <input type="password" id="signup-password" placeholder="비밀번호 (6자 이상)" required minlength="6" />
                </div>
                <div class="form-group">
                  <label for="signup-password-confirm">비밀번호 확인</label>
                  <input type="password" id="signup-password-confirm" placeholder="비밀번호 확인" required />
                </div>
                <button type="submit" class="btn-primary auth-submit-btn">회원가입</button>
                <div class="auth-error" id="signup-error"></div>
              </form>

              <!-- 구분선 -->
              <div class="auth-divider">
                <span>또는</span>
              </div>

              <!-- 소셜 로그인 -->
              <div class="social-login">
                <button class="btn-google" id="google-login-btn">
                  <span class="google-icon">G</span>
                  Google로 계속하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 데이터 백업 (JSON 다운로드)
  backupData() {
    try {
      const allData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          todos: JSON.parse(localStorage.getItem('nanal_todos') || '[]'),
          events: JSON.parse(localStorage.getItem('nanal_events') || '[]'),
          goals: JSON.parse(localStorage.getItem('nanal_goals') || '[]'),
          habits: JSON.parse(localStorage.getItem('nanal_habits') || '[]'),
          timetable: JSON.parse(localStorage.getItem('nanal_timetable') || '[]'),
          budgets: JSON.parse(localStorage.getItem('nanal_budgets') || '[]')
        }
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `nanal-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      alert('데이터가 백업되었습니다!');
    } catch (error) {
      console.error('Backup error:', error);
      alert('백업에 실패했습니다.');
    }
  },

  // 데이터 복원 (JSON 업로드)
  async restoreData(file) {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.data) {
        throw new Error('올바른 백업 파일이 아닙니다.');
      }

      if (!confirm('현재 데이터를 백업 파일로 덮어쓰시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) {
        return;
      }

      // LocalStorage에 복원
      const { data } = backupData;
      if (data.todos) localStorage.setItem('nanal_todos', JSON.stringify(data.todos));
      if (data.events) localStorage.setItem('nanal_events', JSON.stringify(data.events));
      if (data.goals) localStorage.setItem('nanal_goals', JSON.stringify(data.goals));
      if (data.habits) localStorage.setItem('nanal_habits', JSON.stringify(data.habits));
      if (data.timetable) localStorage.setItem('nanal_timetable', JSON.stringify(data.timetable));
      if (data.budgets) localStorage.setItem('nanal_budgets', JSON.stringify(data.budgets));

      alert('데이터가 복원되었습니다!\n\n페이지를 새로고침합니다.');
      window.location.reload();
    } catch (error) {
      console.error('Restore error:', error);
      alert('복원에 실패했습니다. 올바른 백업 파일인지 확인해주세요.');
    }
  },

  // 전체 데이터 삭제
  deleteAllData() {
    if (!confirm('정말로 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    if (!confirm('마지막 확인: 백업하지 않은 데이터는 복구할 수 없습니다.\n\n계속하시겠습니까?')) {
      return;
    }

    try {
      localStorage.removeItem('nanal_todos');
      localStorage.removeItem('nanal_events');
      localStorage.removeItem('nanal_goals');
      localStorage.removeItem('nanal_habits');
      localStorage.removeItem('nanal_timetable');
      localStorage.removeItem('nanal_budgets');

      alert('모든 데이터가 삭제되었습니다.\n\n페이지를 새로고침합니다.');
      window.location.reload();
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제에 실패했습니다.');
    }
  },

  // 초기화
  init() {
    console.log('More screen initialized');

    // 테마 토글 버튼
    const themeToggleBtn = document.getElementById('theme-toggle-more');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
        // 화면 다시 렌더링하여 버튼 텍스트 업데이트
        const container = document.getElementById('screen-container');
        container.innerHTML = this.render();
        this.init();
      });
    }

    // 로그인 버튼 클릭
    const showLoginBtn = document.getElementById('show-login-btn');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => {
        this.showAuthModal();
      });
    }

    // 로그아웃 버튼 클릭
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.handleLogout();
      });
    }

    // 모달 닫기 버튼
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        this.hideAuthModal();
      });
    }

    // 모달 외부 클릭 시 닫기
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
          this.hideAuthModal();
        }
      });
    }

    // 탭 전환
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchAuthTab(tabName);
      });
    });

    // 로그인 폼 제출
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleLogin();
      });
    }

    // 회원가입 폼 제출
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSignup();
      });
    }

    // Google 로그인 버튼
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', async () => {
        await this.handleGoogleLogin();
      });
    }

    // 백업 버튼
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        this.backupData();
      });
    }

    // 복원 버튼
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFileInput = document.getElementById('restore-file-input');
    if (restoreBtn && restoreFileInput) {
      restoreBtn.addEventListener('click', () => {
        restoreFileInput.click();
      });

      restoreFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          await this.restoreData(file);
          restoreFileInput.value = ''; // Reset input
        }
      });
    }

    // 전체 삭제 버튼
    const deleteAllBtn = document.getElementById('delete-all-btn');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', () => {
        this.deleteAllData();
      });
    }
  },

  // 로그인 모달 표시
  showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.getElementById('login-email')?.focus();
    }
  },

  // 로그인 모달 숨김
  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      // 에러 메시지 초기화
      document.getElementById('login-error').textContent = '';
      document.getElementById('signup-error').textContent = '';
      // 폼 초기화
      document.getElementById('login-form')?.reset();
      document.getElementById('signup-form')?.reset();
    }
  },

  // 탭 전환
  switchAuthTab(tabName) {
    // 탭 버튼 활성화
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // 폼 표시/숨김
    document.getElementById('login-form').style.display = tabName === 'login' ? 'block' : 'none';
    document.getElementById('signup-form').style.display = tabName === 'signup' ? 'block' : 'none';

    // 제목 변경
    document.getElementById('auth-modal-title').textContent = tabName === 'login' ? '로그인' : '회원가입';
  },

  // 로그인 처리
  async handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
      errorEl.textContent = '';
      await FirebaseAuth.signIn(email, password);
      this.hideAuthModal();
      alert('로그인 성공!');
    } catch (error) {
      console.error('Login error:', error);
      errorEl.textContent = this.getErrorMessage(error.code);
    }
  },

  // 회원가입 처리
  async handleSignup() {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const errorEl = document.getElementById('signup-error');

    try {
      errorEl.textContent = '';

      // 비밀번호 확인
      if (password !== passwordConfirm) {
        errorEl.textContent = '비밀번호가 일치하지 않습니다.';
        return;
      }

      if (password.length < 6) {
        errorEl.textContent = '비밀번호는 6자 이상이어야 합니다.';
        return;
      }

      await FirebaseAuth.signUp(email, password);
      this.hideAuthModal();
      alert('회원가입 성공! 로그인되었습니다.');
    } catch (error) {
      console.error('Signup error:', error);
      errorEl.textContent = this.getErrorMessage(error.code);
    }
  },

  // Google 로그인 처리
  async handleGoogleLogin() {
    try {
      await FirebaseAuth.signInWithGoogle();
      this.hideAuthModal();
      alert('Google 로그인 성공!');
    } catch (error) {
      console.error('Google login error:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  },

  // 로그아웃 처리
  async handleLogout() {
    if (!confirm('로그아웃하시겠습니까?')) return;

    try {
      await FirebaseAuth.signOut();
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error:', error);
      alert('로그아웃에 실패했습니다.');
    }
  },

  // 에러 메시지 번역
  getErrorMessage(errorCode) {
    const messages = {
      'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
      'auth/user-disabled': '비활성화된 계정입니다.',
      'auth/user-not-found': '사용자를 찾을 수 없습니다.',
      'auth/wrong-password': '잘못된 비밀번호입니다.',
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
      'auth/weak-password': '비밀번호가 너무 약합니다.',
      'auth/operation-not-allowed': '이 인증 방법은 허용되지 않습니다.',
      'auth/popup-closed-by-user': '팝업이 닫혔습니다.'
    };
    return messages[errorCode] || '오류가 발생했습니다. 다시 시도해주세요.';
  },

  // 화면 정리
  destroy() {
    console.log('More screen destroyed');
  }
};

export default MoreScreen;
