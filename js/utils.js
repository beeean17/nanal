// utils.js - Utility Functions
// Reusable utility functions for date/time calculations, validation, and more

// ============================================================
// DATE UTILITIES
// ============================================================

/**
 * DateUtils - Date manipulation and formatting
 */
export const DateUtils = {
  /**
   * Format date to YYYY-MM-DD
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} YYYY-MM-DD formatted date
   */
  formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Format date to Korean locale string (YYYY년 MM월 DD일)
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Korean formatted date
   */
  formatDateKorean(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}년 ${month}월 ${day}일`;
  },

  /**
   * Check if two dates are the same day
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {boolean} True if same day
   */
  isSameDay(date1, date2) {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  /**
   * Get day of week (0=Sun, 6=Sat)
   * @param {Date|string} date - Date object or ISO string
   * @returns {number} Day of week (0-6)
   */
  getDayOfWeek(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getDay();
  },

  /**
   * Get month name in Korean
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Korean month name (e.g., "1월", "12월")
   */
  getMonthNameKorean(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const month = d.getMonth() + 1; // 0-11 to 1-12
    return `${month}월`;
  },

  /**
   * Get day name in Korean
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Korean day name
   */
  getDayNameKorean(date) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = this.getDayOfWeek(date);
    return days[dayOfWeek];
  },

  /**
   * Get day name in English (short)
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} English day name
   */
  getDayNameEnglish(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = this.getDayOfWeek(date);
    return days[dayOfWeek];
  },

  /**
   * Calculate days between two dates
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {number} Number of days
   */
  daysBetween(startDate, endDate) {
    const d1 = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const d2 = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  /**
   * Add days to a date
   * @param {Date|string} date - Starting date
   * @param {number} days - Number of days to add
   * @returns {Date} New date
   */
  addDays(date, days) {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  /**
   * Get date range array
   * @param {Date|string} startDate - Start date
   * @param {number} count - Number of days
   * @returns {array} Array of date strings
   */
  getDateRange(startDate, count) {
    const dates = [];
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;

    for (let i = 0; i < count; i++) {
      const date = this.addDays(start, i);
      dates.push(this.formatDate(date));
    }

    return dates;
  },

  /**
   * Check if date is today
   * @param {Date|string} date - Date to check
   * @returns {boolean} True if today
   */
  isToday(date) {
    return this.isSameDay(date, new Date());
  },

  /**
   * Get today's date string
   * @returns {string} YYYY-MM-DD
   */
  getToday() {
    return this.formatDate(new Date());
  },

  /**
   * Get week start date (Monday)
   * @param {Date|string} date - Any date in the week
   * @returns {Date} Monday of that week
   */
  getWeekStart(date) {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust if Sunday
    return this.addDays(d, diff);
  }
};

// ============================================================
// TIME UTILITIES
// ============================================================

/**
 * TimeUtils - Time calculations for timeline positioning
 * CRITICAL: Used for 08:00-07:59 timeline calculations
 */
export const TimeUtils = {
  /**
   * Convert "HH:mm" to minutes from midnight
   * @param {string} timeString - Time in "HH:mm" format
   * @returns {number} Minutes from midnight (0-1439)
   * @example
   * timeToMinutes("00:00") // => 0
   * timeToMinutes("12:30") // => 750
   * timeToMinutes("23:59") // => 1439
   */
  timeToMinutes(timeString) {
    if (!timeString || typeof timeString !== 'string') return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  },

  /**
   * Convert minutes to "HH:mm" format
   * @param {number} minutes - Minutes from midnight
   * @returns {string} Time in "HH:mm" format
   * @example
   * minutesToTime(0) // => "00:00"
   * minutesToTime(750) // => "12:30"
   * minutesToTime(1439) // => "23:59"
   */
  minutesToTime(minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes)) return '00:00';
    const totalMinutes = Math.max(0, Math.min(1439, minutes)); // Clamp to valid range
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  },

  /**
   * Convert time to minutes from 08:00 (for timeline positioning)
   * Timeline: 08:00 (start) → 07:59 (end) = 24 hours
   * @param {string} timeString - Time in "HH:mm" format
   * @returns {number} Minutes from 08:00 (0-1439)
   * @example
   * timeToMinutesFrom8AM("08:00") // => 0 (timeline start)
   * timeToMinutesFrom8AM("12:00") // => 240 (4 hours after 08:00)
   * timeToMinutesFrom8AM("02:00") // => 1080 (next day, wraps around)
   */
  timeToMinutesFrom8AM(timeString) {
    const totalMinutes = this.timeToMinutes(timeString);
    let fromEight = totalMinutes - 480; // 8:00 = 480 minutes
    if (fromEight < 0) fromEight += 1440; // Wrap to next day
    return fromEight;
  },

  /**
   * Convert minutes from 08:00 back to clock time
   * @param {number} minutesFrom8 - Minutes from 08:00
   * @returns {string} Time in "HH:mm" format
   * @example
   * minutesFrom8AMToTime(0) // => "08:00"
   * minutesFrom8AMToTime(240) // => "12:00"
   * minutesFrom8AMToTime(1080) // => "02:00" (next day)
   */
  minutesFrom8AMToTime(minutesFrom8) {
    const actualMinutes = (minutesFrom8 + 480) % 1440;
    return this.minutesToTime(actualMinutes);
  },

  /**
   * Calculate timeline position (top, height) for an event
   * Used for absolute positioning on 08:00-07:59 timeline
   * @param {string} startTime - Start time "HH:mm"
   * @param {string} endTime - End time "HH:mm"
   * @returns {object} {top: %, height: %}
   * @example
   * calculateTimelinePosition("09:00", "10:00")
   * // => { top: 4.17%, height: 4.17% } (1 hour = 4.17% of 24h)
   */
  calculateTimelinePosition(startTime, endTime) {
    const startMin = this.timeToMinutesFrom8AM(startTime);
    const endMin = this.timeToMinutesFrom8AM(endTime);

    // Calculate duration (handle wraparound for late-night events)
    let duration;
    if (endMin >= startMin) {
      duration = endMin - startMin;
    } else {
      // Event spans midnight (e.g., 23:00 to 02:00)
      duration = (1440 - startMin) + endMin;
    }

    return {
      top: (startMin / 1440) * 100,
      height: (duration / 1440) * 100
    };
  },

  /**
   * Get time from Y position on timeline (inverse of calculateTimelinePosition)
   * Used for drag-to-create feature
   * @param {number} yPixels - Y position in pixels
   * @param {number} containerHeight - Container height in pixels
   * @returns {string} Time in "HH:mm" format
   * @example
   * getTimeFromY(0, 1440) // => "08:00" (top of timeline)
   * getTimeFromY(720, 1440) // => "20:00" (middle of timeline)
   */
  getTimeFromY(yPixels, containerHeight) {
    if (containerHeight === 0) return '08:00';
    const percent = Math.max(0, Math.min(1, yPixels / containerHeight));
    const minutesFrom8 = Math.round(percent * 1440);
    return this.minutesFrom8AMToTime(minutesFrom8);
  },

  /**
   * Snap time to interval (e.g., 5 minutes)
   * Used for cleaner timeline events
   * @param {string} timeString - Time in "HH:mm" format
   * @param {number} intervalMinutes - Interval to snap to (default 5)
   * @returns {string} Snapped time in "HH:mm" format
   * @example
   * snapToInterval("09:17", 5) // => "09:15"
   * snapToInterval("09:18", 5) // => "09:20"
   * snapToInterval("09:13", 15) // => "09:15"
   */
  snapToInterval(timeString, intervalMinutes = 5) {
    const minutes = this.timeToMinutes(timeString);
    const snapped = Math.round(minutes / intervalMinutes) * intervalMinutes;
    return this.minutesToTime(snapped);
  },

  /**
   * Validate time range (end > start)
   * @param {string} startTime - Start time "HH:mm"
   * @param {string} endTime - End time "HH:mm"
   * @returns {boolean} True if valid
   */
  isValidTimeRange(startTime, endTime) {
    if (!startTime || !endTime) return false;
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return end > start;
  },

  /**
   * Calculate duration between two times (in minutes)
   * @param {string} startTime - Start time "HH:mm"
   * @param {string} endTime - End time "HH:mm"
   * @returns {number} Duration in minutes
   */
  calculateDuration(startTime, endTime) {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    if (end >= start) {
      return end - start;
    } else {
      // Spans midnight
      return (1440 - start) + end;
    }
  },

  /**
   * Format duration as human-readable string
   * @param {number} minutes - Duration in minutes
   * @returns {string} Formatted duration (e.g., "1h 30m")
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}분`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  },

  /**
   * Get current time as "HH:mm"
   * @returns {string} Current time
   */
  getCurrentTime() {
    const now = new Date();
    return this.minutesToTime(now.getHours() * 60 + now.getMinutes());
  }
};

