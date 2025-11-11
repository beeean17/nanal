// home.js - 홈 화면 모듈
// 오늘에 집중할 수 있도록 중요한 정보들을 모아 보여주는 대시보드

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const HomeScreen = {
  todos: [],
  editingId: null,
  events: [], // Timeline events
  currentTimeInterval: null, // For updating current time

  // 화면 렌더링
  render() {
    return `
      <div class="home-screen fade-in">
        <div class="home-header">
          <h1 class="screen-title">홈</h1>
          <p class="screen-subtitle">오늘 하루를 시작해보세요</p>
        </div>

        <!-- 날씨 위젯 -->
        <section class="weather-widget">
          <div class="widget-placeholder">
            <span class="icon">🌤️</span>
            <p>날씨 위젯 (개발 예정)</p>
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
            <h2>오늘의 일정</h2>
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
      await FirebaseDB.set('users', user.uid, {
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
      study: '#007AFF',
      work: '#34C759',
      personal: '#FF9500',
      meeting: '#FF3B30',
      other: '#8E8E93'
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
  getTodayEvents() {
    const today = new Date().toISOString().split('T')[0];
    return this.events.filter(e => e.date === today)
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

    return `
      <div
        class="timeline-event-block ${isOngoing ? 'ongoing' : ''}"
        data-id="${event.id}"
        style="top: ${position.top}%; height: ${position.height}%; background-color: ${color};"
      >
        <div class="event-block-time">${event.startTime}</div>
        <div class="event-block-title">${this.escapeHtml(event.title)}</div>
      </div>
    `;
  },

  // 카테고리 레이블
  getCategoryLabel(category) {
    const labels = {
      study: '📚 공부',
      work: '💼 업무',
      personal: '🎯 개인',
      meeting: '👥 미팅',
      other: '📌 기타'
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
      await FirebaseDB.set('users', user.uid, {
        todos: this.todos,
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
    const user = FirebaseAuth.getCurrentUser();

    if (user) {
      const firebaseEvents = await this.loadEventsFromFirebase();
      if (firebaseEvents.length > 0) {
        this.events = firebaseEvents;
        this.saveEventsToLocal();
        return;
      }
    }

    this.events = this.loadEventsFromLocal();
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
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('event-detail-modal');
    const modalTitle = document.getElementById('modal-event-title');
    const modalTime = document.getElementById('modal-event-time-text');
    const modalCategory = document.getElementById('modal-event-category-text');

    modalTitle.textContent = event.title;
    modalTime.textContent = `${event.startTime} ~ ${event.endTime}`;
    modalCategory.textContent = this.getCategoryLabel(event.category);

    modal.style.display = 'flex';

    // 모달 삭제 버튼에 이벤트 ID 저장
    const deleteBtn = document.getElementById('modal-delete-btn');
    deleteBtn.dataset.eventId = eventId;
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

    // TODO: Week 2에서 구현
    // - 날씨 위젯
    // - 뽀모도로 타이머
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
  }
};

export default HomeScreen;
