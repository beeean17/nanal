// state.js - Central Data Manager with Observer Pattern
// Single source of truth for all application data

import DataMigration from './migration.js';

/**
 * DataManager - Central state management with Observer pattern
 * Provides reactive updates to UI components when data changes
 */
class DataManager {
  constructor() {
    this.data = {
      version: "1.0",
      lastUpdated: null,
      userId: null,
      settings: {
        theme: "light",
        defaultView: "home",
        weatherLocation: "Seoul",
        backupEnabled: false,
        lastBackup: null
      },
      categories: [],
      tasks: [],
      fixedSchedules: [],
      goals: [],
      subGoals: [],
      habits: [],
      habitLogs: [],
      ideas: [],
      focusSessions: []
    };

    // Observer pattern: collection -> array of callbacks
    this.observers = {};

    // Indexes for fast queries
    this.indexes = {
      tasksByDate: new Map(),
      subGoalsByGoalId: new Map(),
      habitLogsByDate: new Map()
    };

    // Flag to prevent migration loops
    this.isInitialized = false;
  }

  // ============================================================
  // GETTERS - Provide direct access to data collections
  // ============================================================

  get tasks() {
    return this.data.tasks;
  }

  get fixedSchedules() {
    return this.data.fixedSchedules;
  }

  get goals() {
    return this.data.goals;
  }

  get subGoals() {
    return this.data.subGoals;
  }

  get habits() {
    return this.data.habits;
  }

  get habitLogs() {
    return this.data.habitLogs;
  }

  get ideas() {
    return this.data.ideas;
  }

  get focusSessions() {
    return this.data.focusSessions;
  }

  get categories() {
    return this.data.categories;
  }

