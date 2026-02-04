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
1. 모든 컴포넌트는 TypeScript로 작성
2. ESLint/Prettier 규칙 준수
3. 작업 내역은 `docs/logs/` 디렉토리에 기록

## 명령어
- `npm start` - Expo 개발 서버 시작
- `npm run android` - Android 에뮬레이터 실행
- `npm run ios` - iOS 시뮬레이터 실행
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅

## 작업 로그
모든 작업 로그는 `docs/logs/YYYY-MM-DD.md` 형식으로 기록됩니다.
