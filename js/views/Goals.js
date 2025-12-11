// views/Goals.js - Goals & Growth tracking view
// Manages goals, subgoals, and habits

import { dataManager } from '../state.js';
import { GoalModal, HabitModal, TaskModal } from '../components/Modal.js';
import { DateUtils, ValidationUtils } from '../utils.js';

/**
 * Goals View - Goals, SubGoals, and Habits management
 * @class
 */
export default class GoalsView {
  constructor() {
    // Component instances
    this.goalModal = null;
    this.habitModal = null;
    this.taskModal = null;

    // State
    this.activeTab = 'goals'; // 'goals' or 'habits'
    this.selectedGoalId = null;
    this.showCompletedGoals = false;

    // Bound methods
    this.boundRefreshView = this.refreshView.bind(this);
  }

  /**
   * Render goals view HTML
   * @returns {string} HTML string
   */
  render() {
    return `
      <div class="goals-screen fade-in">
        <!-- Header -->
        <div class="goals-header">
          <h1>🎯 성장 트래킹</h1>
          <div class="goals-header-actions">
            <button class="btn-primary" id="add-goal-btn">
              <span class="btn-icon">+</span>
              <span class="btn-text">목표 추가</span>
            </button>
            <button class="btn-primary" id="add-habit-btn">
              <span class="btn-icon">+</span>
              <span class="btn-text">습관 추가</span>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="goals-tabs">
          <button class="tab-btn active" data-tab="goals">목표</button>
          <button class="tab-btn" data-tab="habits">습관</button>
        </div>

        <!-- Goals Tab Content -->
        <div class="tab-content active" id="goals-tab">
          <!-- Filter Options -->
          <div class="goals-filters">
            <label class="filter-checkbox">
              <input type="checkbox" id="show-completed-goals" />
              <span>완료된 목표 표시</span>
            </label>
          </div>

          <!-- Goals List -->
          <div class="goals-list" id="goals-list">
            <!-- Goal cards rendered here -->
          </div>

          <!-- Empty State -->
          <div class="goals-empty-state" id="goals-empty-state" style="display: none;">
            <div class="empty-icon">🎯</div>
            <h3>목표가 없습니다</h3>
            <p>새로운 목표를 추가하여 성장을 시작하세요!</p>
            <button class="btn-primary" id="add-goal-empty-btn">
              <span class="btn-icon">+</span>
              <span class="btn-text">첫 목표 추가</span>
            </button>
          </div>
        </div>

        <!-- Habits Tab Content -->
        <div class="tab-content" id="habits-tab" style="display: none;">
          <!-- Today's Date -->
          <div class="habits-header">
            <h2>오늘의 습관</h2>
            <p class="habits-date" id="habits-date"></p>
          </div>

          <!-- Habits List -->
          <div class="habits-list" id="habits-list">
            <!-- Habit cards rendered here -->
          </div>

          <!-- Empty State -->
          <div class="habits-empty-state" id="habits-empty-state" style="display: none;">
            <div class="empty-icon">✨</div>
            <h3>습관이 없습니다</h3>
            <p>새로운 습관을 추가하여 일상을 개선하세요!</p>
            <button class="btn-primary" id="add-habit-empty-btn">
              <span class="btn-icon">+</span>
              <span class="btn-text">첫 습관 추가</span>
            </button>
          </div>
        </div>

        <!-- Goal Detail Modal -->
        <div class="modal" id="goal-detail-modal" style="display: none;">
          <div class="modal-overlay" id="goal-detail-overlay"></div>
          <div class="modal-content modal-content-large">
            <div class="modal-header">
              <h3 id="goal-detail-title">목표 상세</h3>
              <button class="modal-close-btn" id="goal-detail-close-btn">×</button>
            </div>
            <div class="modal-body" id="goal-detail-body">
              <!-- Goal details rendered here -->
            </div>
            <div class="modal-footer">
              <button class="btn-primary" id="add-subgoal-btn">
                <span class="btn-icon">+</span>
                <span class="btn-text">세부 목표 추가</span>
              </button>
              <button class="btn-secondary" id="edit-goal-btn">수정</button>
              <button class="btn-danger" id="delete-goal-btn">삭제</button>
              <button class="btn-secondary" id="goal-detail-cancel-btn">닫기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize view after rendering
   */
  init() {
    console.log('[GoalsView] Initializing...');

    // Initialize components
    this.initializeComponents();

    // Load and display data
    this.refreshView();

    // Subscribe to data changes
    this.subscribeToData();

    // Attach event listeners
    this.attachEventListeners();

    // Update habits date
    this.updateHabitsDate();

    console.log('[GoalsView] Initialized successfully');
  }

  /**
   * Initialize component instances
   */
  initializeComponents() {
    // GoalModal
    this.goalModal = new GoalModal('goal-modal', {
      onSave: (goalData) => this.handleSaveGoal(goalData),
      categories: dataManager.categories
    });

    // HabitModal
    this.habitModal = new HabitModal('habit-modal', {
      onSave: (habitData) => this.handleSaveHabit(habitData),
      categories: dataManager.categories
    });

    // TaskModal (for scheduling subgoals)
    this.taskModal = new TaskModal('task-modal', {
      onSave: (taskData) => this.handleSaveSubGoalSchedule(taskData),
      categories: dataManager.categories
    });
  }

  /**
   * Subscribe to data changes
   */
  subscribeToData() {
    dataManager.subscribe('goals', (changeInfo) => {
      console.log('[GoalsView] Goals changed:', changeInfo);
      this.refreshView();
    });

    dataManager.subscribe('subGoals', (changeInfo) => {
      console.log('[GoalsView] SubGoals changed:', changeInfo);
      if (this.selectedGoalId) {
        this.showGoalDetail(this.selectedGoalId);
      }
    });

    dataManager.subscribe('habits', (changeInfo) => {
      console.log('[GoalsView] Habits changed:', changeInfo);
      this.refreshView();
    });

    dataManager.subscribe('habitLogs', (changeInfo) => {
      console.log('[GoalsView] HabitLogs changed:', changeInfo);
      this.refreshView();
    });
  }

  /**
   * Refresh view with current data
   */
  refreshView() {
    if (this.activeTab === 'goals') {
      this.renderGoals();
    } else {
      this.renderHabits();
    }
  }

  /**
   * Render goals list
   */
  renderGoals() {
    const container = document.getElementById('goals-list');
    const emptyState = document.getElementById('goals-empty-state');

    if (!container) return;

    // Filter goals
    let goals = [...dataManager.goals];

    if (!this.showCompletedGoals) {
      goals = goals.filter(g => (g.progress || 0) < 100);
    }

    // Sort by creation date (newest first)
    goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (goals.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = goals.map(goal => this.renderGoalCard(goal)).join('');

    // Attach goal card listeners
    this.attachGoalCardListeners();
  }

  /**
   * Render a single goal card
   * @param {Object} goal - Goal object
   * @returns {string} HTML string
   */
  renderGoalCard(goal) {
    const categoryColor = goal.categoryColor || '#007AFF';
    const progress = goal.progress || 0;
    const isCompleted = progress >= 100;

    const startDate = goal.startDate ? DateUtils.formatDateKorean(new Date(goal.startDate)) : '';
    const endDate = goal.endDate ? DateUtils.formatDateKorean(new Date(goal.endDate)) : '';
    const dateRange = startDate && endDate ? `${startDate} ~ ${endDate}` : '';

    // Get subgoals count
    const subGoals = dataManager.getSubGoalsByGoalId(goal.id);
    const completedSubGoals = subGoals.filter(sg => sg.isCompleted).length;

    return `
      <div class="goal-card ${isCompleted ? 'completed' : ''}" data-goal-id="${goal.id}">
        <div class="goal-card-header" style="background-color: ${categoryColor};">
          <h3 class="goal-title">${ValidationUtils.escapeHtml(goal.title)}</h3>
          ${isCompleted ? '<span class="goal-completed-badge">✓ 완료</span>' : ''}
        </div>

        <div class="goal-card-body">
          ${goal.description ? `
            <p class="goal-description">${ValidationUtils.escapeHtml(goal.description)}</p>
          ` : ''}

          ${dateRange ? `
            <div class="goal-dates">
              <span class="icon">📅</span>
              <span>${dateRange}</span>
            </div>
          ` : ''}

          <div class="goal-progress-section">
            <div class="goal-progress-header">
              <span>진행률</span>
              <span class="goal-progress-value">${progress}%</span>
            </div>
            <div class="goal-progress-bar">
              <div class="goal-progress-fill" style="width: ${progress}%; background-color: ${categoryColor};"></div>
            </div>
          </div>

          ${subGoals.length > 0 ? `
            <div class="goal-subgoals-summary">
              <span class="icon">🎯</span>
              <span>세부 목표: ${completedSubGoals}/${subGoals.length} 완료</span>
            </div>
          ` : ''}
        </div>

        <div class="goal-card-footer">
          <button class="btn-secondary btn-sm view-goal-btn" data-goal-id="${goal.id}">
            상세보기
          </button>
          <button class="btn-secondary btn-sm edit-goal-btn" data-goal-id="${goal.id}">
            ✏️ 수정
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render habits list
   */
  renderHabits() {
    const container = document.getElementById('habits-list');
    const emptyState = document.getElementById('habits-empty-state');

    if (!container) return;

    // Get active habits
    const habits = dataManager.habits.filter(h => h.isActive !== false);

    if (habits.length === 0) {
      container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    container.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    const today = DateUtils.formatDate(new Date());
    container.innerHTML = habits.map(habit => this.renderHabitCard(habit, today)).join('');

    // Attach habit card listeners
    this.attachHabitCardListeners();
  }

  /**
   * Render a single habit card
   * @param {Object} habit - Habit object
   * @param {string} today - Today's date (YYYY-MM-DD)
   * @returns {string} HTML string
   */
  renderHabitCard(habit, today) {
    const categoryColor = habit.categoryColor || '#34C759';
    const icon = habit.icon || '✨';

    // Check if completed today
    const isCompletedToday = dataManager.isHabitCompletedOnDate(habit.id, today);

    // Get streak
    const streak = dataManager.getHabitStreak(habit.id);

    // Get completion rate (last 30 days)
    const completionRate = dataManager.getHabitCompletionRate(habit.id, 30);

    return `
      <div class="habit-card ${isCompletedToday ? 'completed' : ''}" data-habit-id="${habit.id}">
        <div class="habit-card-header">
          <div class="habit-icon" style="background-color: ${categoryColor};">
            ${icon}
          </div>
          <div class="habit-info">
            <h3 class="habit-title">${ValidationUtils.escapeHtml(habit.title)}</h3>
            <div class="habit-stats">
              <span class="habit-stat">🔥 ${streak}일 연속</span>
              <span class="habit-stat">📊 ${completionRate}% (30일)</span>
            </div>
          </div>
        </div>

        <div class="habit-card-body">
          <button class="habit-check-btn ${isCompletedToday ? 'checked' : ''}"
                  data-habit-id="${habit.id}">
            <span class="check-icon">${isCompletedToday ? '✓' : '○'}</span>
            <span class="check-text">${isCompletedToday ? '완료됨' : '완료하기'}</span>
          </button>
        </div>

        <div class="habit-card-footer">
          <button class="btn-secondary btn-sm edit-habit-btn" data-habit-id="${habit.id}">
            ✏️ 수정
          </button>
          <button class="btn-secondary btn-sm delete-habit-btn" data-habit-id="${habit.id}">
            🗑️ 삭제
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Add goal button
    const addGoalBtn = document.getElementById('add-goal-btn');
    const addGoalEmptyBtn = document.getElementById('add-goal-empty-btn');

    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => this.handleAddGoal());
    }

    if (addGoalEmptyBtn) {
      addGoalEmptyBtn.addEventListener('click', () => this.handleAddGoal());
    }

    // Add habit button
    const addHabitBtn = document.getElementById('add-habit-btn');
    const addHabitEmptyBtn = document.getElementById('add-habit-empty-btn');

    if (addHabitBtn) {
      addHabitBtn.addEventListener('click', () => this.handleAddHabit());
    }

    if (addHabitEmptyBtn) {
      addHabitEmptyBtn.addEventListener('click', () => this.handleAddHabit());
    }

    // Show completed checkbox
    const showCompletedCheckbox = document.getElementById('show-completed-goals');
    if (showCompletedCheckbox) {
      showCompletedCheckbox.addEventListener('change', (e) => {
        this.showCompletedGoals = e.target.checked;
        this.renderGoals();
      });
    }

    // Goal detail modal
    this.attachGoalDetailModalListeners();
  }

  /**
   * Attach goal detail modal listeners
   */
  attachGoalDetailModalListeners() {
    const closeBtn = document.getElementById('goal-detail-close-btn');
    const cancelBtn = document.getElementById('goal-detail-cancel-btn');
    const overlay = document.getElementById('goal-detail-overlay');
    const editBtn = document.getElementById('edit-goal-btn');
    const deleteBtn = document.getElementById('delete-goal-btn');
    const addSubGoalBtn = document.getElementById('add-subgoal-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeGoalDetailModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeGoalDetailModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeGoalDetailModal());
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => this.handleEditGoalFromDetail());
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDeleteGoalFromDetail());
    }

    if (addSubGoalBtn) {
      addSubGoalBtn.addEventListener('click', () => this.handleAddSubGoal());
    }
  }

  /**
   * Attach goal card listeners
   */
  attachGoalCardListeners() {
    document.querySelectorAll('.view-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const goalId = e.currentTarget.dataset.goalId;
        this.showGoalDetail(goalId);
      });
    });

    document.querySelectorAll('.edit-goal-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const goalId = e.currentTarget.dataset.goalId;
        this.handleEditGoal(goalId);
      });
    });
  }

  /**
   * Attach habit card listeners
   */
  attachHabitCardListeners() {
    // Habit check buttons
    document.querySelectorAll('.habit-check-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const habitId = btn.dataset.habitId;
        this.handleToggleHabit(habitId);
      });
    });

    // Edit habit buttons
    document.querySelectorAll('.edit-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const habitId = e.currentTarget.dataset.habitId;
        this.handleEditHabit(habitId);
      });
    });

    // Delete habit buttons
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const habitId = e.currentTarget.dataset.habitId;
        this.handleDeleteHabit(habitId);
      });
    });
  }

  /**
   * Switch tab
   * @param {string} tab - Tab name ('goals' or 'habits')
   */
  switchTab(tab) {
    this.activeTab = tab;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });

    const activeContent = document.getElementById(`${tab}-tab`);
    if (activeContent) {
      activeContent.style.display = 'block';
    }

    // Update header actions visibility
    const addGoalBtn = document.getElementById('add-goal-btn');
    const addHabitBtn = document.getElementById('add-habit-btn');

    if (addGoalBtn) addGoalBtn.style.display = tab === 'goals' ? 'inline-flex' : 'none';
    if (addHabitBtn) addHabitBtn.style.display = tab === 'habits' ? 'inline-flex' : 'none';

    this.refreshView();
  }

  /**
   * Update habits date display
   */
  updateHabitsDate() {
    const dateEl = document.getElementById('habits-date');
    if (dateEl) {
      dateEl.textContent = DateUtils.formatDateKorean(new Date());
    }
  }

  /**
   * Show goal detail modal
   * @param {string} goalId - Goal ID
   */
  showGoalDetail(goalId) {
    const goal = dataManager.getGoalById(goalId);
    if (!goal) return;

    this.selectedGoalId = goalId;

    const modal = document.getElementById('goal-detail-modal');
    const title = document.getElementById('goal-detail-title');
    const body = document.getElementById('goal-detail-body');

    if (!modal || !title || !body) return;

    // Update title
    title.textContent = goal.title;

    // Get subgoals
    const subGoals = dataManager.getSubGoalsByGoalId(goalId);

    // Render goal details
    body.innerHTML = `
      <div class="goal-detail-content">
        ${goal.description ? `
          <div class="goal-detail-section">
            <h4>설명</h4>
            <p>${ValidationUtils.escapeHtml(goal.description)}</p>
          </div>
        ` : ''}

        <div class="goal-detail-section">
          <h4>진행률: ${goal.progress || 0}%</h4>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${goal.progress || 0}%; background-color: ${goal.categoryColor || '#007AFF'};"></div>
          </div>
        </div>

        <div class="goal-detail-section">
          <h4>세부 목표 (${subGoals.length})</h4>
          ${subGoals.length > 0 ? `
            <div class="subgoals-list">
              ${subGoals.map(sg => this.renderSubGoalItem(sg)).join('')}
            </div>
          ` : '<p class="empty-message">세부 목표가 없습니다</p>'}
        </div>
      </div>
    `;

    // Attach subgoal listeners
    this.attachSubGoalListeners();

    // Show modal
    modal.style.display = 'flex';
  }

  /**
   * Render subgoal item
   * @param {Object} subGoal - SubGoal object
   * @returns {string} HTML string
   */
  renderSubGoalItem(subGoal) {
    const scheduledInfo = subGoal.date && subGoal.startTime ?
      `<span class="subgoal-scheduled">📅 ${subGoal.date} ${subGoal.startTime}</span>` :
      '';

    return `
      <div class="subgoal-item ${subGoal.isCompleted ? 'completed' : ''}" data-subgoal-id="${subGoal.id}">
        <input type="checkbox"
               class="subgoal-checkbox"
               ${subGoal.isCompleted ? 'checked' : ''}
               data-subgoal-id="${subGoal.id}" />
        <div class="subgoal-info">
          <span class="subgoal-title">${ValidationUtils.escapeHtml(subGoal.title)}</span>
          ${subGoal.description ? `<p class="subgoal-description">${ValidationUtils.escapeHtml(subGoal.description)}</p>` : ''}
          ${scheduledInfo}
        </div>
        <div class="subgoal-actions">
          ${!subGoal.date ? `
            <button class="btn-sm schedule-subgoal-btn" data-subgoal-id="${subGoal.id}" title="일정 추가">
              📅
            </button>
          ` : ''}
          <button class="btn-sm delete-subgoal-btn" data-subgoal-id="${subGoal.id}" title="삭제">
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach subgoal listeners
   */
  attachSubGoalListeners() {
    // Checkbox toggle
    document.querySelectorAll('.subgoal-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const subGoalId = e.target.dataset.subgoalId;
        const isCompleted = e.target.checked;
        this.handleToggleSubGoal(subGoalId, isCompleted);
      });
    });

    // Schedule button
    document.querySelectorAll('.schedule-subgoal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subGoalId = btn.dataset.subgoalId;
        this.handleScheduleSubGoal(subGoalId);
      });
    });

    // Delete button
    document.querySelectorAll('.delete-subgoal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const subGoalId = btn.dataset.subgoalId;
        this.handleDeleteSubGoal(subGoalId);
      });
    });
  }

  /**
   * Close goal detail modal
   */
  closeGoalDetailModal() {
    const modal = document.getElementById('goal-detail-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.selectedGoalId = null;
  }

  /**
   * Handle add goal
   */
  handleAddGoal() {
    this.goalModal.show({
      startDate: DateUtils.formatDate(new Date()),
      progress: 0
    });
  }

  /**
   * Handle save goal
   * @param {Object} goalData - Goal data
   */
  handleSaveGoal(goalData) {
    if (goalData.id) {
      dataManager.updateGoal(goalData.id, goalData);
    } else {
      dataManager.addGoal(goalData);
    }
    this.goalModal.hide();
  }

  /**
   * Handle edit goal
   * @param {string} goalId - Goal ID
   */
  handleEditGoal(goalId) {
    const goal = dataManager.getGoalById(goalId);
    if (goal) {
      this.goalModal.show(goal);
    }
  }

  /**
   * Handle edit goal from detail modal
   */
  handleEditGoalFromDetail() {
    if (!this.selectedGoalId) return;
    this.closeGoalDetailModal();
    this.handleEditGoal(this.selectedGoalId);
  }

  /**
   * Handle delete goal from detail modal
   */
  handleDeleteGoalFromDetail() {
    if (!this.selectedGoalId) return;

    const goal = dataManager.getGoalById(this.selectedGoalId);
    if (!goal) return;

    if (confirm(`"${goal.title}" 목표를 삭제하시겠습니까?`)) {
      dataManager.deleteGoal(this.selectedGoalId);
      this.closeGoalDetailModal();
    }
  }

  /**
   * Handle add subgoal
   */
  handleAddSubGoal() {
    if (!this.selectedGoalId) return;

    const title = prompt('세부 목표 제목:');
    if (!title) return;

    const subGoal = {
      goalId: this.selectedGoalId,
      title: title.trim(),
      description: '',
      isCompleted: false,
      order: dataManager.getSubGoalsByGoalId(this.selectedGoalId).length
    };

    dataManager.addSubGoal(subGoal);
  }

  /**
   * Handle toggle subgoal
   * @param {string} subGoalId - SubGoal ID
   * @param {boolean} isCompleted - Completion status
   */
  handleToggleSubGoal(subGoalId, isCompleted) {
    dataManager.updateSubGoal(subGoalId, { isCompleted });

    // Update parent goal progress
    const subGoal = dataManager.getSubGoalById(subGoalId);
    if (subGoal) {
      this.updateGoalProgress(subGoal.goalId);
    }
  }

  /**
   * Handle schedule subgoal
   * @param {string} subGoalId - SubGoal ID
   */
  handleScheduleSubGoal(subGoalId) {
    const subGoal = dataManager.getSubGoalById(subGoalId);
    if (!subGoal) return;

    // Close goal detail modal and open task modal for scheduling
    this.closeGoalDetailModal();

    this.taskModal.show({
      title: `🎯 ${subGoal.title}`,
      description: subGoal.description,
      date: DateUtils.formatDate(new Date()),
      subGoalId: subGoalId
    });
  }

  /**
   * Handle save subgoal schedule
   * @param {Object} taskData - Task data with schedule
   */
  handleSaveSubGoalSchedule(taskData) {
    if (taskData.subGoalId) {
      // Update subgoal with schedule
      dataManager.updateSubGoal(taskData.subGoalId, {
        date: taskData.date,
        startTime: taskData.startTime,
        endTime: taskData.endTime
      });
    }
    this.taskModal.hide();
  }

  /**
   * Handle delete subgoal
   * @param {string} subGoalId - SubGoal ID
   */
  handleDeleteSubGoal(subGoalId) {
    const subGoal = dataManager.getSubGoalById(subGoalId);
    if (!subGoal) return;

    if (confirm(`"${subGoal.title}"을(를) 삭제하시겠습니까?`)) {
      dataManager.deleteSubGoal(subGoalId);

      // Update parent goal progress
      this.updateGoalProgress(subGoal.goalId);
    }
  }

  /**
   * Update goal progress based on completed subgoals
   * @param {string} goalId - Goal ID
   */
  updateGoalProgress(goalId) {
    const subGoals = dataManager.getSubGoalsByGoalId(goalId);
    if (subGoals.length === 0) return;

    const completedCount = subGoals.filter(sg => sg.isCompleted).length;
    const progress = Math.round((completedCount / subGoals.length) * 100);

    dataManager.updateGoal(goalId, { progress });
  }

  /**
   * Handle add habit
   */
  handleAddHabit() {
    this.habitModal.show({
      isActive: true
    });
  }

  /**
   * Handle save habit
   * @param {Object} habitData - Habit data
   */
  handleSaveHabit(habitData) {
    if (habitData.id) {
      dataManager.updateHabit(habitData.id, habitData);
    } else {
      dataManager.addHabit(habitData);
    }
    this.habitModal.hide();
  }

  /**
   * Handle edit habit
   * @param {string} habitId - Habit ID
   */
  handleEditHabit(habitId) {
    const habit = dataManager.getHabitById(habitId);
    if (habit) {
      this.habitModal.show(habit);
    }
  }

  /**
   * Handle delete habit
   * @param {string} habitId - Habit ID
   */
  handleDeleteHabit(habitId) {
    const habit = dataManager.getHabitById(habitId);
    if (!habit) return;

    if (confirm(`"${habit.title}" 습관을 삭제하시겠습니까?`)) {
      dataManager.deleteHabit(habitId);
    }
  }

  /**
   * Handle toggle habit (complete/uncomplete for today)
   * @param {string} habitId - Habit ID
   */
  handleToggleHabit(habitId) {
    const today = DateUtils.formatDate(new Date());
    const isCompleted = dataManager.isHabitCompletedOnDate(habitId, today);

    if (isCompleted) {
      dataManager.removeHabitLog(habitId, today);
    } else {
      dataManager.addHabitLog(habitId, today);
    }
  }

  /**
   * Destroy view - cleanup
   */
  destroy() {
    console.log('[GoalsView] Destroying...');

    // Destroy components
    if (this.goalModal) {
      this.goalModal.hide();
      this.goalModal = null;
    }

    if (this.habitModal) {
      this.habitModal.hide();
      this.habitModal = null;
    }

    if (this.taskModal) {
      this.taskModal.hide();
      this.taskModal = null;
    }

    console.log('[GoalsView] Destroyed');
  }
}