// ============================================================
// VALIDATION UTILITIES
// ============================================================

/**
 * ValidationUtils - Data validation and sanitization
 */
export const ValidationUtils = {
  /**
   * Validate task object
   * @param {object} task - Task to validate
   * @returns {boolean} True if valid
   */
  validateTask(task) {
    if (!task) return false;
    if (!task.id || typeof task.id !== 'string') return false;
    if (!task.title || typeof task.title !== 'string') return false;
    if (!task.date || typeof task.date !== 'string') return false;

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(task.date)) return false;

    // If time is provided, validate format
    if (task.startTime && !/^\d{2}:\d{2}$/.test(task.startTime)) return false;
    if (task.endTime && !/^\d{2}:\d{2}$/.test(task.endTime)) return false;

    // If both times provided, validate range
    if (task.startTime && task.endTime) {
      if (!TimeUtils.isValidTimeRange(task.startTime, task.endTime)) return false;
    }

    return true;
  },

  /**
   * Validate time format (HH:mm)
   * @param {string} timeString - Time string
   * @returns {boolean} True if valid
   */
  validateTimeFormat(timeString) {
    if (!timeString || typeof timeString !== 'string') return false;
    return /^\d{2}:\d{2}$/.test(timeString);
  },

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateString - Date string
   * @returns {boolean} True if valid
   */
  validateDateFormat(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  },

  /**
   * Sanitize HTML (prevent XSS)
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Validate hex color format
   * @param {string} color - Color hex code
   * @returns {boolean} True if valid
   */
  validateHexColor(color) {
    if (!color || typeof color !== 'string') return false;
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  }
};

