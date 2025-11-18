// growth.js - 성장 트래킹 화면 모듈
// 장기 목표와 매일의 습관을 추적하고 관리

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const GrowthScreen = {
  currentTab: 'goals', // 'goals' or 'habits'
  goals: [], // 목표 리스트
  habits: [], // 습관 리스트
  currentEditingGoalId: null,
  currentEditingHabitId: null,

  // 화면 렌더링
  render() {
    return `
      <div class="growth-screen fade-in">
        <div class="growth-header">
          <h1 class="screen-title">성장 트래킹</h1>
          <p class="screen-subtitle">목표를 달성하고 습관을 만들어가세요</p>
        </div>

        <!-- 탭 네비게이션 -->
        <div class="tab-navigation">
          <button class="tab-btn active" data-tab="goals">🎯 목표</button>
          <button class="tab-btn" data-tab="habits">✅ 습관</button>
        </div>

        <!-- 목표 탭 -->
        <section class="tab-content goals-tab active" data-tab-content="goals">
          <div class="section-header">
            <h2>진행 중인 목표</h2>
            <button class="add-btn" id="add-goal-btn" aria-label="목표 추가">+</button>
          </div>
          <div class="goals-list" id="goals-list">
            <!-- 목표 카드들이 여기에 동적으로 추가됩니다 -->
          </div>
        </section>

        <!-- 습관 탭 -->
        <section class="tab-content habits-tab" data-tab-content="habits">
          <div class="section-header">
            <h2>습관 트래커</h2>
            <button class="add-btn" id="add-habit-btn" aria-label="습관 추가">+</button>
          </div>
          <div class="habits-list" id="habits-list">
            <!-- 습관 카드들이 여기에 동적으로 추가됩니다 -->
          </div>
        </section>

        <!-- 목표 추가/수정 모달 -->
        <div class="modal-overlay" id="goal-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="goal-modal-title">목표 추가</h3>
              <button class="modal-close-btn" id="goal-modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <form id="goal-form">
                <div class="form-group">
                  <label for="goal-title">목표 제목</label>
                  <input type="text" id="goal-title" class="form-input" placeholder="예: TOEIC 900점 달성" required />
                </div>

                <div class="form-group">
                  <label for="goal-description">설명 (선택)</label>
                  <textarea id="goal-description" class="form-input" rows="3" placeholder="목표에 대한 설명..."></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="goal-start-date">시작일</label>
                    <input type="date" id="goal-start-date" class="form-input" required />
                  </div>
                  <div class="form-group">
                    <label for="goal-end-date">마감일</label>
                    <input type="date" id="goal-end-date" class="form-input" required />
                  </div>
                </div>

                <div class="form-group">
                  <label for="goal-progress">진행률 (%)</label>
                  <input type="number" id="goal-progress" class="form-input" min="0" max="100" value="0" />
                </div>

                <div class="form-group">
                  <label for="goal-category">카테고리</label>
                  <select id="goal-category" class="form-select" required>
                    <option value="study">📚 학습</option>
                    <option value="health">💪 건강</option>
                    <option value="career">💼 커리어</option>
                    <option value="finance">💰 재정</option>
                    <option value="other">📌 기타</option>
                  </select>
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" id="goal-cancel-btn">취소</button>
                  <button type="submit" class="btn-primary" id="save-goal-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 습관 추가/수정 모달 -->
        <div class="modal-overlay" id="habit-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="habit-modal-title">습관 추가</h3>
              <button class="modal-close-btn" id="habit-modal-close-btn">×</button>
            </div>
            <div class="modal-body">
              <form id="habit-form">
                <div class="form-group">
                  <label for="habit-name">습관 이름</label>
                  <input type="text" id="habit-name" class="form-input" placeholder="예: 아침 러닝" required />
                </div>

                <div class="form-group">
                  <label for="habit-frequency">목표 빈도</label>
                  <select id="habit-frequency" class="form-select" required>
                    <option value="daily">매일</option>
                    <option value="weekly">주 N회</option>
                  </select>
                </div>

                <div class="form-group" id="target-days-group" style="display: none;">
                  <label for="habit-target-days">주당 목표 (회)</label>
                  <input type="number" id="habit-target-days" class="form-input" min="1" max="7" value="3" />
                </div>

                <div class="modal-actions">
                  <button type="button" class="btn-secondary" id="habit-cancel-btn">취소</button>
                  <button type="submit" class="btn-primary" id="save-habit-btn">저장</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ============ Goals Methods ============

  // 목표 리스트 렌더링
  renderGoalsList() {
    const container = document.getElementById('goals-list');
    if (!container) return;

    if (this.goals.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🎯</span>
          <p>아직 목표가 없습니다</p>
          <p class="empty-hint">+ 버튼을 눌러 목표를 추가해보세요</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.goals.map(goal => this.renderGoalCard(goal)).join('');
    this.attachGoalListeners();
  },

  // 목표 카드 렌더링
  renderGoalCard(goal) {
    const daysLeft = this.calculateDaysLeft(goal.endDate);
    const categoryIcon = this.getCategoryIcon(goal.category);
    const progressColor = this.getProgressColor(goal.progress);

    return `
      <div class="goal-card" data-id="${goal.id}">
        <div class="goal-card-header">
          <span class="goal-category">${categoryIcon} ${this.getCategoryLabel(goal.category)}</span>
          <span class="goal-dday ${daysLeft < 0 ? 'expired' : daysLeft <= 7 ? 'urgent' : ''}">${this.formatDDay(daysLeft)}</span>
        </div>
        <h3 class="goal-title">${this.escapeHtml(goal.title)}</h3>
        ${goal.description ? `<p class="goal-description">${this.escapeHtml(goal.description)}</p>` : ''}
        <div class="goal-progress-section">
          <div class="goal-progress-header">
            <span class="progress-label">진행률</span>
            <span class="progress-value">${goal.progress}%</span>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${goal.progress}%; background-color: ${progressColor};"></div>
          </div>
        </div>
        <div class="goal-dates">
          <span class="goal-date">📅 ${goal.startDate} ~ ${goal.endDate}</span>
        </div>
        <div class="goal-actions">
          <button class="goal-edit-btn" data-id="${goal.id}">✏️</button>
          <button class="goal-delete-btn" data-id="${goal.id}">🗑️</button>
        </div>
      </div>
    `;
  },

  // D-Day 계산
  calculateDaysLeft(endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diff = end - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // D-Day 포맷팅
  formatDDay(days) {
    if (days < 0) return `D+${Math.abs(days)}`;
    if (days === 0) return 'D-Day';
    return `D-${days}`;
  },

  // 카테고리 아이콘
  getCategoryIcon(category) {
    const icons = {
      study: '📚',
      health: '💪',
      career: '💼',
      finance: '💰',
      other: '📌'
    };
    return icons[category] || icons.other;
  },

  // 카테고리 레이블
  getCategoryLabel(category) {
    const labels = {
      study: '학습',
      health: '건강',
      career: '커리어',
      finance: '재정',
      other: '기타'
    };
    return labels[category] || labels.other;
  },

  // 진행률 색상
  getProgressColor(progress) {
    if (progress >= 80) return '#34C759';
    if (progress >= 50) return '#007AFF';
    if (progress >= 30) return '#FF9500';
    return '#FF3B30';
  },

  // 목표 리스너 연결
  attachGoalListeners() {
    document.querySelectorAll('.goal-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openGoalModal('edit', id);
      });
    });

    document.querySelectorAll('.goal-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.deleteGoal(id);
      });
    });
  },

  // 목표 모달 열기
  openGoalModal(mode, goalId = null) {
    const modal = document.getElementById('goal-modal');
    const modalTitle = document.getElementById('goal-modal-title');
    const form = document.getElementById('goal-form');

    if (!modal || !modalTitle || !form) return;

    this.currentEditingGoalId = goalId;
    modalTitle.textContent = mode === 'add' ? '목표 추가' : '목표 수정';

    if (mode === 'edit' && goalId) {
      const goal = this.goals.find(g => g.id === goalId);
      if (goal) {
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-description').value = goal.description || '';
        document.getElementById('goal-start-date').value = goal.startDate;
        document.getElementById('goal-end-date').value = goal.endDate;
        document.getElementById('goal-progress').value = goal.progress;
        document.getElementById('goal-category').value = goal.category;
      }
    } else {
      form.reset();
      // 기본값: 오늘 날짜
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('goal-start-date').value = today;
    }

    modal.style.display = 'flex';
  },

  // 목표 모달 닫기
  closeGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentEditingGoalId = null;
  },

  // 목표 저장
  async saveGoal() {
    const title = document.getElementById('goal-title').value.trim();
    const description = document.getElementById('goal-description').value.trim();
    const startDate = document.getElementById('goal-start-date').value;
    const endDate = document.getElementById('goal-end-date').value;
    const progress = parseInt(document.getElementById('goal-progress').value);
    const category = document.getElementById('goal-category').value;

    if (!title || !startDate || !endDate) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('마감일은 시작일 이후여야 합니다.');
      return;
    }

    if (this.currentEditingGoalId) {
      // 수정
      const goal = this.goals.find(g => g.id === this.currentEditingGoalId);
      if (goal) {
        goal.title = title;
        goal.description = description;
        goal.startDate = startDate;
        goal.endDate = endDate;
        goal.progress = progress;
        goal.category = category;
      }
    } else {
      // 추가
      const newGoal = {
        id: Date.now().toString(),
        title,
        description,
        startDate,
        endDate,
        progress,
        category,
        createdAt: new Date().toISOString()
      };
      this.goals.push(newGoal);
    }

    await this.saveGoals();
    this.renderGoalsList();
    this.closeGoalModal();
  },

  // 목표 삭제
  async deleteGoal(goalId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.goals = this.goals.filter(g => g.id !== goalId);
    await this.saveGoals();
    this.renderGoalsList();
  },

  // ============ Habits Methods ============

  // 습관 리스트 렌더링
  renderHabitsList() {
    const container = document.getElementById('habits-list');
    if (!container) return;

    if (this.habits.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">✅</span>
          <p>아직 습관이 없습니다</p>
          <p class="empty-hint">+ 버튼을 눌러 습관을 추가해보세요</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.habits.map(habit => this.renderHabitCard(habit)).join('');
    this.attachHabitListeners();
  },

  // 습관 카드 렌더링
  renderHabitCard(habit) {
    const streak = this.calculateStreak(habit.checks);
    const todayChecked = this.isTodayChecked(habit.checks);
    const weekProgress = this.getWeekProgress(habit);

    return `
      <div class="habit-card" data-id="${habit.id}">
        <div class="habit-card-header">
          <h3 class="habit-name">${this.escapeHtml(habit.name)}</h3>
          <div class="habit-streak">🔥 ${streak}일</div>
        </div>
        <div class="habit-frequency">
          ${habit.frequency === 'daily' ? '매일' : `주 ${habit.targetDays}회`}
        </div>
        ${habit.frequency === 'weekly' ? `<div class="habit-week-progress">${weekProgress}</div>` : ''}
        <div class="habit-actions">
          <button class="habit-check-btn ${todayChecked ? 'checked' : ''}" data-id="${habit.id}">
            ${todayChecked ? '✅ 완료' : '☐ 체크'}
          </button>
          <button class="habit-edit-btn" data-id="${habit.id}">✏️</button>
          <button class="habit-delete-btn" data-id="${habit.id}">🗑️</button>
        </div>
      </div>
    `;
  },

  // 연속 일수 계산
  calculateStreak(checks) {
    if (!checks || checks.length === 0) return 0;

    const sortedChecks = [...checks].sort().reverse(); // 최신순 정렬
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < sortedChecks.length; i++) {
      const checkDate = new Date(sortedChecks[i]);
      checkDate.setHours(0, 0, 0, 0);

      if (checkDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (checkDate < currentDate) {
        break;
      }
    }

    return streak;
  },

  // 오늘 체크 여부
  isTodayChecked(checks) {
    const today = new Date().toISOString().split('T')[0];
    return checks && checks.includes(today);
  },

  // 주간 진행률
  getWeekProgress(habit) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // 일요일
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekChecks = (habit.checks || []).filter(check => {
      const checkDate = new Date(check);
      return checkDate >= startOfWeek;
    });

    return `이번 주: ${thisWeekChecks.length} / ${habit.targetDays}`;
  },

  // 습관 리스너 연결
  attachHabitListeners() {
    document.querySelectorAll('.habit-check-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.toggleHabitCheck(id);
      });
    });

    document.querySelectorAll('.habit-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openHabitModal('edit', id);
      });
    });

    document.querySelectorAll('.habit-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.deleteHabit(id);
      });
    });
  },

  // 습관 체크 토글
  async toggleHabitCheck(habitId) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];

    if (!habit.checks) {
      habit.checks = [];
    }

    const index = habit.checks.indexOf(today);
    if (index > -1) {
      habit.checks.splice(index, 1); // 체크 해제
    } else {
      habit.checks.push(today); // 체크
    }

    await this.saveHabits();
    this.renderHabitsList();
  },

  // 습관 모달 열기
  openHabitModal(mode, habitId = null) {
    const modal = document.getElementById('habit-modal');
    const modalTitle = document.getElementById('habit-modal-title');
    const form = document.getElementById('habit-form');

    if (!modal || !modalTitle || !form) return;

    this.currentEditingHabitId = habitId;
    modalTitle.textContent = mode === 'add' ? '습관 추가' : '습관 수정';

    if (mode === 'edit' && habitId) {
      const habit = this.habits.find(h => h.id === habitId);
      if (habit) {
        document.getElementById('habit-name').value = habit.name;
        document.getElementById('habit-frequency').value = habit.frequency;
        if (habit.frequency === 'weekly') {
          document.getElementById('target-days-group').style.display = 'block';
          document.getElementById('habit-target-days').value = habit.targetDays;
        }
      }
    } else {
      form.reset();
      document.getElementById('target-days-group').style.display = 'none';
    }

    modal.style.display = 'flex';
  },

  // 습관 모달 닫기
  closeHabitModal() {
    const modal = document.getElementById('habit-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.currentEditingHabitId = null;
  },

  // 습관 저장
  async saveHabit() {
    const name = document.getElementById('habit-name').value.trim();
    const frequency = document.getElementById('habit-frequency').value;
    const targetDays = frequency === 'weekly' ? parseInt(document.getElementById('habit-target-days').value) : 7;

    if (!name) {
      alert('습관 이름을 입력해주세요.');
      return;
    }

    if (this.currentEditingHabitId) {
      // 수정
      const habit = this.habits.find(h => h.id === this.currentEditingHabitId);
      if (habit) {
        habit.name = name;
        habit.frequency = frequency;
        habit.targetDays = targetDays;
      }
    } else {
      // 추가
      const newHabit = {
        id: Date.now().toString(),
        name,
        frequency,
        targetDays,
        checks: [],
        createdAt: new Date().toISOString()
      };
      this.habits.push(newHabit);
    }

    await this.saveHabits();
    this.renderHabitsList();
    this.closeHabitModal();
  },

  // 습관 삭제
  async deleteHabit(habitId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.habits = this.habits.filter(h => h.id !== habitId);
    await this.saveHabits();
    this.renderHabitsList();
  },

  // ============ Storage Methods ============

  // LocalStorage - Goals
  saveGoalsToLocal() {
    try {
      localStorage.setItem('nanal_goals', JSON.stringify(this.goals));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  loadGoalsFromLocal() {
    try {
      const data = localStorage.getItem('nanal_goals');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // LocalStorage - Habits
  saveHabitsToLocal() {
    try {
      localStorage.setItem('nanal_habits', JSON.stringify(this.habits));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  loadHabitsFromLocal() {
    try {
      const data = localStorage.getItem('nanal_habits');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase - Goals
  async saveGoalsToFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return;
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        goals: this.goals,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  async loadGoalsFromFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return [];
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.goals || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // Firebase - Habits
  async saveHabitsToFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return;
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        habits: this.habits,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  async loadHabitsFromFirebase() {
    if (typeof FirebaseAuth === 'undefined' || typeof FirebaseDB === 'undefined') {
      return [];
    }

    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.habits || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // 통합 저장 - Goals
  async saveGoals() {
    this.saveGoalsToLocal();
    await this.saveGoalsToFirebase();
  },

  async loadGoals() {
    try {
      const firebaseGoals = await this.loadGoalsFromFirebase();
      if (firebaseGoals.length > 0) {
        this.goals = firebaseGoals;
        return;
      }

      this.goals = this.loadGoalsFromLocal();
    } catch (error) {
      console.error('Failed to load goals:', error);
      this.goals = [];
    }
  },

  // 통합 저장 - Habits
  async saveHabits() {
    this.saveHabitsToLocal();
    await this.saveHabitsToFirebase();
  },

  async loadHabits() {
    try {
      const firebaseHabits = await this.loadHabitsFromFirebase();
      if (firebaseHabits.length > 0) {
        this.habits = firebaseHabits;
        return;
      }

      this.habits = this.loadHabitsFromLocal();
    } catch (error) {
      console.error('Failed to load habits:', error);
      this.habits = [];
    }
  },

  // ============ Utility Methods ============

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 초기화
  async init() {
    console.log('Growth screen initialized');

    // 데이터 로드
    await this.loadGoals();
    await this.loadHabits();

    // 초기 렌더링
    this.renderGoalsList();
    this.renderHabitsList();

    // 탭 네비게이션 설정
    this.setupTabNavigation();

    // 목표 추가 버튼
    const addGoalBtn = document.getElementById('add-goal-btn');
    addGoalBtn?.addEventListener('click', () => this.openGoalModal('add'));

    // 습관 추가 버튼
    const addHabitBtn = document.getElementById('add-habit-btn');
    addHabitBtn?.addEventListener('click', () => this.openHabitModal('add'));

    // 목표 모달 이벤트
    const goalModal = document.getElementById('goal-modal');
    const goalCloseBtn = document.getElementById('goal-modal-close-btn');
    const goalCancelBtn = document.getElementById('goal-cancel-btn');
    const goalForm = document.getElementById('goal-form');

    goalCloseBtn?.addEventListener('click', () => this.closeGoalModal());
    goalCancelBtn?.addEventListener('click', () => this.closeGoalModal());
    goalForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGoal();
    });

    goalModal?.addEventListener('click', (e) => {
      if (e.target === goalModal) {
        this.closeGoalModal();
      }
    });

    // 습관 모달 이벤트
    const habitModal = document.getElementById('habit-modal');
    const habitCloseBtn = document.getElementById('habit-modal-close-btn');
    const habitCancelBtn = document.getElementById('habit-cancel-btn');
    const habitForm = document.getElementById('habit-form');

    habitCloseBtn?.addEventListener('click', () => this.closeHabitModal());
    habitCancelBtn?.addEventListener('click', () => this.closeHabitModal());
    habitForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHabit();
    });

    habitModal?.addEventListener('click', (e) => {
      if (e.target === habitModal) {
        this.closeHabitModal();
      }
    });

    // 주간 목표일 선택 시 표시/숨김
    const frequencySelect = document.getElementById('habit-frequency');
    frequencySelect?.addEventListener('change', (e) => {
      const targetDaysGroup = document.getElementById('target-days-group');
      if (e.target.value === 'weekly') {
        targetDaysGroup.style.display = 'block';
      } else {
        targetDaysGroup.style.display = 'none';
      }
    });
  },

  // 탭 네비게이션 설정
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;

        // 모든 탭 비활성화
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // 선택된 탭 활성화
        e.target.classList.add('active');
        document.querySelector(`[data-tab-content="${targetTab}"]`).classList.add('active');

        this.currentTab = targetTab;
      });
    });
  },

  // 화면 정리
  destroy() {
    console.log('Growth screen destroyed');
  }
};

export default GrowthScreen;
