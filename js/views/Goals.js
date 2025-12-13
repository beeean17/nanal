// views/Goals.js - Goals & Growth tracking view

import { dataManager } from '../state.js';
import { GoalModal } from '../components/modals/GoalModal.js';
import { HabitModal } from '../components/modals/HabitModal.js';
import { TaskModal } from '../components/modals/TaskModal.js';
import { GoalProgressBar } from '../components/progress/GoalProgressBar.js';
import { DateUtils, ValidationUtils } from '../utils.js';

export default class GoalsView {
  constructor() {
    this.goalModal = null;
    this.habitModal = null;
    this.taskModal = null;
    this.goalProgressBars = new Map();
    this.goalDetailProgressBar = null;
    this.activeTab = 'goals';
    this.selectedGoalId = null;
    this.showCompletedGoals = false;
  }

  render() {
    return `
      <div class="home-layout fade-in">
        
        <header class="app-header mobile-tablet-only">
          <h1 class="app-title">Nanal</h1>
          <button class="notification-btn" aria-label="알림">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </header>

        <aside class="left-panel desktop-only">
          <h1 class="app-title">Nanal</h1>
          <nav class="sidebar-nav">
            <a href="#home" class="nav-item" data-screen="home">
              <span class="nav-icon">🏠</span><span class="nav-label">홈</span>
            </a>
            <a href="#calendar" class="nav-item" data-screen="calendar">
              <span class="nav-icon">📅</span><span class="nav-label">캘린더</span>
            </a>
            <a href="#goals" class="nav-item active" data-screen="goals">
              <span class="nav-icon">🎯</span><span class="nav-label">목표</span>
            </a>
            <a href="#ideas" class="nav-item" data-screen="ideas">
              <span class="nav-icon">💡</span><span class="nav-label">아이디어</span>
            </a>
            <a href="#settings" class="nav-item" data-screen="settings">
              <span class="nav-icon">⚙️</span><span class="nav-label">설정</span>
            </a>
          </nav>
        </aside>

        <main class="main-panel glass-card">
          <div class="card-header">
            <h3><span class="header-icon">🎯</span> 성장 트래킹</h3>
            <div class="header-actions">
              <button class="btn-primary" id="add-goal-btn">+ 목표</button>
              <button class="btn-secondary" id="add-habit-btn">+ 습관</button>
            </div>
          </div>

          <div class="goals-tabs">
            <button class="tab-btn active" data-tab="goals">목표</button>
            <button class="tab-btn" data-tab="habits">습관</button>
          </div>

          <div class="goals-content">
            <div class="tab-content active" id="goals-tab">
              <div class="goals-filters">
                <label><input type="checkbox" id="show-completed-goals" /> 완료된 목표 표시</label>
              </div>
              <div class="goals-list" id="goals-list"></div>
              <div class="goals-empty-state" id="goals-empty-state" style="display: none;">
                <div class="empty-icon">🎯</div>
                <h3>목표가 없습니다</h3>
                <button class="btn-primary" id="add-goal-empty-btn">첫 목표 추가</button>
              </div>
            </div>

            <div class="tab-content" id="habits-tab" style="display: none;">
              <div class="habits-header">
                <h2>오늘의 습관</h2>
                <p id="habits-date"></p>
              </div>
              <div class="habits-list" id="habits-list"></div>
              <div class="habits-empty-state" id="habits-empty-state" style="display: none;">
                <div class="empty-icon">✨</div>
                <h3>습관이 없습니다</h3>
                <button class="btn-primary" id="add-habit-empty-btn">첫 습관 추가</button>
              </div>
            </div>
          </div>
        </main>

        <nav class="bottom-nav mobile-tablet-only">
          <a href="#home" class="nav-item" data-screen="home"><span class="nav-icon">🏠</span></a>
          <a href="#calendar" class="nav-item" data-screen="calendar"><span class="nav-icon">📅</span></a>
          <a href="#goals" class="nav-item active" data-screen="goals"><span class="nav-icon">🎯</span></a>
          <a href="#ideas" class="nav-item" data-screen="ideas"><span class="nav-icon">💡</span></a>
          <a href="#settings" class="nav-item" data-screen="settings"><span class="nav-icon">⚙️</span></a>
        </nav>

        <!-- Goal Detail Modal -->
        <div class="modal" id="goal-detail-modal" style="display: none;">
          <div class="modal-overlay" id="goal-detail-overlay"></div>
          <div class="modal-content modal-content-large">
            <div class="modal-header">
              <h3 id="goal-detail-title">목표 상세</h3>
              <button class="modal-close-btn" id="goal-detail-close-btn">×</button>
            </div>
            <div class="modal-body" id="goal-detail-body"></div>
            <div class="modal-footer">
              <button class="btn-primary" id="add-subgoal-btn">+ 세부 목표</button>
              <button class="btn-secondary" id="edit-goal-btn">수정</button>
              <button class="btn-danger" id="delete-goal-btn">삭제</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  init() {
    this.initializeComponents();
    this.refreshView();
    this.subscribeToData();
    this.attachEventListeners();
    this.updateHabitsDate();
  }

  initializeComponents() {
    this.goalModal = new GoalModal('goal-modal', {
      onSave: (data) => this.handleSaveGoal(data),
      categories: dataManager.categories
    });

    this.habitModal = new HabitModal('habit-modal', {
      onSave: (data) => this.handleSaveHabit(data),
      categories: dataManager.categories
    });

    this.taskModal = new TaskModal('task-modal', {
      onSave: (data) => this.handleSaveSubGoalSchedule(data),
      categories: dataManager.categories
    });
  }

  subscribeToData() {
    dataManager.subscribe('goals', () => this.refreshView());
    dataManager.subscribe('subGoals', () => {
      if (this.selectedGoalId) this.showGoalDetail(this.selectedGoalId);
      this.refreshView();
    });
    dataManager.subscribe('habits', () => this.refreshView());
    dataManager.subscribe('habitLogs', () => this.refreshView());
  }

  refreshView() {
    if (this.activeTab === 'goals') this.renderGoals();
    else this.renderHabits();
  }

  cleanupGoalProgressBars() {
    this.goalProgressBars.forEach(pb => pb.destroy());
    this.goalProgressBars.clear();
  }

  renderGoals() {
    const container = document.getElementById('goals-list');
    const emptyState = document.getElementById('goals-empty-state');
    if (!container) return;

    this.cleanupGoalProgressBars();

    let goals = [...dataManager.goals];
    if (!this.showCompletedGoals) {
      goals = goals.filter(g => (g.progress || 0) < 100);
    }
    goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (goals.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = goals.map(goal => this.renderGoalCard(goal)).join('');

    goals.forEach(goal => {
      const pb = new GoalProgressBar(`goal-progress-${goal.id}`, {
        progress: goal.progress || 0,
        color: goal.categoryColor || '#007AFF',
        height: '8px',
        animated: true
      });
      pb.mount();
      this.goalProgressBars.set(goal.id, pb);
    });

    this.attachGoalCardListeners();
  }

  renderGoalCard(goal) {
    const categoryColor = goal.categoryColor || '#007AFF';
    const isCompleted = (goal.progress || 0) >= 100;
    const dateRange = (goal.startDate && goal.endDate) ?
      `${DateUtils.formatDateKorean(new Date(goal.startDate))} ~ ${DateUtils.formatDateKorean(new Date(goal.endDate))}` : '';
    const subGoals = dataManager.getSubGoalsByGoalId(goal.id);
    const completedSubGoals = subGoals.filter(sg => sg.isCompleted).length;

    return `
      <div class="goal-card glass-card ${isCompleted ? 'completed' : ''}" data-goal-id="${goal.id}">
        <div class="goal-card-header" style="border-left-color: ${categoryColor};">
          <h3>${ValidationUtils.escapeHtml(goal.title)}</h3>
          ${isCompleted ? '<span class="completed-badge">✓ 완료</span>' : ''}
        </div>
        <div class="goal-card-body">
          <p class="goal-description">${ValidationUtils.escapeHtml(goal.description || '')}</p>
          ${dateRange ? `<div class="goal-date">📅 ${dateRange}</div>` : ''}
          <div id="goal-progress-${goal.id}"></div>
          ${subGoals.length > 0 ? `<div class="goal-subgoals">🎯 세부 목표: ${completedSubGoals}/${subGoals.length}</div>` : ''}
        </div>
        <div class="goal-card-footer">
          <button class="view-goal-btn btn-sm" data-goal-id="${goal.id}">상세보기</button>
          <button class="edit-goal-btn btn-sm" data-goal-id="${goal.id}">수정</button>
        </div>
      </div>
    `;
  }

  renderHabits() {
    const container = document.getElementById('habits-list');
    const emptyState = document.getElementById('habits-empty-state');
    if (!container) return;

    const habits = dataManager.habits.filter(h => h.isActive !== false);

    if (habits.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    const today = DateUtils.formatDate(new Date());
    container.innerHTML = habits.map(habit => this.renderHabitCard(habit, today)).join('');
    this.attachHabitCardListeners();
  }

  renderHabitCard(habit, today) {
    const categoryColor = habit.categoryColor || '#34C759';
    const isCompletedToday = dataManager.isHabitCompletedOnDate(habit.id, today);
    const streak = dataManager.getHabitStreak(habit.id);
    const completionRate = dataManager.getHabitCompletionRate(habit.id, 30);

    return `
      <div class="habit-card glass-card ${isCompletedToday ? 'completed' : ''}" data-habit-id="${habit.id}">
        <div class="habit-header">
          <div class="habit-icon" style="background: ${categoryColor}40;">${habit.icon || '✨'}</div>
          <div class="habit-info">
            <h3>${ValidationUtils.escapeHtml(habit.title)}</h3>
            <div class="habit-stats">🔥 ${streak}일 연속 | 📊 ${completionRate}%</div>
          </div>
        </div>
        <button class="habit-check-btn ${isCompletedToday ? 'checked' : ''}" data-habit-id="${habit.id}">
          ${isCompletedToday ? '완료됨 ✓' : '완료하기'}
        </button>
        <div class="habit-footer">
          <button class="edit-habit-btn btn-icon" data-habit-id="${habit.id}">✏️</button>
          <button class="delete-habit-btn btn-icon" data-habit-id="${habit.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
    });

    const addGoalBtn = document.getElementById('add-goal-btn');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const addGoalEmptyBtn = document.getElementById('add-goal-empty-btn');
    const addHabitEmptyBtn = document.getElementById('add-habit-empty-btn');

    if (addGoalBtn) addGoalBtn.addEventListener('click', () => this.handleAddGoal());
    if (addHabitBtn) addHabitBtn.addEventListener('click', () => this.handleAddHabit());
    if (addGoalEmptyBtn) addGoalEmptyBtn.addEventListener('click', () => this.handleAddGoal());
    if (addHabitEmptyBtn) addHabitEmptyBtn.addEventListener('click', () => this.handleAddHabit());

    const showCompletedCheckbox = document.getElementById('show-completed-goals');
    if (showCompletedCheckbox) {
      showCompletedCheckbox.addEventListener('change', (e) => {
        this.showCompletedGoals = e.target.checked;
        this.renderGoals();
      });
    }

    this.attachGoalDetailModalListeners();
  }

  attachGoalDetailModalListeners() {
    const closeBtn = document.getElementById('goal-detail-close-btn');
    const overlay = document.getElementById('goal-detail-overlay');
    const editBtn = document.getElementById('edit-goal-btn');
    const deleteBtn = document.getElementById('delete-goal-btn');
    const addSubGoalBtn = document.getElementById('add-subgoal-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeGoalDetailModal());
    if (overlay) overlay.addEventListener('click', () => this.closeGoalDetailModal());
    if (editBtn) editBtn.addEventListener('click', () => this.handleEditGoalFromDetail());
    if (deleteBtn) deleteBtn.addEventListener('click', () => this.handleDeleteGoalFromDetail());
    if (addSubGoalBtn) addSubGoalBtn.addEventListener('click', () => this.handleAddSubGoal());
  }

  attachGoalCardListeners() {
    document.querySelectorAll('.view-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showGoalDetail(e.currentTarget.dataset.goalId);
      });
    });
    document.querySelectorAll('.edit-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEditGoal(e.currentTarget.dataset.goalId);
      });
    });
  }

  attachHabitCardListeners() {
    document.querySelectorAll('.habit-check-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleToggleHabit(btn.dataset.habitId));
    });
    document.querySelectorAll('.edit-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEditHabit(e.currentTarget.dataset.habitId);
      });
    });
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDeleteHabit(e.currentTarget.dataset.habitId);
      });
    });
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    const activeContent = document.getElementById(`${tab}-tab`);
    if (activeContent) activeContent.style.display = 'block';

    const addGoalBtn = document.getElementById('add-goal-btn');
    const addHabitBtn = document.getElementById('add-habit-btn');
    if (addGoalBtn) addGoalBtn.style.display = tab === 'goals' ? 'block' : 'none';
    if (addHabitBtn) addHabitBtn.style.display = tab === 'habits' ? 'block' : 'none';

    this.refreshView();
  }

  updateHabitsDate() {
    const el = document.getElementById('habits-date');
    if (el) el.textContent = DateUtils.formatDateKorean(new Date());
  }

  handleAddGoal() { this.goalModal.show({ startDate: DateUtils.formatDate(new Date()), progress: 0 }); }
  handleSaveGoal(data) {
    if (data.id) dataManager.updateGoal(data.id, data);
    else dataManager.addGoal(data);
    this.goalModal.hide();
  }
  handleEditGoal(id) {
    const g = dataManager.getGoalById(id);
    if (g) this.goalModal.show(g);
  }

  handleAddHabit() { this.habitModal.show({}); }
  handleSaveHabit(data) {
    if (data.id) dataManager.updateHabit(data.id, data);
    else dataManager.addHabit(data);
    this.habitModal.hide();
  }
  handleEditHabit(id) {
    const h = dataManager.getHabitById(id);
    if (h) this.habitModal.show(h);
  }
  handleDeleteHabit(id) {
    if (confirm('습관을 삭제하시겠습니까?')) dataManager.deleteHabit(id);
  }
  handleToggleHabit(id) {
    const isCompleted = dataManager.isHabitCompletedOnDate(id, DateUtils.formatDate(new Date()));
    if (!isCompleted) {
      dataManager.completeHabit(id, DateUtils.formatDate(new Date()));
    }
  }

  showGoalDetail(id) {
    this.selectedGoalId = id;
    const goal = dataManager.getGoalById(id);
    if (!goal) return;

    const modal = document.getElementById('goal-detail-modal');
    const title = document.getElementById('goal-detail-title');
    const body = document.getElementById('goal-detail-body');

    if (title) title.textContent = goal.title;

    const subGoals = dataManager.getSubGoalsByGoalId(id);

    body.innerHTML = `
      <div class="goal-detail-content">
        <p>${ValidationUtils.escapeHtml(goal.description || '')}</p>
        <div id="goal-detail-progress"></div>
        <h4>세부 목표</h4>
        <div class="subgoals-list">
          ${subGoals.length ? subGoals.map(sg => this.renderSubGoalItem(sg)).join('') : '<p>세부 목표가 없습니다.</p>'}
        </div>
      </div>
    `;

    if (this.goalDetailProgressBar) this.goalDetailProgressBar.destroy();
    this.goalDetailProgressBar = new GoalProgressBar('goal-detail-progress', {
      progress: goal.progress || 0,
      color: goal.categoryColor,
      height: '12px'
    });
    this.goalDetailProgressBar.mount();

    document.querySelectorAll('.subgoal-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => this.handleToggleSubGoal(e.target.dataset.subgoalId, e.target.checked));
    });

    modal.style.display = 'flex';
  }

  renderSubGoalItem(sg) {
    return `
      <div class="subgoal-item">
        <input type="checkbox" class="subgoal-checkbox" data-subgoal-id="${sg.id}" ${sg.isCompleted ? 'checked' : ''}>
        <span style="${sg.isCompleted ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${ValidationUtils.escapeHtml(sg.title)}</span>
      </div>
    `;
  }

  handleToggleSubGoal(id, completed) {
    dataManager.updateSubGoal(id, { isCompleted: completed });
  }

  handleAddSubGoal() {
    const title = prompt("새 세부 목표 이름:");
    if (title && this.selectedGoalId) {
      dataManager.addSubGoal({ goalId: this.selectedGoalId, title });
    }
  }

  handleEditGoalFromDetail() {
    if (this.selectedGoalId) {
      this.closeGoalDetailModal();
      this.handleEditGoal(this.selectedGoalId);
    }
  }

  handleDeleteGoalFromDetail() {
    if (this.selectedGoalId && confirm('정말 삭제하시겠습니까?')) {
      dataManager.deleteGoal(this.selectedGoalId);
      this.closeGoalDetailModal();
    }
  }

  closeGoalDetailModal() {
    const modal = document.getElementById('goal-detail-modal');
    if (modal) modal.style.display = 'none';
    this.selectedGoalId = null;
  }

  destroy() {
    this.cleanupGoalProgressBars();
    if (this.goalModal) this.goalModal.hide();
    if (this.habitModal) this.habitModal.hide();
  }
}
