// migration.js - Safe Data Migration Script
// Migrates from old fragmented localStorage structure to new unified structure

/**
 * DataMigration - Handles migration from old to new data structure
 */
class DataMigration {
  /**
   * Check if migration is needed
   * @returns {boolean} True if migration needed
   */
  static needsMigration() {
    // If new structure exists, no migration needed
    if (localStorage.getItem('nanal_data')) {
      return false;
    }

    // Check if any old data exists
    const oldKeys = [
      'nanal_todos',
      'nanal_events',
      'nanal_goals',
      'nanal_habits',
      'nanal_timetable',
      'weekly_events',
      'timetable_events'
    ];

    return oldKeys.some(key => localStorage.getItem(key) !== null);
  }

  /**
   * Run migration process
   * @returns {boolean} Success
   */
  static migrate() {
    console.log('🔄 Starting data migration...');

    try {
      // Step 1: Create backup
      const backup = this.createBackup();
      console.log('✅ Backup created');

      // Step 2: Load old data
      const oldData = this.loadOldData();
      console.log('✅ Old data loaded', oldData);

      // Step 3: Transform to new structure
      const newData = this.transformData(oldData);
      console.log('✅ Data transformed', newData);

      // Step 4: Validate new structure
      if (!this.validateData(newData)) {
        throw new Error('Data validation failed');
      }
      console.log('✅ Data validated');

      // Step 5: Save to new structure
      localStorage.setItem('nanal_data', JSON.stringify(newData));
      console.log('✅ New data saved');

      // Step 6: Archive old keys (don't delete yet for safety)
      this.archiveOldKeys();
      console.log('✅ Old keys archived');

      console.log('✅ Migration completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Migration failed:', error);

      // Attempt rollback
      try {
        this.rollback();
        console.log('⚠️ Rolled back to old data');
      } catch (rollbackError) {
        console.error('❌ Rollback failed:', rollbackError);
      }

      return false;
    }
  }

