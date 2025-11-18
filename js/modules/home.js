// home.js - 홈 화면 모듈
// 오늘에 집중할 수 있도록 중요한 정보들을 모아 보여주는 대시보드

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const HomeScreen = {
  todos: [],
  editingId: null,
  events: [], // Timeline events
  currentTimeInterval: null, // For updating current time
  weatherData: null, // Weather data

  // Focus Timer state (formerly Pomodoro)
  pomodoroTimer: null,
  pomodoroTimeLeft: 15 * 60, // 15 minutes in seconds (default)
  pomodoroIsRunning: false,
  pomodoroMode: 'work', // 'work' or 'break'
  pomodoroSessions: 0,
  pomodoroWorkDuration: 15 * 60, // 15 minutes (default)
  pomodoroBreakDuration: 5 * 60, // 5 minutes (default)

  // 화면 렌더링
  render() {
    return `
      <div class="home-screen fade-in">
        <div class="home-header">
          <h1 class="screen-title">홈</h1>
          <p class="screen-subtitle">오늘 하루를 시작해보세요</p>
        </div>

        <!-- 날씨 위젯 -->
        <section class="weather-widget" id="weather-widget">
          <div class="weather-loading" id="weather-loading">
            <div class="loading"></div>
            <p>날씨 정보를 불러오는 중...</p>
          </div>
        </section>

        <!-- To-Do List -->
        <section class="todo-section">
          <div class="section-header">
            <h2>오늘의 할 일</h2>
            <button class="add-btn" id="add-todo-btn" aria-label="할 일 추가">+</button>
          </div>

          <!-- To-Do 입력 영역 -->
          <div class="todo-input-container" style="display: none;">
            <input
              type="text"
              id="todo-input"
              class="todo-input"
              placeholder="할 일을 입력하세요..."
              maxlength="100"
            />
            <div class="todo-input-actions">
              <button class="btn-primary" id="save-todo-btn">저장</button>
              <button class="btn-secondary" id="cancel-todo-btn">취소</button>
            </div>
          </div>

          <!-- To-Do 목록 -->
          <div class="todo-list" id="todo-list">
            <!-- To-Do 아이템들이 여기에 동적으로 추가됩니다 -->
          </div>
        </section>

        <!-- 타임라인 -->
        <section class="timeline-section">
          <div class="section-header">
            <h2>오늘의 타임라인</h2>
            <button class="add-btn" id="add-event-btn" aria-label="일정 추가">+</button>
          </div>

          <!-- 현재 시간 표시 -->
          <div class="current-time-display">
            <span class="time-icon">🕐</span>
            <span id="current-time">--:--</span>
          </div>

          <!-- 일정 입력 영역 -->
          <div class="event-input-container" style="display: none;">
            <input
              type="text"
              id="event-title"
              class="event-input"
              placeholder="일정 제목"
              maxlength="50"
            />
            <div class="event-time-inputs">
              <input type="time" id="event-start-time" class="time-input" />
              <span>~</span>
              <input type="time" id="event-end-time" class="time-input" />
            </div>
            <select id="event-category" class="event-select">
              <option value="study">📚 공부</option>
              <option value="work">💼 업무</option>
              <option value="personal">🎯 개인</option>
              <option value="meeting">👥 미팅</option>
              <option value="other">📌 기타</option>
            </select>
            <div class="event-input-actions">
              <button class="btn-primary" id="save-event-btn">저장</button>
              <button class="btn-secondary" id="cancel-event-btn">취소</button>
            </div>
          </div>

          <!-- 시각적 타임라인 (0-24시) -->
          <div class="timeline-visual" id="timeline-visual">
            <div class="timeline-hours" id="timeline-hours">
              <!-- 시간 라벨들이 여기에 생성됩니다 -->
            </div>
            <div class="timeline-events-track" id="timeline-events-track">
              <!-- Red Line (현재 시간 인디케이터) -->
              <div class="timeline-current-line" id="timeline-current-line">
                <div class="timeline-current-dot"></div>
                <div class="timeline-current-label"></div>
              </div>
              <!-- 이벤트 블록들이 여기에 절대 위치로 배치됩니다 -->
            </div>
          </div>
        </section>

        <!-- 집중 타이머 -->
        <section class="pomodoro-section">
          <div class="section-header">
            <h2>집중 타이머</h2>
          </div>

          <div class="pomodoro-container">
            <!-- 시간 설정 -->
            <div class="timer-settings">
              <div class="timer-setting-group">
                <label class="setting-label">작업 시간</label>
                <div class="timer-presets">
                  <button class="preset-btn active" data-work="15">15분</button>
                  <button class="preset-btn" data-work="25">25분</button>
                  <button class="preset-btn" data-work="45">45분</button>
                  <button class="preset-btn" data-work="60">60분</button>
                </div>
                <div class="custom-time-input">
                  <label class="custom-label">또는 직접 입력:</label>
                  <div class="input-wrapper">
                    <input
                      type="number"
                      id="custom-work-time"
                      class="custom-input"
                      placeholder="15"
                      min="1"
                      max="999"
                    />
                    <span class="input-unit">분</span>
                    <button class="apply-btn" id="apply-work-time">적용</button>
                  </div>
                </div>
              </div>
              <div class="timer-setting-group">
                <label class="setting-label">휴식 시간</label>
                <div class="timer-presets">
                  <button class="preset-btn active" data-break="5">5분</button>
                  <button class="preset-btn" data-break="10">10분</button>
                  <button class="preset-btn" data-break="15">15분</button>
                </div>
              </div>
            </div>

            <!-- 타이머 디스플레이 -->
            <div class="pomodoro-display">
              <div class="pomodoro-progress-ring">
                <svg class="progress-ring" width="200" height="200">
                  <circle
                    class="progress-ring-circle"
                    stroke="var(--color-border)"
                    stroke-width="8"
                    fill="transparent"
                    r="90"
                    cx="100"
                    cy="100"
                  />
                  <circle
                    class="progress-ring-circle progress-ring-fill"
                    stroke="var(--color-primary)"
                    stroke-width="8"
                    fill="transparent"
                    r="90"
                    cx="100"
                    cy="100"
                    id="pomodoro-progress-circle"
                  />
                </svg>
                <div class="pomodoro-timer-content">
                  <div class="pomodoro-mode" id="pomodoro-mode">작업 시간</div>
                  <div class="pomodoro-time" id="pomodoro-time">15:00</div>
                </div>
              </div>
            </div>

            <!-- 타이머 컨트롤 -->
            <div class="pomodoro-controls">
              <button class="pomodoro-btn pomodoro-btn-start" id="pomodoro-start-btn">
                <span class="btn-icon">▶️</span>
                <span class="btn-text">시작</span>
              </button>
              <button class="pomodoro-btn pomodoro-btn-pause" id="pomodoro-pause-btn" style="display: none;">
                <span class="btn-icon">⏸️</span>
                <span class="btn-text">일시정지</span>
              </button>
              <button class="pomodoro-btn pomodoro-btn-reset" id="pomodoro-reset-btn">
                <span class="btn-icon">🔄</span>
                <span class="btn-text">리셋</span>
              </button>
            </div>

            <!-- 세션 정보 -->
            <div class="pomodoro-stats">
              <div class="pomodoro-stat-item">
                <span class="stat-label">완료한 세션</span>
                <span class="stat-value" id="pomodoro-sessions">0</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 이벤트 상세 모달 -->
        <div class="modal" id="event-detail-modal" style="display: none;">
          <div class="modal-overlay" id="modal-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="modal-event-title">일정 상세</h3>
              <button class="modal-close-btn" id="modal-close-btn" aria-label="닫기">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-event-time">
                <span class="icon">🕐</span>
                <span id="modal-event-time-text">--:-- ~ --:--</span>
              </div>
              <div class="modal-event-category">
                <span class="icon">📁</span>
                <span id="modal-event-category-text">카테고리</span>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-danger" id="modal-delete-btn">삭제</button>
              <button class="btn-secondary" id="modal-cancel-btn">닫기</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // To-Do 아이템 렌더링
  renderTodoItem(todo) {
    return `
      <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.completed ? 'checked' : ''}
          aria-label="완료 체크"
        />
        <span class="todo-text">${this.escapeHtml(todo.text)}</span>
        <div class="todo-actions">
          <button class="todo-edit-btn" aria-label="수정">✏️</button>
          <button class="todo-delete-btn" aria-label="삭제">🗑️</button>
        </div>
      </div>
    `;
  },

  // HTML 이스케이프 (XSS 방지)
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // To-Do 목록 렌더링
  renderTodoList() {
    const todoList = document.getElementById('todo-list');
    if (!todoList) return;

    if (this.todos.length === 0) {
      todoList.innerHTML = `
        <div class="todo-empty">
          <span class="icon">✓</span>
          <p>할 일을 추가해보세요!</p>
        </div>
      `;
      return;
    }

    todoList.innerHTML = this.todos.map(todo => this.renderTodoItem(todo)).join('');
    this.attachTodoItemListeners();
  },

  // To-Do 아이템 이벤트 리스너
  attachTodoItemListeners() {
    // 체크박스 클릭
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const todoItem = e.target.closest('.todo-item');
        const id = todoItem.dataset.id;
        this.toggleTodo(id);
      });
    });

    // 수정 버튼 클릭
    document.querySelectorAll('.todo-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        const id = todoItem.dataset.id;
        this.editTodo(id);
      });
    });

    // 삭제 버튼 클릭
    document.querySelectorAll('.todo-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const todoItem = e.target.closest('.todo-item');
        const id = todoItem.dataset.id;
        this.deleteTodo(id);
      });
    });

    // To-Do 텍스트 더블클릭으로 수정
    document.querySelectorAll('.todo-text').forEach(text => {
      text.addEventListener('dblclick', (e) => {
        const todoItem = e.target.closest('.todo-item');
        const id = todoItem.dataset.id;
        this.editTodo(id);
      });
    });
  },

  // To-Do 추가
  async addTodo(text) {
    if (!text.trim()) return;

    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(newTodo);
    await this.saveTodos();
    this.renderTodoList();
  },

  // To-Do 토글 (완료/미완료)
  async toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      await this.saveTodos();
      this.renderTodoList();
    }
  },

  // To-Do 수정
  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    this.editingId = id;
    const inputContainer = document.querySelector('.todo-input-container');
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo-btn');

    inputContainer.style.display = 'block';
    input.value = todo.text;
    input.focus();
    addBtn.textContent = '✏️';
  },

  // To-Do 업데이트
  async updateTodo(id, text) {
    if (!text.trim()) return;

    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.text = text.trim();
      await this.saveTodos();
      this.renderTodoList();
    }
  },

  // To-Do 삭제
  async deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.todos = this.todos.filter(t => t.id !== id);
    await this.saveTodos();
    this.renderTodoList();
  },

  // LocalStorage에 저장
  saveTodosToLocal() {
    try {
      localStorage.setItem('nanal_todos', JSON.stringify(this.todos));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  // LocalStorage에서 불러오기
  loadTodosFromLocal() {
    try {
      const data = localStorage.getItem('nanal_todos');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase에 저장
  async saveTodosToFirebase() {
    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      // 기존 데이터 가져오기 (events, budgets 보존)
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        todos: this.todos,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  // Firebase에서 불러오기
  async loadTodosFromFirebase() {
    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.todos || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // To-Do 저장 (LocalStorage + Firebase)
  async saveTodos() {
    this.saveTodosToLocal();
    await this.saveTodosToFirebase();
  },

  // To-Do 불러오기 (Firebase 우선, 없으면 LocalStorage)
  async loadTodos() {
    const user = FirebaseAuth.getCurrentUser();

    if (user) {
      // 로그인 상태: Firebase에서 불러오기
      const firebaseTodos = await this.loadTodosFromFirebase();
      if (firebaseTodos.length > 0) {
        this.todos = firebaseTodos;
        this.saveTodosToLocal(); // LocalStorage에도 백업
        return;
      }
    }

    // 비로그인 또는 Firebase 데이터 없음: LocalStorage에서 불러오기
    this.todos = this.loadTodosFromLocal();
  },

  // 입력창 표시/숨김
  toggleInputContainer(show) {
    const inputContainer = document.querySelector('.todo-input-container');
    const input = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-todo-btn');

    if (show) {
      inputContainer.style.display = 'block';
      input.value = '';
      input.focus();
      addBtn.textContent = '−';
    } else {
      inputContainer.style.display = 'none';
      input.value = '';
      addBtn.textContent = '+';
      this.editingId = null;
    }
  },

  // ============ Timeline Methods ============

  // 카테고리별 색상
  getCategoryColor(category) {
    const colors = {
      // Timeline 카테고리
      study: '#007AFF',
      work: '#34C759',
      personal: '#FF9500',
      meeting: '#FF3B30',
      other: '#8E8E93',
      // Timetable 카테고리
      lecture: '#007AFF',
      lab: '#AF52DE',
      exercise: '#FF3B30'
    };
    return colors[category] || colors.other;
  },

  // 현재 시간 업데이트
  updateCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
      timeElement.textContent = `${hours}:${minutes}`;
    }
  },

  // 이벤트가 진행 중인지 확인
  isEventOngoing(event) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return event.date === today &&
           event.startTime <= currentTime &&
           event.endTime >= currentTime;
  },

  // 오늘 이벤트만 필터링
  // 오늘 요일의 시간표 수업 가져오기
  getTodayTimetableClasses() {
    try {
      const timetableData = localStorage.getItem('nanal_timetable');
      if (!timetableData) return [];

      const allClasses = JSON.parse(timetableData);
      const today = new Date();
      const todayDayOfWeek = today.getDay(); // 0 (일) ~ 6 (토)

      // 오늘 요일의 수업들을 타임라인 이벤트 형식으로 변환
      return allClasses
        .filter(c => c.dayOfWeek === todayDayOfWeek)
        .map(c => ({
          id: `timetable-${c.id}`, // timetable- 접두사로 구분
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
          category: c.category,
          location: c.location,
          date: today.toISOString().split('T')[0],
          isFromTimetable: true // 시간표에서 온 이벤트 표시
        }));
    } catch (error) {
      console.error('Timetable load error:', error);
      return [];
    }
  },

  getTodayEvents() {
    const today = new Date().toISOString().split('T')[0];

    // 일회성 이벤트
    const regularEvents = this.events
      .filter(e => e.date === today)
      .map(e => ({ ...e, isFromTimetable: false }));

    // 시간표 수업
    const timetableEvents = this.getTodayTimetableClasses();

    // 병합 후 시간순 정렬
    return [...regularEvents, ...timetableEvents]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  // 시간을 분 단위로 변환 (00:00 = 0, 23:59 = 1439)
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // 이벤트 위치 계산 (0-24시 타임라인에서의 top, height)
  calculateEventPosition(event) {
    const startMinutes = this.timeToMinutes(event.startTime);
    const endMinutes = this.timeToMinutes(event.endTime);
    const totalMinutesInDay = 24 * 60; // 1440분

    const topPercent = (startMinutes / totalMinutesInDay) * 100;
    const heightPercent = ((endMinutes - startMinutes) / totalMinutesInDay) * 100;

    return {
      top: topPercent,
      height: heightPercent
    };
  },

  // 시각적 이벤트 블록 렌더링
  renderVisualEventBlock(event) {
    const isOngoing = this.isEventOngoing(event);
    const color = this.getCategoryColor(event.category);
    const position = this.calculateEventPosition(event);
    const isTimetable = event.isFromTimetable ? 'from-timetable' : '';

    // 시간표 이벤트는 반복 아이콘 추가
    const timetableIcon = event.isFromTimetable ? '<span style="font-size: 10px; opacity: 0.8;">🔁</span> ' : '';

    return `
      <div
        class="timeline-event-block ${isOngoing ? 'ongoing' : ''} ${isTimetable}"
        data-id="${event.id}"
        style="top: ${position.top}%; height: ${position.height}%; background-color: ${color};"
      >
        <div class="event-block-time">${timetableIcon}${event.startTime}</div>
        <div class="event-block-title">${this.escapeHtml(event.title)}</div>
      </div>
    `;
  },

  // 카테고리 레이블
  getCategoryLabel(category) {
    const labels = {
      // Timeline 카테고리
      study: '📚 공부',
      work: '💼 업무',
      personal: '🎯 개인',
      meeting: '👥 미팅',
      other: '📌 기타',
      // Timetable 카테고리
      lecture: '📚 강의',
      lab: '🔬 실습',
      exercise: '🏃 운동'
    };
    return labels[category] || labels.other;
  },

  // 시간 라벨 렌더링 (0-24시)
  renderTimelineHours() {
    const hoursContainer = document.getElementById('timeline-hours');
    if (!hoursContainer) return;

    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hourLabel = String(i).padStart(2, '0') + ':00';
      hours.push(`<div class="timeline-hour-label">${hourLabel}</div>`);
    }

    hoursContainer.innerHTML = hours.join('');
  },

  // Red Line (현재 시간 인디케이터) 위치 업데이트
  updateCurrentTimeLine() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const totalMinutesInDay = 24 * 60;
    const topPercent = (currentMinutes / totalMinutesInDay) * 100;

    const currentLine = document.getElementById('timeline-current-line');
    if (currentLine) {
      currentLine.style.top = `${topPercent}%`;

      const label = currentLine.querySelector('.timeline-current-label');
      if (label) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        label.textContent = `${hours}:${minutes}`;
      }
    }
  },

  // 시각적 타임라인 렌더링
  renderTimeline() {
    // 시간 라벨 렌더링
    this.renderTimelineHours();

    // Red Line 업데이트
    this.updateCurrentTimeLine();

    // 이벤트 렌더링
    const eventsTrack = document.getElementById('timeline-events-track');
    if (!eventsTrack) return;

    const todayEvents = this.getTodayEvents();

    // Red Line 제외하고 기존 이벤트 블록들 제거
    const eventBlocks = eventsTrack.querySelectorAll('.timeline-event-block');
    eventBlocks.forEach(block => block.remove());

    if (todayEvents.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'timeline-empty-visual';
      empty.innerHTML = `
        <span class="icon">📅</span>
        <p>오늘 일정이 없습니다</p>
      `;
      eventsTrack.appendChild(empty);
      return;
    }

    // 빈 상태 메시지 제거
    const emptyMsg = eventsTrack.querySelector('.timeline-empty-visual');
    if (emptyMsg) emptyMsg.remove();

    // 이벤트 블록 추가
    todayEvents.forEach(event => {
      const blockHTML = this.renderVisualEventBlock(event);
      eventsTrack.insertAdjacentHTML('beforeend', blockHTML);
    });

    this.attachTimelineListeners();
  },

  // 타임라인 이벤트 리스너
  attachTimelineListeners() {
    document.querySelectorAll('.timeline-event-block').forEach(block => {
      block.addEventListener('click', (e) => {
        const id = block.dataset.id;
        this.showEventModal(id);
      });
    });
  },

  // 이벤트 추가
  async addEvent(title, startTime, endTime, category) {
    if (!title.trim() || !startTime || !endTime) return;

    const today = new Date().toISOString().split('T')[0];
    const newEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      startTime,
      endTime,
      category,
      date: today,
      createdAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    await this.saveEvents();
    this.renderTimeline();
  },

  // 이벤트 삭제
  async deleteEvent(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    this.events = this.events.filter(e => e.id !== id);
    await this.saveEvents();
    this.renderTimeline();
  },

  // LocalStorage에 저장
  saveEventsToLocal() {
    try {
      localStorage.setItem('nanal_events', JSON.stringify(this.events));
    } catch (error) {
      console.error('LocalStorage save error:', error);
    }
  },

  // LocalStorage에서 불러오기
  loadEventsFromLocal() {
    try {
      const data = localStorage.getItem('nanal_events');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },

  // Firebase에 저장
  async saveEventsToFirebase() {
    const user = FirebaseAuth.getCurrentUser();
    if (!user) return;

    try {
      // 기존 데이터 가져오기 (todos, budgets 보존)
      const existingData = await FirebaseDB.get('users', user.uid);

      await FirebaseDB.set('users', user.uid, {
        ...existingData,
        events: this.events,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase save error:', error);
    }
  },

  // Firebase에서 불러오기
  async loadEventsFromFirebase() {
    const user = FirebaseAuth.getCurrentUser();
    if (!user) return [];

    try {
      const data = await FirebaseDB.get('users', user.uid);
      return data?.events || [];
    } catch (error) {
      console.error('Firebase load error:', error);
      return [];
    }
  },

  // 이벤트 저장 (LocalStorage + Firebase)
  async saveEvents() {
    this.saveEventsToLocal();
    await this.saveEventsToFirebase();
  },

  // 이벤트 불러오기
  async loadEvents() {
    console.log('[Home] loadEvents() 시작');
    const user = FirebaseAuth.getCurrentUser();

    if (user) {
      console.log('[Home] 로그인 상태 - Firebase 시도:', user.email);
      const firebaseEvents = await this.loadEventsFromFirebase();
      console.log('[Home] Firebase에서 로드:', firebaseEvents);

      if (firebaseEvents.length > 0) {
        this.events = firebaseEvents;
        console.log('[Home] Firebase 데이터 사용 (LocalStorage 백업 제거)');
        // this.saveEventsToLocal(); // ← 제거: Calendar 데이터를 덮어쓰는 원인!
        return;
      }
    }

    this.events = this.loadEventsFromLocal();
    console.log('[Home] LocalStorage 데이터 사용:', this.events);
  },

  // 이벤트 입력창 표시/숨김
  toggleEventInput(show) {
    const inputContainer = document.querySelector('.event-input-container');
    const addBtn = document.getElementById('add-event-btn');

    if (show) {
      inputContainer.style.display = 'block';
      document.getElementById('event-title').focus();
      addBtn.textContent = '−';
    } else {
      inputContainer.style.display = 'none';
      document.getElementById('event-title').value = '';
      document.getElementById('event-start-time').value = '';
      document.getElementById('event-end-time').value = '';
      document.getElementById('event-category').value = 'study';
      addBtn.textContent = '+';
    }
  },

  // 이벤트 상세 모달 표시
  showEventModal(eventId) {
    // 시간표 이벤트 포함하여 검색
    const allEvents = this.getTodayEvents();
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('event-detail-modal');
    const modalTitle = document.getElementById('modal-event-title');
    const modalTime = document.getElementById('modal-event-time-text');
    const modalCategory = document.getElementById('modal-event-category-text');

    // 기본 정보 표시
    modalTitle.textContent = event.title;
    modalTime.textContent = `${event.startTime} ~ ${event.endTime}`;

    // 카테고리 표시 (시간표 이벤트는 한글 레이블 추가)
    let categoryText = this.getCategoryLabel(event.category);
    if (event.location) {
      categoryText += ` • ${event.location}`;
    }
    if (event.isFromTimetable) {
      categoryText += ' 📌 고정 시간표';
    }
    modalCategory.textContent = categoryText;

    modal.style.display = 'flex';

    // 삭제 버튼 처리
    const deleteBtn = document.getElementById('modal-delete-btn');
    if (event.isFromTimetable) {
      // 시간표 이벤트는 삭제 불가
      deleteBtn.style.display = 'none';
    } else {
      // 일회성 이벤트는 삭제 가능
      deleteBtn.style.display = 'block';
      deleteBtn.dataset.eventId = eventId;
    }
  },

  // 이벤트 상세 모달 닫기
  closeEventModal() {
    const modal = document.getElementById('event-detail-modal');
    modal.style.display = 'none';
  },

  // 초기화 및 이벤트 리스너 설정
  async init() {
    console.log('Home screen initialized');

    // To-Do 불러오기
    await this.loadTodos();
    this.renderTodoList();

    // To-Do 추가 버튼 클릭
    const addBtn = document.getElementById('add-todo-btn');
    addBtn?.addEventListener('click', () => {
      const inputContainer = document.querySelector('.todo-input-container');
      const isVisible = inputContainer.style.display === 'block';
      this.toggleInputContainer(!isVisible);
    });

    // To-Do 저장 버튼 클릭
    const saveBtn = document.getElementById('save-todo-btn');
    saveBtn?.addEventListener('click', async () => {
      const input = document.getElementById('todo-input');
      const text = input.value.trim();

      if (text) {
        if (this.editingId) {
          await this.updateTodo(this.editingId, text);
        } else {
          await this.addTodo(text);
        }
        this.toggleInputContainer(false);
      }
    });

    // To-Do 취소 버튼 클릭
    const cancelBtn = document.getElementById('cancel-todo-btn');
    cancelBtn?.addEventListener('click', () => {
      this.toggleInputContainer(false);
    });

    // To-Do Enter 키로 저장
    const input = document.getElementById('todo-input');
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveBtn?.click();
      }
    });

    // To-Do Escape 키로 취소
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleInputContainer(false);
      }
    });

    // ===== Timeline 초기화 =====

    // Timeline 불러오기
    await this.loadEvents();
    this.renderTimeline();

    // 현재 시간 업데이트 (1분마다)
    this.updateCurrentTime();
    this.updateCurrentTimeLine(); // Red Line 초기 위치
    this.currentTimeInterval = setInterval(() => {
      this.updateCurrentTime();
      this.updateCurrentTimeLine(); // Red Line 위치 업데이트
      this.renderTimeline(); // 진행 중인 이벤트 업데이트
    }, 60000); // 1분

    // Timeline 추가 버튼 클릭
    const addEventBtn = document.getElementById('add-event-btn');
    addEventBtn?.addEventListener('click', () => {
      const inputContainer = document.querySelector('.event-input-container');
      const isVisible = inputContainer.style.display === 'block';
      this.toggleEventInput(!isVisible);
    });

    // Timeline 저장 버튼 클릭
    const saveEventBtn = document.getElementById('save-event-btn');
    saveEventBtn?.addEventListener('click', async () => {
      const title = document.getElementById('event-title').value.trim();
      const startTime = document.getElementById('event-start-time').value;
      const endTime = document.getElementById('event-end-time').value;
      const category = document.getElementById('event-category').value;

      if (title && startTime && endTime) {
        if (startTime >= endTime) {
          alert('종료 시간은 시작 시간보다 늦어야 합니다.');
          return;
        }
        await this.addEvent(title, startTime, endTime, category);
        this.toggleEventInput(false);
      } else {
        alert('모든 필드를 입력해주세요.');
      }
    });

    // Timeline 취소 버튼 클릭
    const cancelEventBtn = document.getElementById('cancel-event-btn');
    cancelEventBtn?.addEventListener('click', () => {
      this.toggleEventInput(false);
    });

    // ===== Modal 이벤트 =====

    // 모달 닫기 버튼
    const modalCloseBtn = document.getElementById('modal-close-btn');
    modalCloseBtn?.addEventListener('click', () => {
      this.closeEventModal();
    });

    // 모달 취소 버튼
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    modalCancelBtn?.addEventListener('click', () => {
      this.closeEventModal();
    });

    // 모달 오버레이 클릭 시 닫기
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay?.addEventListener('click', () => {
      this.closeEventModal();
    });

    // 모달 삭제 버튼
    const modalDeleteBtn = document.getElementById('modal-delete-btn');
    modalDeleteBtn?.addEventListener('click', async () => {
      const eventId = modalDeleteBtn.dataset.eventId;
      if (eventId) {
        this.closeEventModal();
        await this.deleteEvent(eventId);
      }
    });

    // ===== Weather Widget 초기화 =====
    this.initWeather();

    // ===== Pomodoro Timer 초기화 =====
    this.initPomodoro();
  },

  // ============ Weather Widget Methods ============

  // 날씨 위젯 초기화
  async initWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    try {
      // 위치 정보 가져오기
      const position = await this.getUserLocation();

      // 날씨 데이터 가져오기
      const weather = await this.fetchWeatherData(position.coords.latitude, position.coords.longitude);

      // 날씨 표시
      this.weatherData = weather;
      this.renderWeather();
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.renderWeatherError(error.message);
    }
  },

  // 사용자 위치 가져오기
  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('브라우저가 위치 정보를 지원하지 않습니다.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('위치 권한이 거부되었습니다.'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('위치 정보를 사용할 수 없습니다.'));
              break;
            case error.TIMEOUT:
              reject(new Error('위치 요청 시간이 초과되었습니다.'));
              break;
            default:
              reject(new Error('위치를 가져올 수 없습니다.'));
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5분 캐시
        }
      );
    });
  },

  // Open-Meteo API로 날씨 데이터 가져오기 (완전 무료, API 키 불필요)
  async fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('날씨 정보를 가져오는데 실패했습니다.');
    }

    const data = await response.json();

    // Open-Meteo 응답을 표준 형식으로 변환
    return {
      main: {
        temp: data.current.temperature_2m,
        feels_like: data.current.temperature_2m, // Open-Meteo는 체감온도 제공 안함
        humidity: data.current.relative_humidity_2m
      },
      weather: [{
        code: data.current.weather_code,
        description: this.getWeatherDescriptionFromCode(data.current.weather_code)
      }],
      wind: {
        speed: data.current.wind_speed_10m
      },
      name: data.timezone || '현재 위치' // Open-Meteo는 도시명 제공 안함
    };
  },

  // WMO Weather Code에서 날씨 설명 가져오기
  getWeatherDescriptionFromCode(code) {
    const descriptions = {
      0: '맑음',
      1: '대체로 맑음',
      2: '부분 흐림',
      3: '흐림',
      45: '안개',
      48: '안개',
      51: '가벼운 이슬비',
      53: '이슬비',
      55: '강한 이슬비',
      56: '가벼운 어는 이슬비',
      57: '강한 어는 이슬비',
      61: '약한 비',
      63: '비',
      65: '강한 비',
      66: '가벼운 어는 비',
      67: '강한 어는 비',
      71: '약한 눈',
      73: '눈',
      75: '강한 눈',
      77: '싸락눈',
      80: '약한 소나기',
      81: '소나기',
      82: '강한 소나기',
      85: '약한 눈 소나기',
      86: '강한 눈 소나기',
      95: '천둥번개',
      96: '약한 우박',
      99: '강한 우박'
    };
    return descriptions[code] || '알 수 없음';
  },

  // WMO Weather Code에서 날씨 아이콘 가져오기
  getWeatherIcon(weatherCode) {
    // WMO Weather interpretation codes
    if (weatherCode === 0) return '☀️'; // Clear sky
    if (weatherCode === 1) return '🌤️'; // Mainly clear
    if (weatherCode === 2) return '⛅'; // Partly cloudy
    if (weatherCode === 3) return '☁️'; // Overcast
    if (weatherCode === 45 || weatherCode === 48) return '🌫️'; // Fog
    if (weatherCode >= 51 && weatherCode <= 57) return '🌧️'; // Drizzle
    if (weatherCode >= 61 && weatherCode <= 67) return '🌧️'; // Rain
    if (weatherCode >= 71 && weatherCode <= 77) return '❄️'; // Snow
    if (weatherCode >= 80 && weatherCode <= 82) return '🌦️'; // Rain showers
    if (weatherCode >= 85 && weatherCode <= 86) return '🌨️'; // Snow showers
    if (weatherCode === 95) return '⛈️'; // Thunderstorm
    if (weatherCode === 96 || weatherCode === 99) return '⛈️'; // Thunderstorm with hail
    return '🌤️'; // Default
  },

  // 날씨 상태 한글 번역 (하위 호환성)
  getWeatherDescription(description) {
    return description;
  },

  // 날씨 렌더링
  renderWeather() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget || !this.weatherData) return;

    const { main, weather, wind, name } = this.weatherData;
    const temp = Math.round(main.temp);
    const feelsLike = Math.round(main.feels_like);
    const icon = this.getWeatherIcon(weather[0].code);
    const description = weather[0].description;

    weatherWidget.innerHTML = `
      <div class="weather-content">
        <div class="weather-header">
          <div class="weather-location">
            <span class="location-icon">📍</span>
            <span class="location-name">${this.escapeHtml(name)}</span>
          </div>
          <button class="weather-refresh-btn" id="weather-refresh-btn" aria-label="새로고침">
            🔄
          </button>
        </div>

        <div class="weather-main">
          <div class="weather-icon">${icon}</div>
          <div class="weather-temp-group">
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-description">${description}</div>
          </div>
        </div>

        <div class="weather-details">
          <div class="weather-detail-item">
            <span class="detail-label">체감</span>
            <span class="detail-value">${feelsLike}°C</span>
          </div>
          <div class="weather-detail-item">
            <span class="detail-label">습도</span>
            <span class="detail-value">${main.humidity}%</span>
          </div>
          <div class="weather-detail-item">
            <span class="detail-label">풍속</span>
            <span class="detail-value">${wind.speed}m/s</span>
          </div>
        </div>
      </div>
    `;

    // 새로고침 버튼 이벤트
    const refreshBtn = document.getElementById('weather-refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      this.initWeather();
    });
  },

  // 날씨 에러 렌더링
  renderWeatherError(message) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;

    weatherWidget.innerHTML = `
      <div class="weather-error">
        <div class="weather-error-icon">⚠️</div>
        <p class="weather-error-message">${this.escapeHtml(message)}</p>
        <button class="btn-primary" id="weather-retry-btn">다시 시도</button>
      </div>
    `;

    // 재시도 버튼 이벤트
    const retryBtn = document.getElementById('weather-retry-btn');
    retryBtn?.addEventListener('click', () => {
      // 로딩 상태로 변경
      weatherWidget.innerHTML = `
        <div class="weather-loading">
          <div class="loading"></div>
          <p>날씨 정보를 불러오는 중...</p>
        </div>
      `;
      this.initWeather();
    });
  },

  // ============ Pomodoro Timer Methods ============

  // 집중 타이머 초기화
  initPomodoro() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    const resetBtn = document.getElementById('pomodoro-reset-btn');

    startBtn?.addEventListener('click', () => this.startPomodoro());
    pauseBtn?.addEventListener('click', () => this.pausePomodoro());
    resetBtn?.addEventListener('click', () => this.resetPomodoro());

    // 시간 설정 버튼 이벤트
    document.querySelectorAll('.preset-btn[data-work]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.target.dataset.work);
        this.setWorkDuration(minutes);

        // 활성화 표시
        document.querySelectorAll('.preset-btn[data-work]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // 커스텀 입력 필드 초기화
        const customInput = document.getElementById('custom-work-time');
        if (customInput) customInput.value = '';
      });
    });

    document.querySelectorAll('.preset-btn[data-break]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const minutes = parseInt(e.target.dataset.break);
        this.setBreakDuration(minutes);

        // 활성화 표시
        document.querySelectorAll('.preset-btn[data-break]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // 커스텀 작업 시간 입력 이벤트
    const customWorkInput = document.getElementById('custom-work-time');
    const applyWorkBtn = document.getElementById('apply-work-time');

    // 적용 버튼 클릭
    applyWorkBtn?.addEventListener('click', () => {
      this.applyCustomWorkTime();
    });

    // Enter 키로 적용
    customWorkInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.applyCustomWorkTime();
      }
    });

    // 초기 진행 바 설정
    this.updatePomodoroProgress();
  },

  // 커스텀 작업 시간 적용
  applyCustomWorkTime() {
    const customInput = document.getElementById('custom-work-time');
    if (!customInput) return;

    const minutes = parseInt(customInput.value);

    // 입력 값 검증
    if (isNaN(minutes) || minutes < 1 || minutes > 999) {
      alert('1분에서 999분 사이의 숫자를 입력해주세요.');
      customInput.focus();
      return;
    }

    // 시간 설정
    this.setWorkDuration(minutes);

    // 프리셋 버튼 비활성화
    document.querySelectorAll('.preset-btn[data-work]').forEach(btn => {
      btn.classList.remove('active');
    });

    // 성공 피드백
    customInput.blur();
  },

  // 작업 시간 설정
  setWorkDuration(minutes) {
    // 타이머가 실행 중이면 중지
    if (this.pomodoroIsRunning) {
      this.pausePomodoro();
    }

    this.pomodoroWorkDuration = minutes * 60;

    // 현재 작업 모드이면 시간 업데이트
    if (this.pomodoroMode === 'work') {
      this.pomodoroTimeLeft = this.pomodoroWorkDuration;
      this.updatePomodoroDisplay();
      this.updatePomodoroProgress();
    }
  },

  // 휴식 시간 설정
  setBreakDuration(minutes) {
    // 타이머가 실행 중이면 중지
    if (this.pomodoroIsRunning) {
      this.pausePomodoro();
    }

    this.pomodoroBreakDuration = minutes * 60;

    // 현재 휴식 모드이면 시간 업데이트
    if (this.pomodoroMode === 'break') {
      this.pomodoroTimeLeft = this.pomodoroBreakDuration;
      this.updatePomodoroDisplay();
      this.updatePomodoroProgress();
    }
  },

  // 타이머 시작
  startPomodoro() {
    if (this.pomodoroIsRunning) return;

    this.pomodoroIsRunning = true;
    this.showPauseButton();

    this.pomodoroTimer = setInterval(() => {
      this.pomodoroTimeLeft--;

      if (this.pomodoroTimeLeft <= 0) {
        this.completePomodoro();
      } else {
        this.updatePomodoroDisplay();
        this.updatePomodoroProgress();
      }
    }, 1000);
  },

  // 타이머 일시정지
  pausePomodoro() {
    if (!this.pomodoroIsRunning) return;

    this.pomodoroIsRunning = false;
    clearInterval(this.pomodoroTimer);
    this.pomodoroTimer = null;
    this.showStartButton();
  },

  // 타이머 리셋
  resetPomodoro() {
    this.pausePomodoro();
    this.pomodoroMode = 'work';
    this.pomodoroTimeLeft = this.pomodoroWorkDuration;
    this.updatePomodoroDisplay();
    this.updatePomodoroProgress();
  },

  // 뽀모도로 완료
  completePomodoro() {
    this.pausePomodoro();

    if (this.pomodoroMode === 'work') {
      // 작업 세션 완료
      this.pomodoroSessions++;
      this.updateSessionCount();
      this.showNotification('작업 완료!', '휴식 시간입니다. 잠시 쉬어가세요 ☕');

      // 휴식 모드로 전환
      this.pomodoroMode = 'break';
      this.pomodoroTimeLeft = this.pomodoroBreakDuration;
    } else {
      // 휴식 세션 완료
      this.showNotification('휴식 완료!', '다시 집중할 시간입니다 💪');

      // 작업 모드로 전환
      this.pomodoroMode = 'work';
      this.pomodoroTimeLeft = this.pomodoroWorkDuration;
    }

    this.updatePomodoroDisplay();
    this.updatePomodoroProgress();
  },

  // 디스플레이 업데이트
  updatePomodoroDisplay() {
    const timeElement = document.getElementById('pomodoro-time');
    const modeElement = document.getElementById('pomodoro-mode');

    if (timeElement) {
      const minutes = Math.floor(this.pomodoroTimeLeft / 60);
      const seconds = this.pomodoroTimeLeft % 60;
      timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    if (modeElement) {
      modeElement.textContent = this.pomodoroMode === 'work' ? '작업 시간' : '휴식 시간';
      modeElement.className = this.pomodoroMode === 'work' ? 'pomodoro-mode work' : 'pomodoro-mode break';
    }
  },

  // 진행 바 업데이트
  updatePomodoroProgress() {
    const circle = document.getElementById('pomodoro-progress-circle');
    if (!circle) return;

    const totalDuration = this.pomodoroMode === 'work' ? this.pomodoroWorkDuration : this.pomodoroBreakDuration;
    const progress = this.pomodoroTimeLeft / totalDuration;
    const circumference = 2 * Math.PI * 90; // r = 90
    const offset = circumference * (1 - progress);

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;

    // 모드에 따라 색상 변경
    if (this.pomodoroMode === 'work') {
      circle.style.stroke = 'var(--color-primary)';
    } else {
      circle.style.stroke = 'var(--color-success)';
    }
  },

  // 세션 카운트 업데이트
  updateSessionCount() {
    const sessionsElement = document.getElementById('pomodoro-sessions');
    if (sessionsElement) {
      sessionsElement.textContent = this.pomodoroSessions;
    }
  },

  // 버튼 표시 전환
  showStartButton() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    if (startBtn) startBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
  },

  showPauseButton() {
    const startBtn = document.getElementById('pomodoro-start-btn');
    const pauseBtn = document.getElementById('pomodoro-pause-btn');
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'flex';
  },

  // 브라우저 알림
  showNotification(title, body) {
    // 알림 권한 확인
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      // 권한 요청
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      });
    }

    // 알림 권한 없어도 콘솔에 표시
    console.log(`${title}: ${body}`);
  },

  // 화면 정리
  destroy() {
    console.log('Home screen destroyed');
    this.editingId = null;

    // Timeline interval 정리
    if (this.currentTimeInterval) {
      clearInterval(this.currentTimeInterval);
      this.currentTimeInterval = null;
    }

    // Pomodoro timer 정리
    if (this.pomodoroTimer) {
      clearInterval(this.pomodoroTimer);
      this.pomodoroTimer = null;
    }
  }
};

export default HomeScreen;
