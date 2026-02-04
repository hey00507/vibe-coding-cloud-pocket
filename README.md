# CloudPocket

Google Sheets를 활용한 개인 재정 관리 모바일 앱

## 기술 스택

- **Framework**: React Native + Expo (SDK 52)
- **Language**: TypeScript
- **Backend**: Google Sheets API
- **Architecture**: MVC 패턴

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start          # Expo 개발 서버
npm run ios        # iOS 시뮬레이터
npm run android    # Android 에뮬레이터
npm run web        # 웹 브라우저
```

### 코드 품질 검사

```bash
npm run lint       # ESLint 검사
npm run lint:fix   # ESLint 자동 수정
npm run format     # Prettier 포맷팅
```

## 프로젝트 구조

```
src/
├── models/          # 데이터 모델 및 비즈니스 로직
├── views/           # UI 컴포넌트
│   ├── screens/     # 화면 단위 컴포넌트
│   └── components/  # 재사용 가능한 컴포넌트
├── controllers/     # 상태 관리, 이벤트 핸들링
├── services/        # 외부 API 연동 (Google Sheets 등)
├── utils/           # 유틸리티 함수
├── constants/       # 상수 정의
└── types/           # TypeScript 타입 정의
```

## 라이선스

Private