  /**
   * Create backup of all localStorage data
   * @returns {object} Backup data
   */
  static createBackup() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      backup[key] = localStorage.getItem(key);
    }
    localStorage.setItem('nanal_migration_backup', JSON.stringify(backup));
    return backup;
  }

  /**
   * Rollback to backup
   */
  static rollback() {
    const backupStr = localStorage.getItem('nanal_migration_backup');
    if (!backupStr) {
      throw new Error('No backup found');
    }

    const backup = JSON.parse(backupStr);

    // Clear current localStorage
    localStorage.clear();

    // Restore backup
    Object.keys(backup).forEach(key => {
      localStorage.setItem(key, backup[key]);
    });
  }

  /**
   * Load all old localStorage data
   * @returns {object} Old data structure
   */
  static loadOldData() {
    return {
      todos: this.parseJSON(localStorage.getItem('nanal_todos')),
      events: this.parseJSON(localStorage.getItem('nanal_events')),
      goals: this.parseJSON(localStorage.getItem('nanal_goals')),
      habits: this.parseJSON(localStorage.getItem('nanal_habits')),
      timetable: this.parseJSON(localStorage.getItem('nanal_timetable')),
      weeklyEvents: this.parseJSON(localStorage.getItem('weekly_events')),
      timetableEvents: this.parseJSON(localStorage.getItem('timetable_events')),
      budgets: this.parseJSON(localStorage.getItem('nanal_budgets')), // Will be discarded
      theme: localStorage.getItem('theme') || 'light'
    };
  }

  /**
   * Parse JSON safely
   * @param {string} str - JSON string
   * @returns {array} Parsed array or empty array
   */
  static parseJSON(str) {
    if (!str) return [];
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn('Failed to parse JSON:', error);
      return [];
    }
  }

  /**
   * Transform old data to new structure
   * @param {object} oldData - Old data structure
   * @returns {object} New data structure
   */
  static transformData(oldData) {
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    return {
      version: "1.0",
      lastUpdated: now,
      userId: null,
      settings: {
        theme: oldData.theme || "light",
        defaultView: "home",
        weatherLocation: "Seoul",
        backupEnabled: false,
        lastBackup: null
      },
      categories: this.getDefaultCategories(),
      tasks: [
        ...this.transformTodos(oldData.todos, today),
        ...this.transformEvents(oldData.events),
        ...this.transformEvents(oldData.weeklyEvents, 'weekly_')
      ],
      fixedSchedules: [
        ...this.transformTimetable(oldData.timetable),
        ...this.transformTimetable(oldData.timetableEvents)
      ],
      goals: this.transformGoals(oldData.goals),
      subGoals: [], // Will be populated as users create them
      habits: this.transformHabits(oldData.habits),
      habitLogs: this.transformHabitLogs(oldData.habits),
      ideas: [], // New feature, starts empty
      focusSessions: [] // Will be populated as users use timer
    };
  }

  /**
   * Transform todos to tasks (no time)
   * @param {array} todos - Old todos
   * @param {string} today - Today's date
   * @returns {array} Transformed tasks
   */
  static transformTodos(todos, today) {
    return todos.map(todo => ({
      id: todo.id || this.generateId('task_'),
      title: todo.text || todo.title || '', // KEY CHANGE: text → title
      description: '',
      categoryId: 'cat_other',
      date: today, // Todos don't have date, assume today
      startTime: null, // Todos don't have time
      endTime: null,
      isCompleted: todo.completed || false,
      isAllDay: false,
      createdAt: todo.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Transform events to tasks (with time)
   * @param {array} events - Old events
   * @param {string} prefix - ID prefix for disambiguation
   * @returns {array} Transformed tasks
   */
  static transformEvents(events, prefix = '') {
    return events.map(event => ({
      id: prefix + (event.id || this.generateId('task_')),
      title: event.title || '',
      description: event.description || '',
      categoryId: this.mapOldCategory(event.category),
      date: event.date || new Date().toISOString().split('T')[0],
      startTime: event.startTime || null,
      endTime: event.endTime || null,
      isCompleted: event.isCompleted || false,
      isAllDay: event.isAllDay || false,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Transform timetable to fixed schedules
   * @param {array} timetable - Old timetable entries
   * @returns {array} Transformed fixed schedules
   */
  static transformTimetable(timetable) {
    if (!Array.isArray(timetable)) return [];

    return timetable.map(item => ({
      id: item.id || this.generateId('fixed_'),
      title: item.title || '',
      categoryId: this.mapOldCategory(item.category),
      dayOfWeek: this.ensureArray(item.dayOfWeek),
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '10:00',
      isActive: true // All imported schedules are active by default
    }));
  }

  /**
   * Transform goals
   * @param {array} goals - Old goals
   * @returns {array} Transformed goals
   */
  static transformGoals(goals) {
    return goals.map(goal => ({
      id: goal.id || this.generateId('goal_'),
      title: goal.title || '',
      description: goal.description || '',
      startDate: goal.startDate || new Date().toISOString().split('T')[0],
      endDate: goal.endDate || new Date().toISOString().split('T')[0],
      progress: goal.progress || 0,
      categoryId: this.mapOldCategory(goal.category),
      createdAt: goal.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Transform habits
   * @param {array} habits - Old habits
   * @returns {array} Transformed habits
   */
  static transformHabits(habits) {
    return habits.map(habit => ({
      id: habit.id || this.generateId('habit_'),
      title: habit.name || habit.title || '', // KEY CHANGE: name → title
      categoryId: 'cat_personal',
      icon: habit.icon || '✅',
      isActive: habit.isActive !== undefined ? habit.isActive : true,
      createdAt: habit.createdAt || new Date().toISOString()
    }));
  }

  /**
   * Transform habit logs from inline checks array
   * @param {array} habits - Old habits with inline checks
   * @returns {array} Separate habit logs
   */
  static transformHabitLogs(habits) {
    const logs = [];

    habits.forEach(habit => {
      if (habit.checks && Array.isArray(habit.checks)) {
        // Old format: checks is array of date strings
        habit.checks.forEach(date => {
          logs.push({
            habitId: habit.id,
            date: date,
            isCompleted: true
          });
        });
      }
    });

    return logs;
  }

  /**
   * Map old category to new category ID
   * @param {string} oldCategory - Old category string
   * @returns {string} New category ID
   */
  static mapOldCategory(oldCategory) {
    if (!oldCategory) return 'cat_other';

    const mapping = {
      '강의': 'cat_study',
      'lecture': 'cat_study',
      '공부': 'cat_study',
      'study': 'cat_study',
      '업무': 'cat_work',
      'work': 'cat_work',
      '운동': 'cat_health',
      'exercise': 'cat_health',
      '건강': 'cat_health',
      'health': 'cat_health',
      '개인': 'cat_personal',
      'personal': 'cat_personal',
      'default': 'cat_other',
      '기타': 'cat_other',
      'other': 'cat_other'
    };

    return mapping[oldCategory.toLowerCase()] || 'cat_other';
  }

  /**
   * Ensure value is an array
   * @param {any} value - Value to check
   * @returns {array} Array value
   */
  static ensureArray(value) {
    if (Array.isArray(value)) return value;
    if (value !== null && value !== undefined) return [value];
    return [];
  }

  /**
   * Validate new data structure
   * @param {object} data - Data to validate
   * @returns {boolean} Valid
   */
  static validateData(data) {
    try {
      // Check required top-level fields
      if (!data.version || !data.settings) {
        console.error('Missing required fields: version or settings');
        return false;
      }

      // Check required arrays
      const requiredArrays = [
        'categories', 'tasks', 'fixedSchedules', 'goals',
        'subGoals', 'habits', 'habitLogs', 'ideas', 'focusSessions'
      ];

      for (const key of requiredArrays) {
        if (!Array.isArray(data[key])) {
          console.error(`${key} is not an array`);
          return false;
        }
      }

      // Validate categories (must have at least one)
      if (data.categories.length === 0) {
        console.error('No categories found');
        return false;
      }

      // Validate each task has required fields
      for (const task of data.tasks) {
        if (!task.id || !task.title || !task.date) {
          console.error('Invalid task found:', task);
          return false;
        }
      }

      console.log('Validation passed ✅');
      return true;

    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  /**
   * Archive old localStorage keys (rename with _old prefix)
   */
  static archiveOldKeys() {
    const oldKeys = [
      'nanal_todos',
      'nanal_events',
      'nanal_goals',
      'nanal_habits',
      'nanal_timetable',
      'nanal_budgets',
      'weekly_events',
      'timetable_events'
    ];

    oldKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        localStorage.setItem(`${key}_old`, value);
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Delete archived old keys (call after user confirms migration success)
   */
  static deleteArchivedKeys() {
    const archivedKeys = [
      'nanal_todos_old',
      'nanal_events_old',
      'nanal_goals_old',
      'nanal_habits_old',
      'nanal_timetable_old',
      'nanal_budgets_old',
      'weekly_events_old',
      'timetable_events_old',
      'nanal_migration_backup'
    ];

    archivedKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ Archived keys deleted');
  }

  /**
   * Get default categories
   * @returns {array} Default categories
   */
  static getDefaultCategories() {
    return [
      { id: "cat_study", name: "공부", color: "#007AFF", icon: "📚" },
      { id: "cat_work", name: "업무", color: "#34C759", icon: "💼" },
      { id: "cat_personal", name: "개인", color: "#FF9500", icon: "🎯" },
      { id: "cat_health", name: "건강", color: "#FF3B30", icon: "💪" },
      { id: "cat_other", name: "기타", color: "#8E8E93", icon: "📌" }
    ];
  }

  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  static generateId(prefix = '') {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get migration status
   * @returns {object} Status information
   */
  static getStatus() {
    const hasNewData = localStorage.getItem('nanal_data') !== null;
    const hasOldData = localStorage.getItem('nanal_todos') !== null ||
                       localStorage.getItem('nanal_events') !== null;
    const hasBackup = localStorage.getItem('nanal_migration_backup') !== null;
    const hasArchived = localStorage.getItem('nanal_todos_old') !== null;

    return {
      hasNewData,
      hasOldData,
      hasBackup,
      hasArchived,
      needsMigration: this.needsMigration(),
      status: hasNewData ? 'migrated' : (hasOldData ? 'needs-migration' : 'clean')
    };
  }
}

export default DataMigration;
