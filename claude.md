# CloudPocket

## 프로젝트 개요
Google Sheets를 활용한 개인 재정 관리 모바일 애플리케이션

## 기술 스택
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Linting**: ESLint + Prettier
- **Architecture**: MVC 패턴

## 디렉토리 구조
```
src/
├── models/          # 데이터 모델 및 비즈니스 로직
├── views/           # UI 컴포넌트 (screens, components)
│   ├── screens/     # 화면 단위 컴포넌트
│   └── components/  # 재사용 가능한 UI 컴포넌트
├── controllers/     # 컨트롤러 (상태 관리, 이벤트 핸들링)
├── services/        # 외부 API 연동 (Google Sheets 등)
├── utils/           # 유틸리티 함수
├── constants/       # 상수 정의
└── types/           # TypeScript 타입 정의
```

## 개발 규칙

### 기본 원칙
1. 모든 컴포넌트는 TypeScript로 작성
2. ESLint/Prettier 규칙 준수
3. 작업 내역은 `docs/logs/` 디렉토리에 기록

### 확장성 및 도메인 설계
- **도메인 단위 개발**: 기능을 도메인 단위로 분리하여 독립적으로 개발
- **인터페이스 기반 설계**: 서비스는 항상 인터페이스를 먼저 정의하고 구현
- **의존성 역전**: 상위 모듈이 하위 모듈에 직접 의존하지 않도록 설계
- **단일 책임 원칙**: 각 모듈/클래스는 하나의 책임만 가지도록 설계

### TDD (Test-Driven Development)
1. **Red**: 실패하는 테스트 코드 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 정리 및 개선 (테스트는 계속 통과해야 함)

```
작업 흐름:
테스트 작성 → 테스트 실패 확인 → 구현 → 테스트 통과 → 리팩토링
```

- 테스트 파일 위치: `__tests__/` 디렉토리 또는 `*.test.ts`, `*.spec.ts`
- 단위 테스트 커버리지 목표:
  - **서비스/API 레이어**: 100% 필수
  - **공통 컴포넌트**: 100%
  - **화면 컴포넌트**: 75% (복잡한 UI 로직으로 인해)
  - **전체**: 80% 이상

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|-----|------|-----|
| 파일/폴더 | kebab-case 또는 PascalCase (컴포넌트) | `date-utils.ts`, `CalendarScreen.tsx` |
| 컴포넌트 | PascalCase | `TransactionItem`, `CalendarGrid` |
| 함수/변수 | camelCase | `formatCurrency`, `isLoading` |
| 상수 | UPPER_SNAKE_CASE | `MAX_AMOUNT`, `DEFAULT_CATEGORY` |
| 타입/인터페이스 | PascalCase | `Transaction`, `ITransactionService` |
| 훅 | use 접두사 + camelCase | `useTransactions`, `useTheme` |
| 이벤트 핸들러 | handle/on 접두사 | `handlePress`, `onSubmit` |

### API 문서화
- API 개발 시 반드시 문서화 필수
- API 명세서: `docs/api/` 디렉토리에 작성
- 요청/응답 JSON 예시: `docs/api/examples/` 디렉토리에 저장
- API 테스트 페이지: Swagger 스타일의 인터랙티브 문서 제공 (개발 환경)

```
docs/
├── api/
│   ├── README.md           # API 개요
│   ├── transactions.md     # 거래 API 명세
│   ├── categories.md       # 카테고리 API 명세
│   └── examples/
│       ├── transaction-create.json
│       └── transaction-response.json
```

## 명령어
- `npm start` - Expo 개발 서버 시작
- `npm run android` - Android 에뮬레이터 실행
- `npm run ios` - iOS 시뮬레이터 실행
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅
- `npm test` - 전체 테스트 실행
- `npm run test:watch` - 테스트 감시 모드
- `npm run test:coverage` - 테스트 커버리지 리포트

## 작업 로그
모든 작업 로그는 `docs/logs/YYYY-MM-DD.md` 형식으로 기록됩니다.
