# Uni-Word

> University + Word — 대학생을 위한 토익 단어 학습 웹 서비스
>
> **2026-1 소프트웨어공학** 팀프로젝트 · **V2be** 조

---

## 1. 프로젝트 개요

토익을 준비하는 대학생들이 효율적으로 단어를 학습할 수 있도록 돕는 웹 서비스입니다. 학습자는 검증된 토익 단어장을 조회하고 영작 퀴즈로 암기 정도를 점검할 수 있으며, 관리자는 단어 데이터를 직접 관리합니다.

### 1-1. 제품 비전

토익을 준비하는 대학생들이 수준별 맞춤 학습과 AI 기반 예문 생성을 통해, 단어를 문맥 속에서 효율적으로 암기할 수 있는 스마트 웹 학습 환경을 제공한다.

### 1-2. 현재 구현 범위 (Sprint 3 MVP — PBI 1~4)

| PBI | User Story | 구현 |
|---|---|---|
| **PBI-1** 권한 기반 사용자 인증 및 세션 관리 | 학습자/관리자 계정 분리 로그인, JWT 세션 | ✅ |
| **PBI-2** 기본 토익 단어 DB 구축 | 50개 이상의 검증된 토익 단어 제공 | ✅ |
| **PBI-3** 단어장 관리 (CRUD) | 관리자가 단어 추가/수정/삭제 | ✅ |
| **PBI-4** 단어 테스트 모듈 | 한국어 뜻 → 영어 단어 입력 퀴즈 + 자동 채점 | ✅ |

> Sprint 4~5(PBI 5~10)는 이번 범위에 포함되지 않으며, 추후 확장 예정입니다.

---

## 2. 기술 스택

| 구분 | 기술 |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, react-router-dom 7 |
| Backend | Node.js, Express 5 |
| Database | MySQL 8 (mysql2/promise) |
| Auth | bcrypt, jsonwebtoken (JWT) |
| 개발 도구 | VS Code, MySQL Workbench, Postman |
| 협업 | Git & GitHub, Notion |

---

## 3. 폴더 구조

```
Uni-word/
├── schema.sql                  # MySQL 테이블 정의
├── seed.sql                    # 초기 단어 51개 시드
├── backend/
│   ├── index.js                # Express 서버 진입점
│   ├── package.json
│   ├── config/
│   │   └── db.js               # MySQL 커넥션 풀
│   ├── middlewares/
│   │   └── authMiddleware.js   # verifyToken / isAdmin
│   └── routes/
│       ├── auth.js             # /auth/signup, /auth/login
│       ├── admin.js            # /admin/words CRUD
│       ├── test.js             # /test/questions, /test/submit
│       └── words.js            # /words (학습자용 조회)
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js          # 백엔드 프록시 설정 포함
    ├── .env                    # VITE_API_URL
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx             # 라우팅 + AuthProvider
        ├── index.css
        ├── lib/
        │   └── api.js          # fetch 래퍼 (토큰 자동 첨부, 401 처리)
        ├── contexts/
        │   └── AuthContext.jsx # 로그인 상태 / 역할 관리
        ├── components/
        │   └── ProtectedRoute.jsx  # 라우트 가드
        ├── Login.jsx
        ├── Register.jsx
        ├── Home.jsx            # 역할별 메인 화면
        ├── WordList.jsx        # 학습자 단어장
        ├── Test.jsx            # 단어 테스트
        └── Admin.jsx           # 관리자 단어 CRUD
```

---

## 4. 시작하기

### 4-1. 사전 요구 사항

- Node.js 18 이상
- MySQL 8 이상

### 4-2. 데이터베이스 준비

```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

### 4-3. 백엔드 실행

```bash
cd backend
npm install
```

`backend/.env` 파일을 만들고 다음 값을 채웁니다.

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=uniword
JWT_SECRET=any_random_long_string
PORT=3000
```

서버 실행:

```bash
npm run dev      # 개발 모드 (nodemon)
# 또는
npm start        # 일반 실행
```

기본 포트: `http://localhost:3000`

### 4-4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

기본 포트: `http://localhost:5173`

`vite.config.js`의 프록시 설정으로 `/auth`, `/admin`, `/test`, `/words` 요청은 자동으로 백엔드(3000)로 전달됩니다. 별도 CORS 설정이 필요하지 않습니다.

### 4-5. 관리자 계정 만들기

회원가입 시에는 모두 `role='user'`(학습자)로 생성됩니다. 관리자 계정은 직접 DB에서 권한을 부여합니다.

1. 회원가입 페이지에서 admin용 계정 생성 (예: `admin@example.com`)
2. MySQL Workbench에서 다음 쿼리 실행:

```sql
USE uniword;
UPDATE users SET role='admin' WHERE email='admin@example.com';
```

3. 로그아웃 후 다시 로그인하면 토큰에 새 권한이 반영됩니다.

---

## 5. 주요 기능

### 5-1. 학습자 (role: `user`)

