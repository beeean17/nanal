// components/index.js - Master export file for all components

// Base
export { Component } from './base/Component.js';
export { Modal } from './base/Modal.js';

// Layout
export { Navigation } from './layout/Navigation.js';

// Data Display
export { Timeline } from './data-display/Timeline.js';
export { TodoList } from './data-display/TodoList.js';
export { IdeaCard } from './data-display/IdeaCard.js';

// Modals
export { TaskModal } from './modals/TaskModal.js';
export { GoalModal } from './modals/GoalModal.js';
export { HabitModal } from './modals/HabitModal.js';
export { IdeaModal } from './modals/IdeaModal.js';
export { FixedScheduleModal } from './modals/FixedScheduleModal.js';

// Widgets
export { WeatherWidget } from './widgets/WeatherWidget.js';
export { DateTimeDisplay } from './widgets/DateTimeDisplay.js';
export { FocusTimer } from './widgets/FocusTimer.js';

// Calendar
export { CalendarGrid } from './calendar/CalendarGrid.js';

// Progress
export { GoalProgressBar } from './progress/GoalProgressBar.js';

// Habits
export { HabitHeatmap } from './habits/HabitHeatmap.js';

// Input
export { SearchBar } from './input/SearchBar.js';
export { Checkbox } from './input/Checkbox.js';
export { Switch } from './input/Switch.js';
export { Dropdown } from './input/Dropdown.js';
export { CategorySelector } from './input/CategorySelector.js';
export { DatePicker } from './input/DatePicker.js';
export { TimePicker } from './input/TimePicker.js';
export { ColorPicker } from './input/ColorPicker.js';

// Feedback
export { Toast, ToastManager, toast } from './feedback/Toast.js';
export { LoadingSpinner, LoadingManager, loading } from './feedback/LoadingSpinner.js';
export { ProgressBar, CircularProgress } from './feedback/ProgressBar.js';
export { EmptyState, EmptyStatePresets } from './feedback/EmptyState.js';
export { ConfirmDialog, ConfirmDialogManager, confirm } from './feedback/ConfirmDialog.js';

// Common
export { CategoryBadge } from './common/CategoryBadge.js';
export { StatisticsCard } from './common/StatisticsCard.js';
export { Button } from './common/Button.js';
