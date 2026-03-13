# 2026-03-13 테마 시스템 + Google Sheets 연동

## 결정사항

### 테마 시스템
- ThemeMode: `light | dark | system` — 시스템 모드는 `useColorScheme()` 활용
- 색상 토큰 30개+ 정의 (background, surface, text 3단계, income/expense, chart colors 등)
- ThemeProvider에 `initialMode` prop 추가 → 테스트에서 AsyncStorage 없이 모드 제어
- test-utils.tsx 커스텀 render로 모든 컴포넌트 테스트에 ThemeProvider 자동 래핑

### Google Sheets 연동
- DI 패턴 채택: GoogleSheetsService가 ServiceRegistry 직접 import 대신 생성자로 의존성 주입
  - 이유: ServiceRegistry ↔ GoogleSheetsService 순환 의존성 발생
- 시트 구조: SETTINGS 시트 + 월별 시트 (1월~12월)
- 가져오기 시 누락된 카테고리/서브카테고리/결제수단 자동 생성
- OAuth: expo-auth-session 사용, scheme `cloudpocket` 등록

## 트러블슈팅

### 1. 테마 적용 후 292개 테스트 실패
- **원인**: useTheme()이 ThemeProvider 밖에서 호출됨
- **해결**: test-utils.tsx에 ThemeProvider 래핑 render 함수 생성, 23개 테스트 파일 import 경로 일괄 변경

### 2. GoogleSheetsService 순환 의존성
- **원인**: GoogleSheetsService → ServiceRegistry → GoogleSheetsService
- **해결**: GoogleSheetsServiceDeps 인터페이스 도입, 생성자 DI로 전환

### 3. macOS sed \b 미지원
- **원인**: sed `\b` (word boundary)가 macOS BSD sed에서 동작하지 않음
- **해결**: Edit 도구의 replace_all 옵션으로 대체

## 미해결 사항
- C-1: Google Cloud 프로젝트 설정 (Sheets API 활성화, OAuth Client ID 발급) — 실기기 테스트 전 수동 작업
- SettingsScreen의 Google Sheets 핸들러가 placeholder (Alert "아직 구현 중입니다") — 실제 서비스 연결 필요