| 화면 | 경로 | 기능 |
|---|---|---|
| 회원가입 | `/register` | 이름·이메일·비밀번호로 가입 |
| 로그인 | `/` | JWT 토큰 발급 후 홈 진입 |
| 홈 | `/home` | 영단어장·단어 테스트 메뉴 |
| 영단어장 | `/wordlist` | 단어 조회, 레벨 필터, 검색 |
| 단어 테스트 | `/test` | 5/10/20문제 선택 → 풀이 → 자동 채점 결과 |

### 5-2. 관리자 (role: `admin`)

| 화면 | 경로 | 기능 |
|---|---|---|
| 홈 | `/home` | 단어 관리 메뉴 |
| 단어 관리 | `/admin/words` | 단어 통계, 추가/수정/삭제, 레벨 필터 |

관리자 전용 라우트(`/admin/words`)는 `ProtectedRoute`로 가드되어 있으며, 권한 없는 사용자가 직접 URL로 접근하면 자동으로 `/home`으로 리다이렉트됩니다.

---

## 6. API 명세

모든 요청·응답은 JSON 형식이며, 인증이 필요한 API는 `Authorization: Bearer <JWT>` 헤더를 포함해야 합니다.

### 6-1. 인증 (`/auth`)

| Method | Endpoint | 권한 | 설명 |
|---|---|---|---|
| POST | `/auth/signup` | 공개 | 회원가입 — `{ email, password, name }` |
| POST | `/auth/login` | 공개 | 로그인 — `{ email, password }` → `{ token, user }` |

### 6-2. 단어 조회 (`/words`)

| Method | Endpoint | 권한 | 설명 |
|---|---|---|---|
| GET | `/words` | 로그인 필수 | 단어 목록 전체 조회 (PBI-2) |

### 6-3. 단어 관리 (`/admin/words`) — 관리자 전용

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/admin/words` | 단어 목록 조회 |
| POST | `/admin/words` | 단어 추가 — `{ word, mean, pos, level }` |
| PUT | `/admin/words/:id` | 단어 수정 |
| DELETE | `/admin/words/:id` | 단어 삭제 |

### 6-4. 단어 테스트 (`/test`)

| Method | Endpoint | 권한 | 설명 |
|---|---|---|---|
| GET | `/test/questions?count=10` | 로그인 필수 | 무작위 문제 N개 (정답 제외) |
| POST | `/test/submit` | 로그인 필수 | 답안 제출 — `{ answers: [{ word_id, user_answer }] }` |

응답 예시:

```json
{
  "success": true,
  "result": {
    "total_count": 10,
    "correct_count": 7,
    "score": 70.0,
    "details": [
      { "word_id": 1, "is_correct": true, "correct_answer": "apple" }
    ]
  }
}
```

---

## 7. 데이터베이스 스키마

| 테이블 | 역할 | 관련 PBI |
|---|---|---|
| `users` | 회원 정보 (`email`, `password` 해시, `name`, `role`) | PBI-1 |
| `words` | 단어 데이터 (`word`, `mean`, `pos`, `level`) | PBI-2, 3 |
| `test_results` | 테스트 회차별 결과 (점수, 정오답 수) | PBI-4 |
| `test_answers` | 문항별 정오답 기록 | PBI-4 |

자세한 정의는 [`schema.sql`](./schema.sql) 참고.

---

## 8. 인증·권한 모델

```
회원가입 → role='user' 로 INSERT
로그인 → JWT 발급 (id, role 포함, 1시간 만료)
요청 시 Authorization 헤더에 토큰 첨부
  ├─ verifyToken    : 로그인 여부 확인 (학습자/관리자 모두 통과)
  └─ isAdmin        : role==='admin' 체크 (관리자 전용 API)
```

| 라우트 | 비로그인 | 학습자 | 관리자 |
|---|---|---|---|
| `/`, `/register` | ✅ | ✅ | ✅ |
| `/home`, `/wordlist`, `/test` | ❌ → `/` | ✅ | ✅ |
| `/admin/words` | ❌ → `/` | ❌ → `/home` | ✅ |

---

## 9. 향후 계획 (Sprint 4~5)

| Sprint | PBI | 내용 |
|---|---|---|
| Sprint 4 | PBI-5 | 사용자 데이터 기반 수준별 자동 출제 |
| Sprint 4 | PBI-6 | 학습 통계 대시보드 (오답률, 진도) |
| Sprint 4 | PBI-7 | 전공 문맥 기반 AI 예문 생성 |
| Sprint 4 | PBI-8 | 에빙하우스 망각 곡선 기반 복습 푸시 |
| Sprint 5 | PBI-9 | 개인화된 오답노트 |
| Sprint 5 | PBI-10 | 단어 즐겨찾기 / 그룹화 |

---

## 10. 팀

**V2be조 · 2026-1 소프트웨어공학**

- GitHub: <https://github.com/Changsungwoo-SMU/Uni-word>

---

## 11. 브랜치 전략

```
main           : 안정 버전
develop        : 통합 개발 브랜치
feature/<기능명>: 개별 기능 작업 브랜치
```

PR 생성 → 1인 이상 코드 리뷰 통과 → `develop` 머지를 원칙으로 합니다.
