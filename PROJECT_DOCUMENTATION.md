# 나날 (Nanal) - 프로젝트 종합 문서 📚

> **일상 관리 허브** - 개인의 시간, 목표, 재정을 통합 관리하는 올인원 생산성 웹 애플리케이션

**최종 업데이트:** 2025-11-26
**현재 진행률:** ~60% (Week 3 진행 중)
**배포 URL:** Coming Soon (GitHub Pages)

---

## 📑 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#-기술-스택)
3. [아키텍처](#-아키텍처)
4. [완료된 작업](#-완료된-작업)
5. [진행 중인 작업](#-진행-중인-작업)
6. [남은 작업](#-남은-작업)
7. [주차별 계획](#-주차별-계획)
8. [파일 구조](#-파일-구조)
9. [주요 기능 상세](#-주요-기능-상세)
10. [개발 가이드](#-개발-가이드)
11. [배포 전략](#-배포-전략)

---

## 🎯 프로젝트 개요

### 프로젝트 철학

**나날 (Nanal)**은 다음 3가지 핵심 철학을 바탕으로 개발되었습니다:

1. **No Framework** - 순수 바닐라 JavaScript, HTML, CSS로 구현하여 웹 기본 기술에 대한 깊은 이해 추구
2. **Free to Use** - Firebase Spark 플랜(무료)을 활용하여 사용자에게 비용 부담 없는 서비스 제공
3. **Responsive Design** - 모바일 우선 접근 방식으로 모든 디바이스에서 일관된 UX 제공

### 5-Screen 아키텍처

| 화면 | 목적 | 주요 기능 | 상태 |
|------|------|-----------|------|
| 🏠 **홈** | 오늘 하루 집중 대시보드 | To-Do List, 타임라인, 날씨, 집중 타이머 | ✅ 완성 |
| 📊 **주간** | 주간 통계 및 분석 | 주간 목표, 습관 트래킹, 통계 대시보드 | 🚧 진행 중 |
| 📅 **캘린더** | 월간 일정 & 가계부 통합 | 월간 캘린더, 일정 관리, 예산 관리 | 🚧 진행 중 |
| 🎯 **성장** | 장기 목표 & 습관 추적 | 목표 진행률, 습관 히트맵, D-Day 관리 | 🚧 진행 중 |
| ⋯ **더보기** | 설정 & 부가 기능 | 빠른 메모, 검색, 설정, 데이터 백업 | 🚧 진행 중 |

### 프로젝트 성공 기준

#### 필수 (Must Have) ✅
- ✅ 5개 화면 모두 정상 작동
- ✅ 모바일/태블릿/데스크탑 반응형 레이아웃
- ✅ Firebase 실시간 동기화
- ✅ 모든 기능 CRUD 완성

#### 권장 (Should Have) 🚧
- 🚧 통계 대시보드
- ❌ 전체 검색 기능
- ✅ 라이트/다크 모드
- ✅ UI 애니메이션

#### 선택 (Nice to Have) 📋
- ❌ PWA 변환
- ✅ 오프라인 지원 (LocalStorage)
- ❌ 키보드 단축키
- ❌ CSV/PDF 내보내기

---

## 🛠️ 기술 스택

### 프론트엔드

| 기술 | 용도 | 버전/특이사항 |
|------|------|---------------|
| **HTML5** | 시맨틱 마크업 | `<main>`, `<nav>`, `<section>` 등 활용 |
| **CSS3** | 스타일링 | Flexbox, Grid, CSS Variables, `clamp()` |
| **JavaScript ES6+** | 로직 구현 | 모듈 시스템 (`import/export`), `async/await` |
| **SVG** | 벡터 그래픽 | 아이콘, 타이머 프로그레스 바, 타임라인 시각화 |

### 백엔드 & 데이터베이스

| 서비스 | 용도 | 플랜 |
|--------|------|------|
| **Firebase Firestore** | NoSQL 실시간 데이터베이스 | Spark (무료) |
| **Firebase Authentication** | 사용자 인증 (Google OAuth, Email/Password) | Spark (무료) |
| **Firebase Hosting** | (선택) 웹 호스팅 | Spark (무료) |
| **LocalStorage API** | 오프라인 데이터 저장 | 브라우저 내장 |

### 외부 API

| API | 용도 | 제약사항 |
|-----|------|----------|
| **Open-Meteo** | 날씨 데이터 | 완전 무료, API 키 불필요, 일 10,000 호출 |
| **Geolocation API** | 사용자 위치 감지 | 브라우저 내장, HTTPS 필수 |
| **Notification API** | 타이머 알림 | 브라우저 내장, 권한 필요 |

### 개발 도구

- **버전 관리:** Git + GitHub
- **배포:** GitHub Pages (예정)
- **에디터:** VSCode
- **디버깅:** Chrome DevTools

---

## 🏗️ 아키텍처

### 디자인 패턴: MVC Lite

```
┌─────────────────────────────────────────────┐
│              View (HTML/CSS)                │
│  - index.html                               │
│  - css/main.css, variables.css, responsive  │
└─────────────┬───────────────────────────────┘
              │ DOM Update
              ↓
┌─────────────────────────────────────────────┐
│         Controller (js/app.js)              │
│  - Router                                   │
│  - Event Listeners                          │
│  - Screen Modules (home, calendar, etc.)    │
└─────────────┬───────────────────────────────┘
              │ setState()
              ↓
┌─────────────────────────────────────────────┐
│         Model (AppState + Storage)          │
│  - AppState (Single Source of Truth)        │
│  - LocalStorage API                         │
│  - Firebase Firestore                       │
└─────────────────────────────────────────────┘
```

### 모듈 구조

```javascript
// js/modules/home.js
export default {
  render() {
    // HTML 템플릿 반환
    return `<div>...</div>`;
  },

  init() {
    // 이벤트 리스너 등록
    // 데이터 로드
    // 초기 렌더링
  },

  destroy() {
    // 정리 작업 (타이머 해제 등)
  }
}
```

### 상태 관리 (AppState)

```javascript
// js/app.js
const AppState = {
  currentScreen: 'home',
  user: null,
  theme: 'light',
  todos: [],
  events: [],
  budget: [],
  goals: [],
  habits: [],

  setState(newState) {
    Object.assign(this, newState);
    // 상태 변경 → UI 업데이트
  }
};
```

### 데이터 동기화 전략

```
User Action
    ↓
1. LocalStorage에 즉시 저장 (빠른 응답)
    ↓
2. Firebase Firestore에 비동기 저장 (로그인 시)
    ↓
3. Firestore onSnapshot으로 실시간 동기화
```

### 내비게이션 시스템

- **해시 라우팅:** `#home`, `#calendar`, `#growth` 등
- **히스토리 API:** 브라우저 뒤로가기/앞으로가기 지원
- **반응형 네비게이션:**
  - 모바일 (~767px): 하단 탭 바
  - 태블릿 (768-1023px): 하단 탭 바 (넓은 레이아웃)
  - 데스크탑 (1024px~): 좌측 고정 사이드바

---

## ✅ 완료된 작업

### Week 1 (11월 11일 ~ 11월 17일) - 기초 다지기 ✅ 100%

**인프라 구축:**
- ✅ 프로젝트 폴더 구조 설정 (`css/`, `js/`, `assets/`)
- ✅ Git 저장소 초기화 + `.gitignore` 설정
- ✅ Firebase 프로젝트 생성 및 설정 (Firestore, Authentication)

**핵심 시스템:**
- ✅ SPA 라우팅 시스템 (`Router` 클래스)
- ✅ 전역 상태 관리 (`AppState` 객체)
- ✅ 5개 화면 모듈 생성 (`js/modules/*.js`)
- ✅ 모바일/데스크탑 반응형 네비게이션 UI

**디자인 시스템:**
- ✅ CSS Variables 기반 디자인 토큰 (`css/variables.css`)
- ✅ 라이트/다크 테마 시스템
- ✅ 공통 컴포넌트 스타일 (카드, 버튼, 입력 필드)
- ✅ 유틸리티 클래스 (`.mobile-only`, `.desktop-only`)
- ✅ 페이드인 애니메이션

**주요 파일:**
- `index.html` - 메인 HTML 구조
- `js/app.js` - 라우터, AppState, 테마 관리
- `js/firebase-config.js` - Firebase SDK 및 헬퍼 함수
- `css/variables.css` - 디자인 시스템 토큰
- `css/main.css` - 핵심 스타일
- `css/responsive.css` - 반응형 브레이크포인트

### Week 2 (11월 18일 ~ 11월 24일) - 홈 화면 구현 ✅ 100%

#### 1️⃣ To-Do List 📝
**파일:** `js/modules/home.js` (lines 143-361), `css/main.css` (lines 655-808)

**기능:**
- ✅ CRUD 완성 (Create, Read, Update, Delete)
- ✅ 체크박스로 완료/미완료 토글
- ✅ 더블클릭 또는 버튼으로 수정
- ✅ 삭제 시 확인 다이얼로그
- ✅ XSS 보안 처리 (HTML escaping)
- ✅ 키보드 단축키 (Enter 저장, Escape 취소)
- ✅ LocalStorage + Firebase 이중 저장
- ✅ 반응형 UI + 부드러운 애니메이션
- ✅ 빈 상태 메시지

**기술 구현:**
```javascript
// XSS 방지 HTML Escape
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// LocalStorage 저장
const todos = JSON.parse(localStorage.getItem('todos')) || [];

// Firebase 동기화 (로그인 시)
if (user) {
  await FirebaseDB.set('todos', todoId, todoData);
}
```

#### 2️⃣ Timeline Widget 📅
**파일:** `js/modules/home.js` (lines 381-660), `css/main.css` (lines 861-1029)

**기능:**
- ✅ 24시간 시각적 타임라인 (0-24시)
- ✅ Hourly 라벨 표시 (00:00 ~ 23:00)
- ✅ 실시간 현재 시간 표시 (Red Line + Dot + Label)
- ✅ 1분마다 자동 업데이트
- ✅ 이벤트 추가/삭제 (제목, 시작/종료 시간, 카테고리)
- ✅ 이벤트 블록 비율 기반 배치
- ✅ 카테고리별 색상 코딩 (공부, 업무, 개인, 미팅, 기타)
- ✅ 진행 중 이벤트 pulsing 애니메이션
- ✅ 이벤트 클릭 시 상세 모달
- ✅ LocalStorage + Firebase 동기화

**기술 구현:**
```javascript
// 현재 시간 → 타임라인 위치 계산
const now = new Date();
const hours = now.getHours();
const minutes = now.getMinutes();
const position = ((hours * 60 + minutes) / (24 * 60)) * 100;

// 1분마다 Red Line 업데이트
setInterval(() => {
  updateTimeIndicator();
}, 60000);

// 이벤트 블록 절대 위치 계산
const startMinutes = startHour * 60 + startMin;
const endMinutes = endHour * 60 + endMin;
const topPercent = (startMinutes / (24 * 60)) * 100;
const heightPercent = ((endMinutes - startMinutes) / (24 * 60)) * 100;
```

#### 3️⃣ Weather Widget 🌤️
**파일:** `js/modules/home.js` (lines 921-1146), `css/main.css` (lines 490-653)

**기능:**
- ✅ Open-Meteo API 연동 (완전 무료, API 키 불필요!)
- ✅ Geolocation API로 현재 위치 자동 감지
- ✅ 실시간 날씨 데이터 (온도, 체감 온도, 습도, 풍속)
- ✅ WMO Weather Codes (0-99) 지원
- ✅ 날씨 아이콘 (☀️🌧️❄️⛈️🌫️)
- ✅ 한글 날씨 설명 번역
- ✅ 수동 새로고침 버튼
- ✅ 에러 처리 (위치 거부, API 오류)
- ✅ 로딩 상태 표시

**API 엔드포인트:**
```javascript
const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m`;
```

**WMO 코드 → 한글 매핑:**
```javascript
const weatherDescriptions = {
  0: '맑음',
  1: '대체로 맑음',
  2: '구름 조금',
  3: '흐림',
  45: '안개',
  51: '가랑비',
  61: '비',
  71: '눈',
  95: '뇌우'
  // ... 99개 코드 전체 지원
};
```

#### 4️⃣ Focus Timer (집중 타이머) ⏱️
**파일:** `js/modules/home.js` (lines 1148-1313), `css/main.css` (lines 655-817)

**기능:**
- ✅ 맞춤형 시간 설정
  - 작업 시간 프리셋: 15분, 25분, 45분, 60분
  - 커스텀 입력: 1-999분 직접 입력 (Enter 지원)
  - 휴식 시간 프리셋: 5분, 10분, 15분
- ✅ 원형 프로그레스 바 (SVG 애니메이션)
- ✅ 시작/일시정지/리셋 컨트롤
- ✅ 자동 모드 전환 (작업 ↔ 휴식)
- ✅ 세션 카운터
- ✅ 브라우저 알림 (Notification API)
- ✅ 색상 피드백 (작업=파랑, 휴식=초록)

**기술 구현:**
```javascript
// SVG 원형 프로그레스 바
const circle = document.querySelector('.timer-progress');
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;
circle.style.strokeDasharray = circumference;

// 진행률 업데이트
const offset = circumference - (progress / 100) * circumference;
circle.style.strokeDashoffset = offset;

// Notification API
if (Notification.permission === 'granted') {
  new Notification('집중 시간 완료!', {
    body: '잠깐 휴식을 취하세요.',
    icon: '/assets/icon.png'
  });
}
```

### Week 3 (11월 25일 ~ 12월 1일) - 캘린더 & 추가 화면 🚧 60%

**완료된 기능:**
- ✅ 캘린더 화면 기본 구조 (Calendar)
- ✅ 시간표 화면 기본 구조 (Timetable)
- ✅ 성장 화면 기본 구조 (Growth)
- ✅ 주간 화면 기본 구조 (Weekly)
- ✅ 더보기 화면 기본 구조 (More)
- ✅ 타임라인 UI 개선 (가로선, 레이아웃 조정)
- ✅ 홈 화면 레이아웃 개선 (날씨 위젯 배치)

**진행 중:**
- 🚧 캘린더 월간 그리드 구현
- 🚧 날짜별 이벤트 표시
- 🚧 상세 패널 인터랙션

---

## 🚧 진행 중인 작업

### 현재 브랜치: `feature/weekly-timeline`

**작업 내역:**
- 타임라인 첫 행 크기 조정
- 컬럼 아이템 너비 개선
- "오늘의 할일" 표시 방식 개선

**Modified Files:**
- `css/responsive.css`
- `js/modules/home.js`

---

## 📋 남은 작업

### 우선순위 1: 캘린더 화면 완성

**기능:**
- [ ] 동적 월간 캘린더 렌더링
  - [ ] Date 객체로 달력 생성 로직
  - [ ] 이전/다음 달 이동
  - [ ] CSS Grid 7열 레이아웃
  - [ ] 오늘 날짜 강조
- [ ] 데이터 통합 표시
  - [ ] 일정 있는 날짜에 점 표시
  - [ ] 지출/수입 색상 구분
- [ ] 상세 정보 패널
  - [ ] 날짜 클릭 시 슬라이드 애니메이션
  - [ ] [일정] / [가계부] / [메모] 탭
  - [ ] CRUD 기능
- [ ] 월별 통계 (총수입, 총지출, 순이익)

**파일:**
- `js/modules/calendar.js`
- `js/modules/budget.js` (가계부 로직)
- `css/main.css` (캘린더 스타일)

### 우선순위 2: 성장 화면 완성

**기능:**
- [ ] 목표 관리 (`js/modules/goals.js`)
  - [ ] 목표 카드 리스트 UI
  - [ ] 목표 추가/수정/삭제
  - [ ] 하위 태스크 체크리스트
  - [ ] 진행률 바 자동 업데이트
  - [ ] D-Day 계산
- [ ] 습관 트래커 (`js/modules/habits.js`)
  - [ ] 습관 목록 + 오늘 체크박스
  - [ ] 월간 히트맵 (달성 현황)
  - [ ] 연속 달성 일수 (Streak) 계산

### 우선순위 3: 시간표 화면 완성

**기능:**
- [ ] 반응형 UI
  - [ ] 모바일: 요일 탭 + 세로 타임라인
  - [ ] 데스크탑: 주간 그리드 (요일 × 시간)
- [ ] CRUD 기능
  - [ ] 일정 추가/수정/삭제
  - [ ] 드래그 앤 드롭 방식 고려
  - [ ] 과목/활동별 색상 지정
- [ ] 반복 일정 프리셋

### 우선순위 4: 더보기 화면 완성

**기능:**
- [ ] 빠른 메모 (`js/modules/notes.js`)
- [ ] 통합 검색 (앱 내 모든 데이터 검색)
- [ ] 설정 페이지
  - [x] 테마 전환 (기존 기능 연결)
  - [ ] 계정 정보 표시
  - [ ] 로그아웃 버튼
  - [ ] 데이터 백업/복원 (JSON)

### 우선순위 5: 최종 폴리싱

- [ ] Empty State 메시지 (데이터 없을 때)
- [ ] Loading State 스피너/스켈레톤 UI
- [ ] 애니메이션 최종 다듬기
- [ ] 모든 디바이스/브라우저 테스트
- [ ] 버그 수정
- [ ] GitHub Pages 배포

### 개선 사항 (Things to Add)

**긴급:**
- [ ] 로그인/로그아웃 시 메인 화면 수정
- [ ] 첫 화면 로그인 팝업
- [ ] 로그인 실패 메시지 (비밀번호 틀림)

**UX 개선:**
- [ ] 플로팅 액션 버튼 제거 또는 숨김
- [ ] 타임라인 세로 시간 칸 맞추기
- [ ] 타임라인 가로선 추가 (시간 선)
- [ ] 홈 화면 레이아웃 최적화 (가로 공간 활용)
- [ ] 시스템 테마 따라가기
- [ ] 다크 테마 색상 조정 (너무 검은색)

**기능 개선:**
- [ ] 시간표 드래그 앤 드롭 방식
- [ ] 오전 11시~오전 1시 구간 시간표 구현
- [ ] To-Do vs Events 구조 개선
  - To-Do: 시간 없는 체크리스트, 캘린더에 표시 안 됨
  - Events: 시간 있는 일정, 캘린더에 표시됨

---

## 📅 주차별 계획

### Week 1 (11월 11일 ~ 11월 17일) ✅ 완료
- ✅ 프로젝트 구조 설정
- ✅ Firebase 설정
- ✅ SPA 라우팅
- ✅ 디자인 시스템
- ✅ 반응형 네비게이션

### Week 2 (11월 18일 ~ 11월 24일) ✅ 완료
- ✅ To-Do List
- ✅ Timeline Widget
- ✅ Weather Widget
- ✅ Focus Timer

### Week 3 (11월 25일 ~ 12월 1일) 🚧 진행 중
**목표:** 캘린더 & 가계부 통합

**세부 계획:**
1. 동적 월간 캘린더 렌더링
2. 데이터 통합 표시 (일정 + 가계부)
3. 상세 정보 패널 인터랙션
4. 가계부 CRUD 구현
5. 월별 통계

**예상 산출물:**
- 이전/다음 달 이동 가능한 캘린더
- 날짜별 일정/재정 상황 아이콘 표시
- 날짜 클릭 시 하단 패널 슬라이드
- 월별 재정 통계

### Week 4 (12월 2일 ~ 12월 8일) 📋 예정
**목표:** 반응형 완성 & 성장 트래킹

**세부 계획:**
1. 전역 반응형 디자인 (`css/responsive.css`)
   - Breakpoint 설정 (768px, 1024px)
   - 폰트 크기 `clamp()` 적용
   - 터치 영역 최소 44px 보장
2. 목표 관리 (`js/modules/goals.js`)
3. 습관 트래커 (`js/modules/habits.js`)

**예상 산출물:**
- 모든 화면 브레이크포인트 대응
- 목표 진행률 바
- 습관 히트맵

### Week 5 (12월 9일 ~ 12월 15일) 📋 예정
**목표:** 시간표 & 최종 마무리

**세부 계획:**
1. 주간 시간표 (`js/modules/timetable.js`)
   - 모바일: 요일 탭 + 세로 타임라인
   - 데스크탑: 주간 그리드
   - 드래그 앤 드롭
2. 더보기 화면 기능
   - 빠른 메모
   - 통합 검색
   - 설정 페이지
3. Firebase 데이터 동기화 강화
4. 최종 점검 & 배포

**예상 산출물:**
- 멀티 디바이스 동기화 완성
- 배포된 MVP
- 실제 사용 가능한 웹 앱

---

## 📁 파일 구조

```
nanal/
├── index.html                    # 메인 HTML
├── .gitignore                    # Git 무시 파일 설정
├── README.md                     # 프로젝트 소개
├── CLAUDE.md                     # 개발 가이드라인
├── PROJECT_DOCUMENTATION.md      # 이 문서
│
├── css/
│   ├── variables.css             # 디자인 시스템 (색상, 스페이싱, 타이포그래피)
│   ├── main.css                  # 핵심 스타일 (~1,500 줄)
│   ├── responsive.css            # 반응형 브레이크포인트
│   └── components/               # (미래) 컴포넌트별 CSS
│
├── js/
│   ├── app.js                    # 라우터, AppState, 테마 관리
│   ├── firebase-config.js        # Firebase SDK 및 헬퍼
│   ├── modules/
│   │   ├── home.js               # 홈 화면 (~1,300 줄) ✅
│   │   ├── weekly.js             # 주간 화면 🚧
│   │   ├── calendar.js           # 캘린더 화면 🚧
│   │   ├── growth.js             # 성장 화면 🚧
│   │   ├── timetable.js          # 시간표 화면 🚧
│   │   └── more.js               # 더보기 화면 🚧
│   └── utils/                    # (미래) 유틸리티 함수
│
├── assets/
│   ├── icons/                    # 아이콘 파일
│   └── images/                   # 이미지 파일
│
└── private/                      # Git에 포함 안 됨 (기획 문서)
    ├── Blueprint/                # 기술 명세서, 프로젝트 개요
    ├── Plan/                     # 주차별 계획
    ├── Progress/                 # 주차별 진행 상황
    └── Security/                 # Firebase 보안 가이드
```

---

## 🎨 주요 기능 상세

---

## 🏠 홈 화면 (Home Screen) - 완벽 가이드

홈 화면은 나날 앱의 핵심으로, 오늘 하루에 집중할 수 있도록 4개의 주요 위젯으로 구성되어 있습니다.

**파일 위치:** `js/modules/home.js` (~1,300 lines), `css/main.css` (lines 400-1029)

---

### 1️⃣ To-Do List 📝

**위치:** 홈 화면 상단 좌측
**파일:** `js/modules/home.js` (lines 143-361)
**스타일:** `css/main.css` (lines 655-808)

#### 📋 상세 기능 목록

**✅ CRUD 완전 구현**
- **Create (추가)**
  - 입력 필드에 할 일 입력 후 Enter 또는 "+" 버튼 클릭
  - 빈 입력은 추가 불가 (자동 trim 처리)
  - 최대 길이 제한 없음 (단, UI는 2줄까지 표시)
  - 추가 즉시 맨 아래에 표시

- **Read (조회)**
  - 모든 To-Do 리스트 표시 (완료/미완료 구분)
  - 완료된 항목은 취소선 + 회색 처리
  - 빈 상태 메시지: "할 일을 추가해보세요" + 아이콘

- **Update (수정)**
  - 수정 방법 1: 항목 더블클릭
  - 수정 방법 2: 수정 버튼(✏️) 클릭
  - 인라인 편집 UI (입력 필드로 전환)
  - Enter 키: 저장 / Escape 키: 취소
  - 빈 값으로 수정 불가

- **Delete (삭제)**
  - 삭제 버튼(🗑️) 클릭
  - 확인 다이얼로그 표시: "정말 삭제하시겠습니까?"
  - 확인 시 즉시 삭제 및 UI 업데이트

**🔐 보안 기능**
- XSS 공격 방지를 위한 HTML Escape 처리
  ```javascript
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  ```
- 스크립트 태그, 이벤트 핸들러 등 자동 무력화

**⌨️ 키보드 단축키**
- `Enter`: 편집 모드에서 저장
- `Escape`: 편집 모드 취소
- `Enter` (입력 필드): 새 할 일 추가

**💾 데이터 저장 전략**
1. **LocalStorage 우선 저장** (즉시 응답)
   - Key: `todos`
   - Format: JSON 배열
   - 예시: `[{id, text, completed, createdAt}, ...]`

2. **Firebase 비동기 동기화** (로그인 시)
   - Collection: `users/{userId}/todos`
   - 자동 실시간 동기화
   - 오프라인 시 LocalStorage만 사용

**🎨 UI/UX 특징**
- 체크박스로 완료/미완료 토글
- 호버 시 수정/삭제 버튼 표시
- 부드러운 페이드 인/아웃 애니메이션
- 반응형 레이아웃 (모바일에서도 사용 가능)
- 접근성: ARIA 라벨, 포커스 관리

**📊 데이터 구조**
```javascript
const todo = {
  id: 'todo_1700000000000',        // Timestamp 기반 고유 ID
  text: '프로젝트 문서 작성',      // 할 일 내용 (string)
  completed: false,                // 완료 여부 (boolean)
  createdAt: '2025-11-18T10:00:00Z' // ISO 8601 생성 시간
};
```

**🔧 핵심 함수**
```javascript
// js/modules/home.js (lines 143-361)

// 1. 할 일 추가
function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();

  if (!text) return;

  const newTodo = {
    id: Date.now().toString(),
    text: escapeHtml(text),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  input.value = '';
}

// 2. 완료 토글
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// 3. 수정
function editTodo(id, newText) {
  const todo = todos.find(t => t.id === id);
  if (todo && newText.trim()) {
    todo.text = escapeHtml(newText.trim());
    saveTodos();
    renderTodos();
  }
}

// 4. 삭제
function deleteTodo(id) {
  if (confirm('정말 삭제하시겠습니까?')) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
  }
}

// 5. 저장 (LocalStorage + Firebase)
function saveTodos() {
  // LocalStorage 저장
  localStorage.setItem('todos', JSON.stringify(todos));

  // Firebase 저장 (로그인 시)
  if (user) {
    FirebaseDB.set('users', user.uid, { todos });
  }
}
```

**💡 사용 예시**
1. "운동하기" 입력 후 Enter → To-Do 추가
2. 체크박스 클릭 → 완료 처리 (취소선)
3. "운동하기" 더블클릭 → 편집 모드 진입
4. "아침 러닝 30분" 입력 후 Enter → 수정 완료
5. 🗑️ 버튼 클릭 → 삭제 확인 → 삭제 완료

---

### 2️⃣ Timeline Widget (24시간 타임라인) 📅

**위치:** 홈 화면 중앙
**파일:** `js/modules/home.js` (lines 536-1117)
**스타일:** `css/main.css` (lines 861-1029)

#### 📋 상세 기능 목록

**🕐 24시간 시각적 타임라인 (08:00 기준)**
- **시간 표시 (08:00 ~ 익일 07:59)**
  - 08:00부터 시작하여 24시간 표시
  - 세로축 시간 라벨 (08:00, 09:00, ..., 07:00)
  - `timeToMinutesFrom8AM()`: 08:00을 기준점(0분)으로 변환
  - 자정 넘어가는 시간 처리 (00:00~07:59는 다음날)
  - 비례 배치: 1시간 = 전체 높이의 1/24

- **현재 시간 인디케이터**
  - 빨간 가로선으로 현재 시간 표시 (모든 날짜 열에 표시)
  - 오늘 열에만 원형 도트 + 시간 라벨 표시 (예: "14:35")
  - 1분마다 자동 업데이트 (`updateCurrentTimeLine()`)
  - 정확한 위치 계산: 08:00 기준으로 `(currentMinutes / 1440) * 100%`
  - 초기 로드 시 현재 시간으로 자동 스크롤 (`scrollToCurrentTime()`)

- **반응형 날짜 컬럼 (화면 너비 기반)**
  - **모바일 (< 500px)**: 오늘만 표시 (1일)
  - **작은 태블릿 (500-799px)**: 어제-오늘-내일 (3일)
  - **큰 태블릿 (800-1099px)**: 오늘 중심 ±2일 (5일)
  - **데스크탑 (≥ 1100px)**: 이번 주 전체 월~일 (7일)
  - `getResponsiveDayCount()`: 화면 너비 감지하여 동적 컬럼 수 결정

**📅 이벤트 관리 (일정 + 시간표 통합)**
- **이벤트 소스 2가지**
  1. **일회성 이벤트** (`this.events`)
     - 특정 날짜에만 표시되는 일정
     - LocalStorage: `nanal_events`
     - `isFromTimetable: false`

  2. **시간표 이벤트** (`getTodayTimetableClasses()`)
     - 매주 반복되는 고정 일정 (강의, 운동 등)
     - LocalStorage: `nanal_timetable`
     - 요일 기반 필터링 (오늘 요일의 시간표만 표시)
     - `isFromTimetable: true` (🔁 아이콘 표시)

- **이벤트 추가 방법 3가지**
  1. **드래그 앤 드롭** (`attachDragListeners()`)
     - 타임라인에서 직접 드래그하여 시간 범위 선택
     - 마우스 다운 → 드래그 → 마우스 업
     - 드래그 중 오버레이 블록 표시
     - 5분 단위로 스냅 (`getTimeFromPosition()`)
     - 드래그 완료 후 프롬프트로 제목 입력

  2. **모달 폼** (미구현 - 예정)
     - 제목 (필수, 최대 50자)
     - 시작 시간 (time input)
     - 종료 시간 (time input)
     - 카테고리 선택

  3. **시간표 연동**
     - 시간표 화면에서 추가한 고정 일정
     - 해당 요일마다 자동 표시

- **이벤트 표시**
  - **카테고리별 색상 코딩** (`getCategoryColor()`)
    - 📚 공부/강의: 파랑 (#007AFF)
    - 💼 업무: 초록 (#34C759)
    - 🎯 개인: 주황 (#FF9500)
    - 👥 미팅: 빨강 (#FF3B30)
    - 📌 기타: 회색 (#8E8E93)
    - 🔬 실습: 보라 (#AF52DE)
    - 🏃 운동: 빨강 (#FF3B30)

  - **비례 블록 렌더링** (`createEventBlock()`)
    - top: `(startMinutes / 1440) * 100%`
    - height: `(duration / 1440) * 100%`
    - 08:00 기준 상대 위치 계산

  - **겹치는 이벤트 처리**
    - 시간표 이벤트 먼저 렌더링 (배경)
    - 일회성 이벤트 나중에 렌더링 (전경)
    - z-index 자동 조정

  - **진행 중 이벤트 강조** (`isEventOngoing()`)
    - 현재 시간이 startTime ≤ now < endTime인지 체크
    - `.ongoing` 클래스 추가
    - Pulsing 애니메이션 효과
    - 매분 자동 업데이트

- **이벤트 상세 & 삭제**
  - 이벤트 클릭 → 상세 모달 표시 (`showEventDetail()`)
  - 시간표 이벤트는 삭제 버튼 숨김 (읽기 전용)
  - 일회성 이벤트만 삭제 가능
  - 삭제 시 확인 다이얼로그
  - 삭제 즉시 UI 업데이트

**💾 데이터 저장 전략**
- **일회성 이벤트**
  - LocalStorage: `nanal_events` (JSON 배열)
  - Firebase: `users/{userId}/events`
  - 날짜별 필터링하여 표시

- **시간표 이벤트**
  - LocalStorage: `nanal_timetable` (JSON 배열)
  - Firebase: `users/{userId}/timetable`
  - 요일별 필터링 (`dayOfWeek: 0-6`)

**🎨 UI/UX 특징**
- **반응형 디자인** (화면 너비 기반 컬럼 수 자동 조정)
  - 모바일: 1일 (오늘만)
  - 태블릿: 3-5일
  - 데스크탑: 7일 (전체 주간)

- **자동 스크롤** (`scrollToCurrentTime()`)
  - 초기 로드 시 현재 시간으로 자동 스크롤
  - 현재 시간이 화면 중앙에 오도록 배치
  - `behavior: 'auto'` (즉시 이동)

- **5분 그리드 시스템**
  - 하루 = 288개 슬롯 (24시간 × 12개/시간)
  - 드래그 시 5분 단위로 스냅
  - 정확한 시간 선택 가능

- **시각적 피드백**
  - 드래그 중 반투명 오버레이 표시
  - 진행 중 이벤트 pulsing 애니메이션
  - 오늘 열 강조 표시
  - 호버 시 커서 변경

**📊 데이터 구조**

**1. 일회성 이벤트:**
```javascript
const event = {
  id: 'event_1700000000000',       // Timestamp 기반 고유 ID
  title: '프로젝트 회의',          // 이벤트 제목 (string)
  startTime: '14:00',              // 시작 시간 (HH:MM 형식)
  endTime: '15:30',                // 종료 시간 (HH:MM 형식)
  category: 'work',                // 카테고리 (study|work|personal|meeting|other)
  date: '2025-11-18',              // 날짜 (YYYY-MM-DD)
  isFromTimetable: false,          // 일회성 이벤트 표시
  createdAt: '2025-11-18T10:00:00Z' // 생성 시간
};
```

**2. 시간표 이벤트 (변환된 형식):**
```javascript
const timetableEvent = {
  id: 'timetable-12345',           // 'timetable-' 접두사로 구분
  title: '데이터베이스 강의',      // 수업명
  startTime: '09:00',              // 시작 시간
  endTime: '10:30',                // 종료 시간
  category: 'lecture',             // 카테고리 (lecture|lab|exercise)
  location: '공학관 301호',         // 장소 (optional)
  date: '2025-11-18',              // 오늘 날짜 (동적 생성)
  isFromTimetable: true            // 시간표 이벤트 표시
};
```

**🔧 핵심 함수**
```javascript
// js/modules/home.js (lines 536-1117)

// 1. 시간을 08:00 기준 분으로 변환
timeToMinutesFrom8AM(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  // 08:00을 기준점(0)으로 변환
  totalMinutes = totalMinutes - 8 * 60;

  // 00:00~07:59는 다음날로 취급 (음수 → 양수 변환)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60;
  }

  return totalMinutes; // 0 (08:00) ~ 1439 (익일 07:59)
}

// 2. 이벤트 위치 계산 (08:00 기준)
calculateEventPosition(event) {
  const startMinutes = this.timeToMinutesFrom8AM(event.startTime);
  const endMinutes = this.timeToMinutesFrom8AM(event.endTime);
  const totalMinutesInDay = 24 * 60; // 1440분

  const topPercent = (startMinutes / totalMinutesInDay) * 100;
  let heightPercent = ((endMinutes - startMinutes) / totalMinutesInDay) * 100;

  // 자정을 넘어가는 이벤트 처리 (예: 23:00 ~ 01:00)
  if (heightPercent < 0) {
    heightPercent += 100;
  }

  return { top: topPercent, height: heightPercent };
}

// 3. 시간표 이벤트 통합 (오늘 요일의 시간표만)
getTodayTimetableClasses() {
  const timetableData = localStorage.getItem('nanal_timetable');
  if (!timetableData) return [];

  const allClasses = JSON.parse(timetableData);
  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0 (일) ~ 6 (토)

  // 오늘 요일의 수업들을 타임라인 이벤트 형식으로 변환
  return allClasses
    .filter(c => c.dayOfWeek === todayDayOfWeek)
    .map(c => ({
      id: `timetable-${c.id}`,
      title: c.title,
      startTime: c.startTime,
      endTime: c.endTime,
      category: c.category,
      location: c.location,
      date: today.toISOString().split('T')[0],
      isFromTimetable: true
    }));
}

// 4. 이벤트 블록 생성
createEventBlock(event, dateStr, isTimetable) {
  const block = document.createElement('div');
  block.className = `timeline-event-block ${isTimetable ? 'timetable-event' : 'regular-event'} category-${event.category}`;

  // 08:00 기준 위치 계산
  const startMinutes = this.timeToMinutesFrom8AM(event.startTime);
  const endMinutes = this.timeToMinutesFrom8AM(event.endTime);
  const duration = endMinutes >= startMinutes
    ? endMinutes - startMinutes
    : (24 * 60) - startMinutes + endMinutes;

  const topPercent = (startMinutes / (24 * 60)) * 100;
  const heightPercent = (duration / (24 * 60)) * 100;

  block.style.top = `${topPercent}%`;
  block.style.height = `${heightPercent}%`;

  // 내용 렌더링
  const categoryLabel = this.getCategoryLabel(event.category);
  block.innerHTML = `
    <div class="event-block-content">
      <div class="event-time">${event.startTime} - ${event.endTime}</div>
      <div class="event-title">${this.escapeHtml(event.title)}</div>
      <div class="event-category">${categoryLabel}</div>
    </div>
  `;

  // 클릭 이벤트
  block.addEventListener('click', (e) => {
    e.stopPropagation();
    this.showEventDetail(event, isTimetable);
  });

  return block;
}

// 5. 현재 시간 인디케이터 업데이트 (모든 열에 표시)
updateCurrentTimeLine() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

  // 08:00 기준 위치 계산
  const currentMinutes = this.timeToMinutesFrom8AM(currentTimeStr);
  const topPercent = (currentMinutes / (24 * 60)) * 100;

  // 기존 현재 시간 라인들 모두 제거
  document.querySelectorAll('.timeline-current-line').forEach(line => line.remove());

  // 모든 요일 열에 현재 시간 라인 추가
  const dayColumns = document.querySelectorAll('.timeline-day-column');
  dayColumns.forEach(column => {
    const slotsContainer = column.querySelector('.timeline-day-slots');
    if (!slotsContainer) return;

    // 오늘인지 확인
    const dateStr = column.dataset.date;
    const columnDate = new Date(dateStr);
    const isToday = this.isSameDay(columnDate, now);

    // 현재 시간 라인 생성
    const currentLine = document.createElement('div');
    currentLine.className = 'timeline-current-line';

    // 오늘 열에만 시간 라벨과 점 표시
    if (isToday) {
      currentLine.classList.add('today-line');
      currentLine.innerHTML = `
        <div class="timeline-current-dot"></div>
        <div class="timeline-current-label">${currentTimeStr}</div>
      `;
    }

    currentLine.style.top = `${topPercent}%`;
    slotsContainer.appendChild(currentLine);
  });
}

// 6. 드래그로 이벤트 생성
attachDragListeners() {
  const dayColumns = document.querySelectorAll('.timeline-day-slots');

  dayColumns.forEach(slotsContainer => {
    let dragOverlay = null;

    slotsContainer.addEventListener('mousedown', (e) => {
      if (e.target.closest('.timeline-event-block')) return;

      this.isDragging = true;
      this.dragStartTime = this.getTimeFromPosition(slotsContainer, e);

      // 드래그 오버레이 생성
      dragOverlay = document.createElement('div');
      dragOverlay.className = 'drag-overlay';
      dragOverlay.style.top = `${(this.timeToMinutesFrom8AM(this.dragStartTime) / (24 * 60)) * 100}%`;
      dragOverlay.style.height = '0%';
      slotsContainer.appendChild(dragOverlay);
    });

    slotsContainer.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !dragOverlay) return;

      this.dragEndTime = this.getTimeFromPosition(slotsContainer, e);
      const startMin = this.timeToMinutesFrom8AM(this.dragStartTime);
      const endMin = this.timeToMinutesFrom8AM(this.dragEndTime);

      if (endMin > startMin) {
        const duration = endMin - startMin;
        dragOverlay.style.height = `${(duration / (24 * 60)) * 100}%`;
      }
    });

    slotsContainer.addEventListener('mouseup', (e) => {
      if (!this.isDragging) return;

      this.dragEndTime = this.getTimeFromPosition(slotsContainer, e);

      if (dragOverlay) {
        dragOverlay.remove();
        dragOverlay = null;
      }

      const startMin = this.timeToMinutesFrom8AM(this.dragStartTime);
      const endMin = this.timeToMinutesFrom8AM(this.dragEndTime);

      if (endMin > startMin && (endMin - startMin) >= 5) {
        const dateStr = slotsContainer.dataset.date;
        this.createEventFromDrag(dateStr, this.dragStartTime, this.dragEndTime);
      }

      this.isDragging = false;
    });
  });
}

// 7. 마우스 위치 → 시간 변환 (5분 스냅)
getTimeFromPosition(container, event) {
  const rect = container.getBoundingClientRect();
  const y = event.clientY - rect.top;
  const percent = y / rect.height;
  const totalMinutes = Math.round(percent * 24 * 60);

  // 5분 단위로 스냅
  const snappedMinutes = Math.round(totalMinutes / 5) * 5;

  // 08:00 기준이므로 480분을 더해서 실제 시간으로 변환
  const actualMinutes = (snappedMinutes + 8 * 60) % (24 * 60);
  const hours = Math.floor(actualMinutes / 60);
  const minutes = actualMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
```

**💡 사용 예시**
1. "+ 일정 추가" 버튼 클릭 → 모달 열림
2. 제목: "팀 미팅", 시간: 14:00-15:30, 카테고리: 미팅
3. 저장 → 타임라인에 보라색 블록 생성
4. 14:00이 되면 → Pulsing 애니메이션 시작
5. 이벤트 클릭 → 상세 모달 → 삭제 가능

---

### 3️⃣ Weather Widget (실시간 날씨) 🌤️

**위치:** 홈 화면 우측 상단
**파일:** `js/modules/home.js` (lines 921-1146)
**스타일:** `css/main.css` (lines 490-653)

#### 📋 상세 기능 목록

**🌍 완전 무료 날씨 API**
- **Open-Meteo API 사용**
  - 100% 무료 (API 키 불필요!)
  - 일 10,000 호출 무료
  - 전 세계 지역 지원
  - 실시간 기상 데이터

**📍 자동 위치 감지**
- **Geolocation API**
  - 브라우저 내장 API 사용
  - 사용자 위치 자동 감지
  - 위치 권한 요청 처리
  - 위치 거부 시 기본 위치 사용

**🌡️ 실시간 날씨 데이터**
- **표시 정보**
  - 현재 온도 (°C)
  - 체감 온도 (°C)
  - 습도 (%)
  - 풍속 (m/s)
  - 날씨 상태 (한글)
  - 날씨 아이콘 (이모지)

**☁️ WMO Weather Codes (0-99) 완전 지원**
- 맑음 (0-3)
- 안개 (45, 48)
- 이슬비/가랑비 (51, 53, 55, 56, 57)
- 비 (61, 63, 65, 66, 67, 80, 81, 82)
- 눈 (71, 73, 75, 77, 85, 86)
- 소나기 (80, 81, 82)
- 뇌우 (95, 96, 99)

**🔄 수동 새로고침**
- 새로고침 버튼 (🔄)
- 클릭 시 즉시 날씨 업데이트
- 로딩 스피너 표시
- 에러 시 재시도 가능

**❌ 에러 처리**
- 위치 권한 거부 → 안내 메시지
- API 호출 실패 → 에러 메시지 + 재시도 버튼
- 네트워크 오류 → 오프라인 메시지
- 타임아웃 처리 (10초)

**🎨 UI/UX 특징**
- 그라데이션 배경 (하늘색)
- 카드 디자인 + 그림자 효과
- 로딩 상태 스피너
- 반응형 레이아웃
- 부드러운 페이드 인 애니메이션

**📊 데이터 구조**
```javascript
const weather = {
  temperature: 15.5,               // 현재 온도 (°C)
  apparentTemperature: 13.2,       // 체감 온도 (°C)
  humidity: 65,                    // 상대 습도 (%)
  windSpeed: 3.5,                  // 풍속 (m/s)
  weatherCode: 3,                  // WMO 코드 (0-99)
  description: '흐림',             // 한글 날씨 설명
  icon: '☁️',                      // 날씨 이모지 아이콘
  location: { lat: 37.5, lon: 127 } // 위도/경도
};
```

**🔧 핵심 함수**
```javascript
// js/modules/home.js (lines 921-1146)

// 1. 위치 가져오기 (Geolocation API)
async function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

// 2. 날씨 데이터 가져오기 (Open-Meteo API)
async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}&` +
    `current=temperature_2m,relative_humidity_2m,` +
    `apparent_temperature,weather_code,wind_speed_10m`;

  const response = await fetch(url, { timeout: 10000 });

  if (!response.ok) {
    throw new Error('Weather API error');
  }

  const data = await response.json();
  return parseWeatherData(data);
}

// 3. WMO 코드 → 한글 + 아이콘 변환
function getWeatherInfo(code) {
  const weatherMap = {
    0: { description: '맑음', icon: '☀️' },
    1: { description: '대체로 맑음', icon: '🌤️' },
    2: { description: '구름 조금', icon: '⛅' },
    3: { description: '흐림', icon: '☁️' },
    45: { description: '안개', icon: '🌫️' },
    51: { description: '가랑비', icon: '🌦️' },
    61: { description: '비', icon: '🌧️' },
    71: { description: '눈', icon: '❄️' },
    95: { description: '뇌우', icon: '⛈️' }
    // ... 99개 코드 전체 매핑
  };

  return weatherMap[code] || { description: '알 수 없음', icon: '❓' };
}

// 4. 날씨 위젯 렌더링
function renderWeather(weather) {
  const container = document.getElementById('weather-widget');

  container.innerHTML = `
    <div class="weather-card">
      <div class="weather-icon">${weather.icon}</div>
      <div class="weather-temp">${Math.round(weather.temperature)}°C</div>
      <div class="weather-description">${weather.description}</div>
      <div class="weather-details">
        <span>체감 ${Math.round(weather.apparentTemperature)}°C</span>
        <span>습도 ${weather.humidity}%</span>
        <span>바람 ${weather.windSpeed}m/s</span>
      </div>
      <button id="refresh-weather-btn" class="refresh-btn">🔄</button>
    </div>
  `;
}
```

**💡 사용 예시**
1. 페이지 로드 → 위치 권한 요청
2. 허용 → 현재 위치 기반 날씨 자동 표시
3. 날씨 카드: "☁️ 흐림 15°C, 습도 65%"
4. 🔄 버튼 클릭 → 날씨 새로고침
5. 에러 발생 → "날씨 정보를 가져올 수 없습니다" + 재시도 버튼

---

### 4️⃣ Focus Timer (집중 타이머) ⏱️

**위치:** 홈 화면 하단 (독립 카드)
**파일:** `js/modules/home.js` (lines 1148-1313)
**스타일:** `css/main.css` (lines 655-817)

#### 📋 상세 기능 목록

**⏰ 맞춤형 시간 설정**
- **작업 시간 프리셋**
  - 15분, 25분 (뽀모도로), 45분, 60분
  - 버튼 클릭으로 즉시 적용

- **커스텀 시간 입력**
  - 1-999분 직접 입력
  - 입력 필드 + Enter 키 지원
  - 실시간 유효성 검사
  - 잘못된 입력 시 에러 메시지

- **휴식 시간 프리셋**
  - 5분, 10분, 15분
  - 작업 시간과 독립적으로 설정

**🎯 타이머 컨트롤**
- **시작/일시정지**
  - 시작 버튼: 타이머 시작
  - 일시정지: 현재 시간 유지
  - 재개: 중단된 지점부터 계속

- **리셋**
  - 타이머를 초기 설정값으로 되돌림
  - 세션 카운터 유지 (선택 가능)
  - 모드 초기화 (작업 모드로)

**🔄 자동 모드 전환**
- **작업 → 휴식**
  - 작업 시간 종료 → 자동으로 휴식 모드 전환
  - 브라우저 알림: "작업 완료! 휴식을 취하세요"
  - 세션 카운터 +1

- **휴식 → 작업**
  - 휴식 시간 종료 → 자동으로 작업 모드 전환
  - 브라우저 알림: "휴식 완료! 다시 집중하세요"

**📊 SVG 원형 프로그레스 바**
- 360도 원형 진행 표시
- 부드러운 애니메이션 (`stroke-dashoffset`)
- 남은 시간 비율을 시각적으로 표시
- 색상 변화: 작업(파랑) ↔ 휴식(초록)

**🔔 브라우저 알림 (Notification API)**
- **권한 요청**
  - 첫 사용 시 알림 권한 요청
  - 거부 시에도 타이머는 정상 작동

- **알림 내용**
  - 제목: "집중 시간 완료!" / "휴식 완료!"
  - 본문: 다음 행동 안내
  - 아이콘: 앱 로고

**📈 세션 카운터**
- 완료한 작업 세션 수 표시
- "오늘 N개 세션 완료"
- 페이지 새로고침 시에도 유지 (LocalStorage)

**🎨 시각적 피드백**
- **색상 변화**
  - 작업 모드: 파란색 (#007AFF)
  - 휴식 모드: 초록색 (#34C759)

- **버튼 상태**
  - 실행 중: "일시정지" 버튼 활성화
  - 정지 중: "시작" 버튼 표시

**💾 상태 지속성**
- 타이머 상태 LocalStorage 저장
- 페이지 이동 후 복귀 시에도 유지
- 리셋 전까지 계속 실행

**📊 상태 구조**
```javascript
const timerState = {
  workTime: 25,                    // 작업 시간 (분)
  breakTime: 5,                    // 휴식 시간 (분)
  timeLeft: 1500,                  // 남은 시간 (초, 25분 = 1500초)
  isRunning: false,                // 실행 중 여부
  mode: 'work',                    // 'work' | 'break'
  sessions: 0,                     // 완료한 세션 수
  intervalId: null                 // setInterval ID
};
```

**🔧 핵심 함수**
```javascript
// js/modules/home.js (lines 1148-1313)

// 1. SVG 원형 프로그레스 바 초기화
function initializeTimer() {
  const circle = document.querySelector('.timer-progress');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = 0;

  return { circle, circumference };
}

// 2. 프로그레스 바 업데이트
function updateProgress(timeLeft, totalTime) {
  const { circle, circumference } = timerData;
  const progress = (timeLeft / totalTime) * 100;
  const offset = circumference - (progress / 100) * circumference;

  circle.style.strokeDashoffset = offset;
}

// 3. 타이머 시작
function startTimer() {
  if (timerState.isRunning) return;

  timerState.isRunning = true;
  timerState.intervalId = setInterval(() => {
    timerState.timeLeft--;

    if (timerState.timeLeft <= 0) {
      completeSession();
    } else {
      updateTimerDisplay();
      updateProgress(timerState.timeLeft, getTotalTime());
    }
  }, 1000);

  updateButtonState();
}

// 4. 타이머 일시정지
function pauseTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  updateButtonState();
}

// 5. 타이머 리셋
function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  timerState.timeLeft = timerState.workTime * 60;
  timerState.mode = 'work';

  updateTimerDisplay();
  updateProgress(timerState.timeLeft, getTotalTime());
  updateButtonState();
}

// 6. 세션 완료 처리
function completeSession() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;

  // 브라우저 알림
  if (Notification.permission === 'granted') {
    new Notification(
      timerState.mode === 'work' ? '집중 시간 완료!' : '휴식 완료!',
      {
        body: timerState.mode === 'work'
          ? '잠깐 휴식을 취하세요 🌿'
          : '다시 집중할 시간입니다 💪',
        icon: '/assets/icon.png'
      }
    );
  }

  // 모드 전환
  if (timerState.mode === 'work') {
    timerState.sessions++;
    timerState.mode = 'break';
    timerState.timeLeft = timerState.breakTime * 60;
  } else {
    timerState.mode = 'work';
    timerState.timeLeft = timerState.workTime * 60;
  }

  saveTimerState();
  updateTimerDisplay();
  updateProgress(timerState.timeLeft, getTotalTime());
  updateButtonState();
}

// 7. 시간 표시 업데이트 (MM:SS 형식)
function updateTimerDisplay() {
  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;

  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  document.getElementById('timer-display').textContent = display;
  document.getElementById('timer-mode').textContent =
    timerState.mode === 'work' ? '집중 시간' : '휴식 시간';

  // 색상 변경
  const card = document.querySelector('.timer-card');
  card.className = `timer-card ${timerState.mode}-mode`;
}
```

**💡 사용 예시**
1. "25분" 버튼 클릭 → 작업 시간 25분 설정
2. "5분" (휴식) 버튼 클릭 → 휴식 시간 5분 설정
3. "시작" 버튼 클릭 → 타이머 시작 (25:00 → 24:59 → ...)
4. 중간에 "일시정지" → 타이머 멈춤
5. "재개" → 중단된 시간부터 계속
6. 00:00 도달 → 브라우저 알림 + 자동으로 휴식 모드 전환
7. 휴식 완료 → 다시 작업 모드, 세션 카운터 +1

---

## 🏠 홈 화면 전체 요약

**구성 요소:** 4개 핵심 위젯
1. **To-Do List** - 할 일 관리 (CRUD, XSS 보안, 키보드 단축키)
2. **Timeline Widget** - 24시간 일정 시각화 (실시간 인디케이터, 카테고리 색상)
3. **Weather Widget** - 실시간 날씨 (Open-Meteo API, 무료, WMO 코드 지원)
4. **Focus Timer** - 뽀모도로 타이머 (맞춤 설정, SVG 프로그레스, 브라우저 알림)

**총 코드 라인 수:** ~1,300 lines (js/modules/home.js)
**총 스타일 라인 수:** ~600 lines (css/main.css)

**데이터 저장:** LocalStorage (우선) + Firebase (로그인 시 동기화)
**반응형 지원:** 모바일, 태블릿, 데스크탑 완벽 대응
**접근성:** ARIA 라벨, 키보드 네비게이션, 포커스 관리

---

## 📊 기타 화면 (간략 개요)

### 🗓️ 주간 화면 (Weekly Screen)

**파일:** `js/modules/weekly.js` (~710 lines)

**주요 기능:**
- 주간 타임라인 (월~일 7일)
- 드래그로 일정 생성
- 시간표 편집 모달
- 고정 시간표 vs 임시 일정 구분
- LocalStorage + Firebase 동기화

### 📅 캘린더 화면 (Calendar Screen)

**파일:** `js/modules/calendar.js` (~1,146 lines)

**주요 기능:**
- 월간 캘린더 그리드 렌더링
- 날짜별 일정/예산 통합 표시
- 탭 UI (일정 / 가계부)
- 월별 통계 (수입/지출/잔액)
- CRUD 완전 구현

### 🎯 성장 화면 (Growth Screen)

**파일:** `js/modules/growth.js` (~862 lines)

**주요 기능:**
- 목표 관리 (제목, 설명, 시작/종료일, 진행률, 카테고리)
- D-Day 계산 및 표시
- 습관 트래커 (매일/주N회)
- 연속 달성 일수 (Streak)
- 주간 진행률

### 📚 시간표 화면 (Timetable Screen)

**파일:** `js/modules/timetable.js` (~446 lines)

**주요 기능:**
- 주간 그리드 (일~토)
- 수업 블록 시각화 (08:00-23:00)
- 카테고리별 색상 (강의, 실습, 스터디, 업무 등)
- 장소 정보 표시
- CRUD 기능

### ⋯ 더보기 화면 (More Screen)

**파일:** `js/modules/more.js` (~594 lines)

**주요 기능:**
- 사용자 정보 (로그인/로그아웃)
- 통계 대시보드 (목표, 습관, 일정, 달성률)
- 테마 전환 (라이트/다크)
- 데이터 백업/복원 (JSON)
- 전체 데이터 삭제
- 로그인 모달 (이메일/비밀번호, Google OAuth)

---

```
function startTimer() { /* ... */ }
function pauseTimer() { /* ... */ }
function resetTimer() { /* ... */ }
function switchMode() { /* work ↔ break */ }
function notifyUser(message) { /* Notification API */ }
```

---

## 🔧 개발 가이드

### 코딩 컨벤션

**JavaScript:**
- 함수명: `camelCase` (예: `getTodoList`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_TODOS`)
- 클래스명: `PascalCase` (예: `TodoManager`)
- JSDoc 주석 사용

**CSS:**
- 클래스명: BEM 방법론 (예: `.card__title--highlighted`)
- 파일 분리: 컴포넌트별로 분리 가능

**Git 커밋 메시지:**
```
유형: 제목

유형: feat, fix, style, refactor, docs, test
예시: feat: 홈 화면에 To-Do List 기능 추가
```

### Git 워크플로우

**브랜치 전략:**
```bash
# 1. 기능 브랜치 생성
git checkout -b feature/feature-name

# 2. 개발 및 커밋
git add .
git commit -m "feat: 기능 구현"

# 3. 푸시
git push -u origin feature/feature-name

# 4. Pull Request 생성 → 리뷰 → Merge
# 5. 브랜치 삭제
git branch -d feature/feature-name
```

**중요 규칙:**
- ⚠️ Claude는 자동으로 commit/push 금지
- ⚠️ 사용자가 수동으로 Git 작업 수행
- ⚠️ Claude는 파일 수정만 담당

### 반응형 브레이크포인트

```css
/* Mobile First */
/* 기본: ~ 767px */

/* Tablet: 768px ~ 1023px */
@media (min-width: 768px) {
  /* ... */
}

/* Desktop: 1024px ~ */
@media (min-width: 1024px) {
  /* ... */
}
```

### 성능 최적화

1. **이벤트 위임:** 동적 요소에 이벤트 리스너 최소화
2. **debounce/throttle:** 빈번한 이벤트 제어
3. **CSS GPU 가속:** `transform`, `opacity` 사용
4. **LocalStorage 우선:** 빠른 응답성
5. **이미지 최적화:** WebP, 적절한 크기

### 접근성 (a11y)

- 시맨틱 HTML 태그 사용
- ARIA 속성 추가 (`aria-label`, `role`)
- 키보드 네비게이션 지원
- 명도 대비 WCAG AA 준수
- 터치 영역 최소 44px

---

## 🚀 배포 전략

### GitHub Pages 배포

**설정:**
1. GitHub Settings → Pages
2. Source: `main` branch, `/ (root)` folder
3. 5-10분 대기
4. 접속: `https://username.github.io/nanal`

**주의사항:**
- Firebase config 프로덕션 설정 필요
- 상대 경로 사용 (모든 에셋)
- `<base href="/nanal/">` 설정 (index.html:10)

**로컬 테스트:**
```bash
# Python 3
python -m http.server 8000

# 접속: http://localhost:8000
```

### Firebase Hosting (대안)

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 로그인
firebase login

# 초기화
firebase init hosting

# 배포
firebase deploy --only hosting
```

---

## 📊 프로젝트 진행률

### 전체 진행률: ~60%

| 영역 | 진행률 | 상태 |
|------|--------|------|
| **인프라** | 100% | ✅ 완료 |
| **디자인 시스템** | 100% | ✅ 완료 |
| **홈 화면** | 100% | ✅ 완료 |
| **주간 화면** | 40% | 🚧 진행 중 |
| **캘린더 화면** | 30% | 🚧 진행 중 |
| **성장 화면** | 20% | 🚧 진행 중 |
| **시간표 화면** | 20% | 🚧 진행 중 |
| **더보기 화면** | 30% | 🚧 진행 중 |
| **반응형 디자인** | 70% | 🚧 진행 중 |
| **Firebase 연동** | 80% | 🚧 진행 중 |
| **최종 폴리싱** | 0% | ❌ 미시작 |

### 코드 통계 (현재)

- **JavaScript:** ~2,500 줄
  - `js/app.js`: ~290 줄
  - `js/modules/home.js`: ~1,300 줄
  - `js/firebase-config.js`: ~150 줄
  - 기타 모듈: ~760 줄
- **CSS:** ~2,000 줄
  - `css/main.css`: ~1,500 줄
  - `css/variables.css`: ~200 줄
  - `css/responsive.css`: ~300 줄
- **HTML:** ~100 줄
  - `index.html`: 86 줄

### 주요 마일스톤

- ✅ Week 1 완료 (2025-11-17)
- ✅ Week 2 완료 (2025-11-24)
- 🚧 Week 3 진행 중 (2025-11-26 현재)
- 📋 Week 4 예정 (12월 2일 시작)
- 📋 Week 5 예정 (12월 9일 시작)
- 🎯 MVP 배포 목표 (12월 15일)

---

## 🔐 보안 & 데이터 정책

### Firebase Security Rules

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 데이터는 본인만 접근 가능
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 공개 데이터 (읽기 전용)
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 데이터 보안

1. **XSS 방지:** 모든 사용자 입력 HTML escape
2. **API 키 관리:** `.gitignore`에 Firebase config 추가
3. **HTTPS 강제:** Firebase Hosting 자동 적용
4. **인증 필수:** 민감 데이터는 로그인 필수
5. **LocalStorage 암호화:** (선택) 민감 정보 암호화

---

## 📚 참고 문서

### 프로젝트 내 문서
- `CLAUDE.md` - 개발 가이드라인 및 주차별 진행 상황
- `private/Blueprint/Project_Overview.md` - 프로젝트 개요
- `private/Blueprint/Technical_Specifications.md` - 기술 명세서
- `private/Plan/Week*.md` - 주차별 계획
- `private/Progress/Overall_Progress.md` - 전체 진행 상황
- `private/Progress/DEPLOYMENT.md` - 배포 가이드

### 외부 문서
- [Firebase 문서](https://firebase.google.com/docs)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## 🤝 기여 및 라이선스

**프로젝트 팀:** 개인 프로젝트 / 학습 목적

**라이선스:** MIT (예정)

---

## 📞 연락처 & 링크

- **GitHub:** [beeean17/nanal](https://github.com/beeean17/Term_Project)
- **배포 URL:** Coming Soon
- **이슈 트래커:** GitHub Issues

---

**최종 업데이트:** 2025-11-26
**문서 버전:** 1.0.0
**작성자:** Claude Code + Project Team