// ============================================================
// ID GENERATION
// ============================================================

/**
 * IDUtils - ID generation
 */
export const IDUtils = {
  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix (e.g., 'task_', 'goal_')
   * @returns {string} Unique ID
   * @example
   * generateId('task_') // => "task_1234567890_abc123def"
   */
  generateId(prefix = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}_${random}`;
  }
};

// ============================================================
// DEBOUNCE UTILITY
// ============================================================

/**
 * Debounce function - delays execution until after wait period
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 * @example
 * const debouncedSearch = debounce(search, 300);
 * input.addEventListener('input', debouncedSearch);
 */
export function debounce(func, wait) {
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

// ============================================================
// THROTTLE UTILITY
// ============================================================

/**
 * Throttle function - limits execution rate
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} Throttled function
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 * window.addEventListener('scroll', throttledScroll);
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================
// STORAGE UTILITIES
// ============================================================

/**
 * StorageUtils - LocalStorage wrappers with error handling
 */
export const StorageUtils = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} Parsed value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Success
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set ${key} in localStorage:`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
      return false;
    }
  },

  /**
   * Clear all localStorage
   * @returns {boolean} Success
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};

// ============================================================
// EXPORT ALL
// ============================================================

export default {
  DateUtils,
  TimeUtils,
  ValidationUtils,
  IDUtils,
  debounce,
  throttle,
  StorageUtils
};
