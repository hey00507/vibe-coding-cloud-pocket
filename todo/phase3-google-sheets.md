# Phase 3: Google Sheets 연동

## 개요
기존 Excel 가계부 템플릿 스프레드시트와 **수동 백업/복원** 연동.

> **방향 전환 이력**: 초기 계획은 실시간 동기화였으나, Google Sheets API 제한(60 req/min/user)으로 인해 수동 백업/복원 방식으로 변경. (`docs/design/data-architecture.md` 참조)

### 연동 대상
- **스프레드시트 ID**: `1SVWtvuUux5WCXSS-MycaU8bzWnFHzBOy`
- **구조**: 설정 시트 + 월별 시트(1~12월) + 연간 대시보드

---

## 구현 상태

### ✅ 완료된 코드
- [x] GoogleAuthService — OAuth 2.0 + 토큰 자동 갱신
- [x] GoogleSheetsService — Sheets API 래퍼 (DI 패턴)
- [x] Export 로직 — 로컬 → Sheets (월별 시트에 거래/수입/저축 매핑)
- [x] Import 로직 — Sheets → 로컬 (카테고리/결제수단 자동 생성)
- [x] BackupRestoreSection UI 컴포넌트
- [x] 661개 테스트 통과

### 🔴 미완료 (GCP 설정)
- [ ] **C-1**: Google Cloud 프로젝트에서 Sheets API 활성화
- [ ] **C-2**: OAuth 2.0 클라이언트 ID 생성 (iOS)
- [ ] **C-3**: Expo 설정에 OAuth 정보 추가
- [ ] **C-4**: BackupRestoreSection의 placeholder Alert → 실제 서비스 호출 연결
- [ ] **C-5**: 실기기 테스트 (Google 계정으로 실제 내보내기/가져오기)
- [ ] **C-6**: 기존 스프레드시트 ID (`1SVWtvuUux5WCXSS-MycaU8bzWnFHzBOy`) 연결 확인

---

## 완료 기준

### 기능
- [ ] Google 계정으로 인증할 수 있다
- [ ] 앱 데이터를 기존 스프레드시트에 내보낼 수 있다
- [ ] 스프레드시트에서 앱으로 데이터를 가져올 수 있다
- [ ] Settings 화면에서 백업/복원 버튼이 실제 동작한다

### 품질
- [ ] 실기기에서 전체 플로우 정상 동작
- [ ] 내보내기 후 스프레드시트에서 데이터 정합성 확인
- [ ] 가져오기 후 앱에서 데이터 정합성 확인