  get settings() {
    return this.data.settings;
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize DataManager - loads data and runs migration if needed
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if migration is needed
      if (DataMigration.needsMigration()) {
        console.log('🔄 Migration needed, running migration...');
        const migrated = DataMigration.migrate();

        if (!migrated) {
          throw new Error('Migration failed - check console for details');
        }

        console.log('✅ Migration completed successfully');
      }

      // Load data (from new structure)
      const loaded = this.loadFromLocalStorage();

      if (!loaded) {
        // First time - initialize with defaults
        this.data.categories = this.getDefaultCategories();
        this.data.settings = this.getDefaultSettings();
        this.saveToLocalStorage();
        console.log('✨ Initialized with default data');
      } else {
        console.log('✅ Data loaded from localStorage');
      }

      this.rebuildIndexes();
      this.isInitialized = true;

      console.log('✅ DataManager initialized', this.data);
    } catch (error) {
      console.error('❌ Failed to initialize DataManager:', error);
      throw error;
    }
  }

  /**
   * Subscribe to data changes for a collection
   * @param {string} collection - Collection name (tasks, goals, etc.)
   * @param {function} callback - Function to call when data changes
   * @returns {function} Unsubscribe function
   */
  subscribe(collection, callback) {
    if (!this.observers[collection]) {
      this.observers[collection] = [];
    }
    this.observers[collection].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.observers[collection].indexOf(callback);
      if (index > -1) {
        this.observers[collection].splice(index, 1);
      }
    };
  }

  /**
   * Unsubscribe from data changes
   * @param {string} collection - Collection name
   * @param {function} callback - Callback to remove
   */
  unsubscribe(collection, callback) {
    if (!this.observers[collection]) return;
    const index = this.observers[collection].indexOf(callback);
    if (index > -1) {
      this.observers[collection].splice(index, 1);
    }
  }

  /**
   * Notify all observers of a collection that data changed
   * @param {string} collection - Collection name
   * @param {object} changeInfo - {type: 'add'|'update'|'delete', data: ...}
   */
  notify(collection, changeInfo = {}) {
    if (!this.observers[collection]) return;

    this.observers[collection].forEach(callback => {
      try {
        callback(changeInfo);
      } catch (error) {
        console.error(`Error in observer callback for ${collection}:`, error);
      }
    });
  }

  /**
   * Update state and trigger saves/notifications
   * @param {object} updates - Partial data updates
   */
  setState(updates) {
    Object.assign(this.data, updates);
    this.data.lastUpdated = new Date().toISOString();

    this.saveToLocalStorage();
    this.rebuildIndexes();

    // Notify observers for each changed collection
    Object.keys(updates).forEach(key => {
      if (Array.isArray(updates[key]) || typeof updates[key] === 'object') {
        this.notify(key, { type: 'update', data: updates[key] });
      }
    });
  }

  // ============================================================
  // TASK CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new task
   * @param {object} task - Task object
   * @returns {object} Created task
   */
  addTask(task) {
    try {
      const newTask = {
        id: this.generateId('task_'),
        title: task.title || '',
        description: task.description || '',
        categoryId: task.categoryId || 'cat_other',
        date: task.date || new Date().toISOString().split('T')[0],
        startTime: task.startTime || null,
        endTime: task.endTime || null,
        isCompleted: task.isCompleted || false,
        isAllDay: task.isAllDay || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.tasks.push(newTask);
      this.updateTaskIndex(newTask);
      this.saveToLocalStorage();
      this.notify('tasks', { type: 'add', data: newTask });

      return newTask;
    } catch (error) {
      console.error('Failed to add task:', error);
      return null;
    }
  }

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {object} updates - Partial task updates
   * @returns {object} Updated task or null
   */
  updateTask(id, updates) {
    try {
      const index = this.data.tasks.findIndex(t => t.id === id);
      if (index === -1) return null;

      this.data.tasks[index] = {
        ...this.data.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.updateTaskIndex(this.data.tasks[index]);
      this.saveToLocalStorage();
      this.notify('tasks', { type: 'update', data: this.data.tasks[index] });

      return this.data.tasks[index];
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }

  /**
   * Delete a task
   * @param {string} id - Task ID
   * @returns {boolean} Success
   */
  deleteTask(id) {
    try {
      const index = this.data.tasks.findIndex(t => t.id === id);
      if (index === -1) return false;

      const deleted = this.data.tasks.splice(index, 1)[0];
      this.removeFromTaskIndex(deleted);
      this.saveToLocalStorage();
      this.notify('tasks', { type: 'delete', data: { id } });

      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      return false;
    }
  }

  /**
   * Get task by ID
   * @param {string} id - Task ID
   * @returns {object|null} Task or null
   */
  getTaskById(id) {
    return this.data.tasks.find(t => t.id === id) || null;
  }

  /**
   * Get all tasks for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {array} Array of tasks
   */
  getTasksForDate(date) {
    return this.indexes.tasksByDate.get(date) || [];
  }

  /**
   * Get all tasks that have time specified
   * @returns {array} Array of tasks with startTime
   */
  getTasksWithTime() {
    return this.data.tasks.filter(t => t.startTime !== null);
  }

  // ============================================================
  // FIXED SCHEDULE CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new fixed schedule
   * @param {object} schedule - Fixed schedule object
   * @returns {object} Created schedule
   */
  addFixedSchedule(schedule) {
    try {
      const newSchedule = {
        id: this.generateId('fixed_'),
        title: schedule.title || '',
        categoryId: schedule.categoryId || 'cat_other',
        dayOfWeek: Array.isArray(schedule.dayOfWeek) ? schedule.dayOfWeek : [schedule.dayOfWeek],
        startTime: schedule.startTime || '09:00',
        endTime: schedule.endTime || '10:00',
        isActive: schedule.isActive !== undefined ? schedule.isActive : true
      };

      this.data.fixedSchedules.push(newSchedule);
      this.saveToLocalStorage();
      this.notify('fixedSchedules', { type: 'add', data: newSchedule });

      return newSchedule;
    } catch (error) {
      console.error('Failed to add fixed schedule:', error);
      return null;
    }
  }

  /**
   * Update a fixed schedule
   * @param {string} id - Schedule ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated schedule
   */
  updateFixedSchedule(id, updates) {
    try {
      const index = this.data.fixedSchedules.findIndex(s => s.id === id);
      if (index === -1) return null;

      this.data.fixedSchedules[index] = {
        ...this.data.fixedSchedules[index],
        ...updates
      };

      this.saveToLocalStorage();
      this.notify('fixedSchedules', { type: 'update', data: this.data.fixedSchedules[index] });

      return this.data.fixedSchedules[index];
    } catch (error) {
      console.error('Failed to update fixed schedule:', error);
      return null;
    }
  }

  /**
   * Delete a fixed schedule
   * @param {string} id - Schedule ID
   * @returns {boolean} Success
   */
  deleteFixedSchedule(id) {
    try {
      const index = this.data.fixedSchedules.findIndex(s => s.id === id);
      if (index === -1) return false;

      this.data.fixedSchedules.splice(index, 1);
      this.saveToLocalStorage();
      this.notify('fixedSchedules', { type: 'delete', data: { id } });

      return true;
    } catch (error) {
      console.error('Failed to delete fixed schedule:', error);
      return false;
    }
  }

  /**
   * Get fixed schedules for a specific day of week
   * @param {number} dayOfWeek - 0 (Sun) to 6 (Sat)
   * @returns {array} Array of active fixed schedules
   */
  getFixedSchedulesForDay(dayOfWeek) {
    return this.data.fixedSchedules.filter(s =>
      s.isActive && s.dayOfWeek.includes(dayOfWeek)
    );
  }

  /**
   * Get fixed schedules for a date
   * @param {string|Date} date - Date object or string
   * @returns {array} Array of fixed schedules
   */
  getFixedSchedulesForDate(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getDay();
    return this.getFixedSchedulesForDay(dayOfWeek);
  }

  /**
   * Get fixed schedule by ID
   * @param {string} id - Schedule ID
   * @returns {object|null} Fixed schedule or null
   */
  getFixedScheduleById(id) {
    return this.data.fixedSchedules.find(s => s.id === id) || null;
  }

  // ============================================================
  // GOAL CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new goal
   * @param {object} goal - Goal object
   * @returns {object} Created goal
   */
  addGoal(goal) {
    try {
      const newGoal = {
        id: this.generateId('goal_'),
        title: goal.title || '',
        description: goal.description || '',
        startDate: goal.startDate || new Date().toISOString().split('T')[0],
        endDate: goal.endDate || new Date().toISOString().split('T')[0],
        progress: goal.progress || 0,
        categoryId: goal.categoryId || 'cat_other',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.goals.push(newGoal);
      this.saveToLocalStorage();
      this.notify('goals', { type: 'add', data: newGoal });

      return newGoal;
    } catch (error) {
      console.error('Failed to add goal:', error);
      return null;
    }
  }

  /**
   * Update a goal
   * @param {string} id - Goal ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated goal
   */
  updateGoal(id, updates) {
    try {
      const index = this.data.goals.findIndex(g => g.id === id);
      if (index === -1) return null;

      this.data.goals[index] = {
        ...this.data.goals[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveToLocalStorage();
      this.notify('goals', { type: 'update', data: this.data.goals[index] });

      return this.data.goals[index];
    } catch (error) {
      console.error('Failed to update goal:', error);
      return null;
    }
  }

  /**
   * Delete a goal and its subgoals
   * @param {string} id - Goal ID
   * @returns {boolean} Success
   */
  deleteGoal(id) {
    try {
      const index = this.data.goals.findIndex(g => g.id === id);
      if (index === -1) return false;

      // Delete associated subgoals
      this.data.subGoals = this.data.subGoals.filter(sg => sg.goalId !== id);

      this.data.goals.splice(index, 1);
      this.saveToLocalStorage();
      this.rebuildIndexes();
      this.notify('goals', { type: 'delete', data: { id } });
      this.notify('subGoals', { type: 'update', data: this.data.subGoals });

      return true;
    } catch (error) {
      console.error('Failed to delete goal:', error);
      return false;
    }
  }

  /**
   * Get goal by ID
   * @param {string} id - Goal ID
   * @returns {object|null} Goal or null
   */
  getGoalById(id) {
    return this.data.goals.find(g => g.id === id) || null;
  }

  // ============================================================
  // SUBGOAL CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new subgoal
   * @param {object} subGoal - SubGoal object
   * @returns {object} Created subgoal
   */
  addSubGoal(subGoal) {
    try {
      const newSubGoal = {
        id: this.generateId('subgoal_'),
        goalId: subGoal.goalId,
        title: subGoal.title || '',
        description: subGoal.description || '',
        dueDate: subGoal.dueDate || null,
        date: subGoal.date || null,
        startTime: subGoal.startTime || null,
        endTime: subGoal.endTime || null,
        isCompleted: subGoal.isCompleted || false,
        order: subGoal.order || 0
      };

      this.data.subGoals.push(newSubGoal);
      this.updateSubGoalIndex(newSubGoal);
      this.saveToLocalStorage();
      this.notify('subGoals', { type: 'add', data: newSubGoal });

      // Update parent goal progress
      this.updateGoalProgress(subGoal.goalId);

      return newSubGoal;
    } catch (error) {
      console.error('Failed to add subgoal:', error);
      return null;
    }
  }

  /**
   * Update a subgoal
   * @param {string} id - SubGoal ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated subgoal
   */
  updateSubGoal(id, updates) {
    try {
      const index = this.data.subGoals.findIndex(sg => sg.id === id);
      if (index === -1) return null;

      const oldGoalId = this.data.subGoals[index].goalId;

      this.data.subGoals[index] = {
        ...this.data.subGoals[index],
        ...updates
      };

      this.updateSubGoalIndex(this.data.subGoals[index]);
      this.saveToLocalStorage();
      this.notify('subGoals', { type: 'update', data: this.data.subGoals[index] });

      // Update parent goal progress
      this.updateGoalProgress(oldGoalId);
      if (updates.goalId && updates.goalId !== oldGoalId) {
        this.updateGoalProgress(updates.goalId);
      }

      return this.data.subGoals[index];
    } catch (error) {
      console.error('Failed to update subgoal:', error);
      return null;
    }
  }

  /**
   * Delete a subgoal
   * @param {string} id - SubGoal ID
   * @returns {boolean} Success
   */
  deleteSubGoal(id) {
    try {
      const index = this.data.subGoals.findIndex(sg => sg.id === id);
      if (index === -1) return false;

      const goalId = this.data.subGoals[index].goalId;
      this.data.subGoals.splice(index, 1);
      this.rebuildIndexes();
      this.saveToLocalStorage();
      this.notify('subGoals', { type: 'delete', data: { id } });

      // Update parent goal progress
      this.updateGoalProgress(goalId);

      return true;
    } catch (error) {
      console.error('Failed to delete subgoal:', error);
      return false;
    }
  }

  /**
   * Get subgoals for a specific goal
   * @param {string} goalId - Goal ID
   * @returns {array} Array of subgoals
   */
  getSubGoalsByGoalId(goalId) {
    return this.indexes.subGoalsByGoalId.get(goalId) || [];
  }

  /**
   * Get subgoals for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {array} Array of subgoals
   */
  getSubGoalsForDate(date) {
    return this.data.subGoals.filter(sg => sg.date === date);
  }

  /**
   * Update goal progress based on completed subgoals
   * @param {string} goalId - Goal ID
   */
  updateGoalProgress(goalId) {
    const subGoals = this.getSubGoalsByGoalId(goalId);
    if (subGoals.length === 0) return;

    const completed = subGoals.filter(sg => sg.isCompleted).length;
    const progress = Math.round((completed / subGoals.length) * 100);

    this.updateGoal(goalId, { progress });
  }

  // ============================================================
  // HABIT CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new habit
   * @param {object} habit - Habit object
   * @returns {object} Created habit
   */
  addHabit(habit) {
    try {
      const newHabit = {
        id: this.generateId('habit_'),
        title: habit.title || '',
        categoryId: habit.categoryId || 'cat_other',
        icon: habit.icon || '✅',
        isActive: habit.isActive !== undefined ? habit.isActive : true,
        createdAt: new Date().toISOString()
      };

      this.data.habits.push(newHabit);
      this.saveToLocalStorage();
      this.notify('habits', { type: 'add', data: newHabit });

      return newHabit;
    } catch (error) {
      console.error('Failed to add habit:', error);
      return null;
    }
  }

  /**
   * Update a habit
   * @param {string} id - Habit ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated habit
   */
  updateHabit(id, updates) {
    try {
      const index = this.data.habits.findIndex(h => h.id === id);
      if (index === -1) return null;

      this.data.habits[index] = {
        ...this.data.habits[index],
        ...updates
      };

      this.saveToLocalStorage();
      this.notify('habits', { type: 'update', data: this.data.habits[index] });

      return this.data.habits[index];
    } catch (error) {
      console.error('Failed to update habit:', error);
      return null;
    }
  }

  /**
   * Delete a habit and its logs
   * @param {string} id - Habit ID
   * @returns {boolean} Success
   */
  deleteHabit(id) {
    try {
      const index = this.data.habits.findIndex(h => h.id === id);
      if (index === -1) return false;

      // Delete associated logs
      this.data.habitLogs = this.data.habitLogs.filter(log => log.habitId !== id);

      this.data.habits.splice(index, 1);
      this.saveToLocalStorage();
      this.notify('habits', { type: 'delete', data: { id } });
      this.notify('habitLogs', { type: 'update', data: this.data.habitLogs });

      return true;
    } catch (error) {
      console.error('Failed to delete habit:', error);
      return false;
    }
  }

  /**
   * Get active habits
   * @returns {array} Array of active habits
   */
  getActiveHabits() {
    return this.data.habits.filter(h => h.isActive);
  }

  /**
   * Toggle habit completion for a date
   * @param {string} habitId - Habit ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {object} Habit log
   */
  toggleHabitLog(habitId, date) {
    const existingIndex = this.data.habitLogs.findIndex(
      log => log.habitId === habitId && log.date === date
    );

    if (existingIndex !== -1) {
      // Toggle existing log
      this.data.habitLogs[existingIndex].isCompleted = !this.data.habitLogs[existingIndex].isCompleted;
      this.saveToLocalStorage();
      this.notify('habitLogs', { type: 'update', data: this.data.habitLogs[existingIndex] });
      return this.data.habitLogs[existingIndex];
    } else {
      // Create new log
      const newLog = {
        habitId,
        date,
        isCompleted: true
      };
      this.data.habitLogs.push(newLog);
      this.saveToLocalStorage();
      this.notify('habitLogs', { type: 'add', data: newLog });
      return newLog;
    }
  }

  /**
   * Get habit logs for a date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {array} Array of habit logs
   */
  getHabitLogsForDate(date) {
    return this.data.habitLogs.filter(log => log.date === date);
  }

  /**
   * Check if a habit is completed on a specific date
   * @param {string} habitId - Habit ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {boolean} True if completed
   */
  isHabitCompletedOnDate(habitId, date) {
    const log = this.data.habitLogs.find(
      log => log.habitId === habitId && log.date === date
    );
    return log ? log.isCompleted : false;
  }

  /**
   * Get habit streak (consecutive days completed)
   * @param {string} habitId - Habit ID
   * @returns {number} Streak count
   */
  getHabitStreak(habitId) {
    const logs = this.data.habitLogs
      .filter(log => log.habitId === habitId && log.isCompleted)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const found = logs.find(log => log.date === dateStr);

      if (found) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get habit completion rate for last N days
   * @param {string} habitId - Habit ID
   * @param {number} days - Number of days to check
   * @returns {number} Percentage (0-100)
   */
  getHabitCompletionRate(habitId, days = 30) {
    const today = new Date();
    let completed = 0;

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (this.isHabitCompletedOnDate(habitId, dateStr)) {
        completed++;
      }
    }

    return Math.round((completed / days) * 100);
  }

  // ============================================================
  // IDEA CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new idea
   * @param {object} idea - Idea object
   * @returns {object} Created idea
   */
  addIdea(idea) {
    try {
      const newIdea = {
        id: this.generateId('idea_'),
        title: idea.title || '',
        content: idea.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.data.ideas.push(newIdea);
      this.saveToLocalStorage();
      this.notify('ideas', { type: 'add', data: newIdea });

      return newIdea;
    } catch (error) {
      console.error('Failed to add idea:', error);
      return null;
    }
  }

  /**
   * Update an idea
   * @param {string} id - Idea ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated idea
   */
  updateIdea(id, updates) {
    try {
      const index = this.data.ideas.findIndex(i => i.id === id);
      if (index === -1) return null;

      this.data.ideas[index] = {
        ...this.data.ideas[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.saveToLocalStorage();
      this.notify('ideas', { type: 'update', data: this.data.ideas[index] });

      return this.data.ideas[index];
    } catch (error) {
      console.error('Failed to update idea:', error);
      return null;
    }
  }

  /**
   * Delete an idea
   * @param {string} id - Idea ID
   * @returns {boolean} Success
   */
  deleteIdea(id) {
    try {
      const index = this.data.ideas.findIndex(i => i.id === id);
      if (index === -1) return false;

      this.data.ideas.splice(index, 1);
      this.saveToLocalStorage();
      this.notify('ideas', { type: 'delete', data: { id } });

      return true;
    } catch (error) {
      console.error('Failed to delete idea:', error);
      return false;
    }
  }

  // ============================================================
  // FOCUS SESSION CRUD OPERATIONS
  // ============================================================

  /**
   * Add a focus session
   * @param {object} session - Focus session object
   * @returns {object} Created session
   */
  addFocusSession(session) {
    try {
      const newSession = {
        id: this.generateId('focus_'),
        taskId: session.taskId || null,
        duration: session.duration || 25,
        startedAt: session.startedAt || new Date().toISOString(),
        completedAt: session.completedAt || null
      };

      this.data.focusSessions.push(newSession);
      this.saveToLocalStorage();
      this.notify('focusSessions', { type: 'add', data: newSession });

      return newSession;
    } catch (error) {
      console.error('Failed to add focus session:', error);
      return null;
    }
  }

  // ============================================================
  // CATEGORY CRUD OPERATIONS
  // ============================================================

  /**
   * Add a new category
   * @param {object} category - Category object
   * @returns {object} Created category
   */
  addCategory(category) {
    try {
      const newCategory = {
        id: this.generateId('cat_'),
        name: category.name || 'New Category',
        color: category.color || '#8E8E93',
        icon: category.icon || '📌'
      };

      this.data.categories.push(newCategory);
      this.saveToLocalStorage();
      this.notify('categories', { type: 'add', data: newCategory });

      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      return null;
    }
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {object} updates - Partial updates
   * @returns {object|null} Updated category
   */
  updateCategory(id, updates) {
    try {
      const index = this.data.categories.findIndex(c => c.id === id);
      if (index === -1) return null;

      this.data.categories[index] = {
        ...this.data.categories[index],
        ...updates
      };

      this.saveToLocalStorage();
      this.notify('categories', { type: 'update', data: this.data.categories[index] });

      return this.data.categories[index];
    } catch (error) {
      console.error('Failed to update category:', error);
      return null;
    }
  }

  /**
   * Delete a category (reassigns items to default)
   * @param {string} id - Category ID
   * @returns {boolean} Success
   */
  deleteCategory(id) {
    try {
      const index = this.data.categories.findIndex(c => c.id === id);
      if (index === -1) return false;

      // Don't allow deleting default category
      if (id === 'cat_other') {
        console.warn('Cannot delete default category');
        return false;
      }

      // Reassign all items to default category
      this.data.tasks.forEach(t => {
        if (t.categoryId === id) t.categoryId = 'cat_other';
      });
      this.data.goals.forEach(g => {
        if (g.categoryId === id) g.categoryId = 'cat_other';
      });
      this.data.habits.forEach(h => {
        if (h.categoryId === id) h.categoryId = 'cat_other';
      });
      this.data.fixedSchedules.forEach(s => {
        if (s.categoryId === id) s.categoryId = 'cat_other';
      });

      this.data.categories.splice(index, 1);
      this.saveToLocalStorage();
      this.notify('categories', { type: 'delete', data: { id } });

      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    }
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {object|null} Category or null
   */
  getCategoryById(id) {
    return this.data.categories.find(c => c.id === id) || null;
  }

  // ============================================================
  // SETTINGS OPERATIONS
  // ============================================================

  /**
   * Update settings
   * @param {object} updates - Partial settings updates
   */
  updateSettings(updates) {
    this.data.settings = {
      ...this.data.settings,
      ...updates
    };
    this.saveToLocalStorage();
    this.notify('settings', { type: 'update', data: this.data.settings });
  }

  // ============================================================
  // STORAGE OPERATIONS
  // ============================================================

  /**
   * Save data to localStorage
   */
  saveToLocalStorage() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      localStorage.setItem('nanal_data', JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Load data from localStorage
   * @returns {boolean} True if data was loaded, false if not found
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('nanal_data');
      if (!stored) {
        return false;
      }

      const parsed = JSON.parse(stored);

      // Merge with default structure to ensure all arrays exist
      this.data = {
        version: parsed.version || "1.0",
        lastUpdated: parsed.lastUpdated || null,
        userId: parsed.userId || null,
        settings: {
          ...this.data.settings,
          ...(parsed.settings || {})
        },
        categories: parsed.categories || [],
        tasks: parsed.tasks || [],
        fixedSchedules: parsed.fixedSchedules || [],
        goals: parsed.goals || [],
        subGoals: parsed.subGoals || [],
        habits: parsed.habits || [],
        habitLogs: parsed.habitLogs || [],
        ideas: parsed.ideas || [],
        focusSessions: parsed.focusSessions || []
      };

      return true;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  /**
   * Export all data as JSON
   * @returns {object} Complete data object
   */
  exportData() {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Import data from JSON
   * @param {object} jsonData - Data to import
   * @returns {boolean} Success
   */
  importData(jsonData) {
    try {
      // Validate basic structure
      if (!jsonData.version || !jsonData.settings) {
        throw new Error('Invalid data format');
      }

      this.data = jsonData;
      this.rebuildIndexes();
      this.saveToLocalStorage();

      // Notify all collections
      Object.keys(jsonData).forEach(key => {
        if (Array.isArray(jsonData[key])) {
          this.notify(key, { type: 'update', data: jsonData[key] });
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // ============================================================
  // INDEXING OPERATIONS
  // ============================================================

  /**
   * Rebuild all indexes for fast queries
   */
  rebuildIndexes() {
    // Rebuild tasksByDate index
    this.indexes.tasksByDate.clear();
    this.data.tasks.forEach(task => {
      this.updateTaskIndex(task);
    });

    // Rebuild subGoalsByGoalId index
    this.indexes.subGoalsByGoalId.clear();
    this.data.subGoals.forEach(subGoal => {
      this.updateSubGoalIndex(subGoal);
    });
  }

  /**
   * Update task in date index
   * @param {object} task - Task object
   */
  updateTaskIndex(task) {
    if (!this.indexes.tasksByDate.has(task.date)) {
      this.indexes.tasksByDate.set(task.date, []);
    }

    const tasks = this.indexes.tasksByDate.get(task.date);
    const existingIndex = tasks.findIndex(t => t.id === task.id);

    if (existingIndex !== -1) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
  }

  /**
   * Remove task from date index
   * @param {object} task - Task object
   */
  removeFromTaskIndex(task) {
    if (!this.indexes.tasksByDate.has(task.date)) return;

    const tasks = this.indexes.tasksByDate.get(task.date);
    const index = tasks.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks.splice(index, 1);
    }
  }

  /**
   * Update subgoal in goalId index
   * @param {object} subGoal - SubGoal object
   */
  updateSubGoalIndex(subGoal) {
    if (!this.indexes.subGoalsByGoalId.has(subGoal.goalId)) {
      this.indexes.subGoalsByGoalId.set(subGoal.goalId, []);
    }

    const subGoals = this.indexes.subGoalsByGoalId.get(subGoal.goalId);
    const existingIndex = subGoals.findIndex(sg => sg.id === subGoal.id);

    if (existingIndex !== -1) {
      subGoals[existingIndex] = subGoal;
    } else {
      subGoals.push(subGoal);
    }
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default categories
   * @returns {array} Default categories
   */
  getDefaultCategories() {
    return [
      { id: "cat_study", name: "공부", color: "#007AFF", icon: "📚" },
      { id: "cat_work", name: "업무", color: "#34C759", icon: "💼" },
      { id: "cat_personal", name: "개인", color: "#FF9500", icon: "🎯" },
      { id: "cat_health", name: "건강", color: "#FF3B30", icon: "💪" },
      { id: "cat_other", name: "기타", color: "#8E8E93", icon: "📌" }
    ];
  }

  /**
   * Get default settings
   * @returns {object} Default settings
   */
  getDefaultSettings() {
    return {
      theme: "light",
      defaultView: "home",
      weatherLocation: "Seoul",
      backupEnabled: false,
      lastBackup: null
    };
  }
}

// Create and export singleton instance
const dataManager = new DataManager();

export { dataManager };
export default dataManager;
