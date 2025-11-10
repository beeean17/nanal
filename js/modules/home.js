// home.js - 홈 화면 모듈
// 오늘에 집중할 수 있도록 중요한 정보들을 모아 보여주는 대시보드

import { AppState } from '../app.js';
import { FirebaseDB, FirebaseAuth } from '../firebase-config.js';

const HomeScreen = {
  todos: [],
  editingId: null,

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
          </div>
          <div class="timeline-container">
            <div class="widget-placeholder">
              <span class="icon">📋</span>
              <p>타임라인 (개발 예정)</p>
            </div>
          </div>
        </section>
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

  // 초기화 및 이벤트 리스너 설정
  async init() {
    console.log('Home screen initialized');

    // To-Do 불러오기
    await this.loadTodos();
    this.renderTodoList();

    // 추가 버튼 클릭
    const addBtn = document.getElementById('add-todo-btn');
    addBtn?.addEventListener('click', () => {
      const inputContainer = document.querySelector('.todo-input-container');
      const isVisible = inputContainer.style.display === 'block';
      this.toggleInputContainer(!isVisible);
    });

    // 저장 버튼 클릭
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

    // 취소 버튼 클릭
    const cancelBtn = document.getElementById('cancel-todo-btn');
    cancelBtn?.addEventListener('click', () => {
      this.toggleInputContainer(false);
    });

    // Enter 키로 저장
    const input = document.getElementById('todo-input');
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveBtn?.click();
      }
    });

    // Escape 키로 취소
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleInputContainer(false);
      }
    });

    // TODO: Week 2에서 구현
    // - 날씨 위젯
    // - 타임라인
    // - 뽀모도로 타이머
  },

  // 화면 정리
  destroy() {
    console.log('Home screen destroyed');
    this.editingId = null;
  }
};

export default HomeScreen;
