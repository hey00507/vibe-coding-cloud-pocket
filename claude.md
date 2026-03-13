# CloudPocket

## 프로젝트 개요
개인 재정 관리 iOS 앱 (App Store 미배포, 개인 디바이스 전용)

## 기술 스택
- React Native + Expo (SDK 54) / TypeScript
- React Navigation (Bottom Tabs) / Jest + RTL
- AsyncStorage (영속화) / MVC 패턴

## 명령어
- `npm start` / `npm run ios` / `npm run android`
- `npm test` / `npm run test:watch` / `npm run test:coverage`
- `npm run lint` / `npm run lint:fix` / `npm run format`

## 개발 규칙
- TypeScript 필수, ESLint/Prettier 준수
- **TDD**: 테스트 먼저 → 구현 → 리팩토링
- **인터페이스 기반 설계**: 서비스는 인터페이스 먼저 정의
- 커버리지 목표: 서비스 100%, 컴포넌트 100%, 화면 75%, 전체 80%+

## 작업 완료 프로토콜

작업 완료 시 아래 순서대로 자동 실행:

1. **작업 로그**: `docs/logs/YYYY-MM-DD.md` (구현 내용, 테스트 결과, 수정 파일)
2. **챗 로그**: `docs/logs/chat/YYYY-MM-DD-{주제}.md` (결정사항, 트러블슈팅)
3. **Git 커밋**: 기능별 분리 커밋, `{Type}: {한글 설명}` 형식
   - Type: `Feat`, `Fix`, `Refactor`, `Test`, `Docs`, `Chore`
   - 마지막 커밋 전 `npm test` 통과 확인
