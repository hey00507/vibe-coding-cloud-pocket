# 데이터 아키텍처 설계

## 1. 배경

### Google Sheets를 DB로 직접 사용 시 문제점

| 제한 사항 | 값 | 영향 |
|----------|-----|------|
| 프로젝트당 읽기 요청 | 300회/분 | 동시 사용자 많으면 초과 |
| 사용자당 요청 | 60회/분 | 빠른 조작 시 초과 가능 |
| 요청 타임아웃 | 180초 | 대량 데이터 처리 시 실패 |
| 네트워크 지연 | 수백ms~수초 | UX 저하 |
| 오프라인 | 사용 불가 | 지하철 등에서 기록 불가 |

**참고**: [Google Sheets API Usage Limits](https://developers.google.com/workspace/sheets/api/limits)

### 할당량 초과 시 동작
- HTTP 429 (Too Many Requests) 에러 발생
- 1분 대기 후 재시도 필요
- 추가 비용 없음 (무료)

---

## 2. 결정된 아키텍처: Offline-First

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────┐
│              AsyncStorage (주 저장소)         │
│  - 모든 CRUD 작업은 여기서 처리               │
│  - 앱 종료해도 데이터 유지                    │
│  - 오프라인에서도 완전히 작동                 │
└─────────────────┬───────────────────────────┘
                  │
          [수동 백업/복원]
                  │
┌─────────────────▼───────────────────────────┐
│            Google Sheets (백업용)            │
│  - 내보내기: 로컬 → 시트                     │
│  - 가져오기: 시트 → 로컬                     │
│  - 기기 변경 시 데이터 이전                   │
│  - 엑셀에서 직접 대량 편집 가능               │
└─────────────────────────────────────────────┘
```

### 사용 환경
- **단일 기기** 사용 전제
- 멀티 디바이스 동기화 불필요 → 충돌 해결 로직 생략

### 각 저장소 역할

| 저장소 | 역할 | 특징 |
|--------|------|------|
| AsyncStorage | 주 저장소 | 빠름, 오프라인 작동, 앱 내부 |
| Google Sheets | 백업/복원 | 클라우드, 기기 이전, 엑셀 편집 |

---

## 3. 데이터 구조 (AsyncStorage)

```typescript
// 저장 키
const STORAGE_KEYS = {
  TRANSACTIONS: '@cloudpocket/transactions',
  CATEGORIES: '@cloudpocket/categories',
  PAYMENT_METHODS: '@cloudpocket/paymentMethods',
  SETTINGS: '@cloudpocket/settings',
  LAST_SYNC: '@cloudpocket/lastSync',
};

// 저장 형태 (JSON 문자열)
{
  "@cloudpocket/transactions": "[{...}, {...}]",
  "@cloudpocket/categories": "[{...}, {...}]",
  "@cloudpocket/paymentMethods": "[{...}, {...}]",
  "@cloudpocket/settings": "{...}",
  "@cloudpocket/lastSync": "2026-02-05T12:00:00Z"
}
```

### 용량 제한
- iOS: 제한 없음
- Android: 기본 6MB (SQLite 기반, 설정 변경 가능)

---

## 4. 서비스 레이어 변경 계획

### 현재 (Phase 1)
```
Service → 메모리 캐시 (Map)
```

### 변경 후 (Phase 2)
```
Service → AsyncStorage → 메모리 캐시 (성능 최적화)
```

### 인터페이스 유지
- `ITransactionService`, `ICategoryService`, `IPaymentMethodService` 인터페이스 그대로 유지
- 내부 구현만 AsyncStorage로 교체
- UI 코드 변경 없음

---

## 5. Google Sheets 동기화 (Phase 3)

### 동기화 모드
- **수동 동기화**: 사용자가 명시적으로 백업/복원 버튼 클릭
- 자동 동기화 없음 (API 할당량 절약)

### 시트 구조

**transactions 시트**
| id | type | amount | date | categoryId | paymentMethodId | memo |
|----|------|--------|------|------------|-----------------|------|

**categories 시트**
| id | name | type | icon | color |
|----|------|------|------|-------|

**paymentMethods 시트**
| id | name | icon |
|----|------|------|

### 동기화 기능
1. **내보내기 (Export)**: 로컬 → Google Sheets (전체 덮어쓰기)
2. **가져오기 (Import)**: Google Sheets → 로컬 (전체 덮어쓰기)
3. **주의**: 양방향 병합 없음, 단방향 전체 교체

---

## 6. TODO

### Phase 2: AsyncStorage 연동
- [ ] @react-native-async-storage/async-storage 설치
- [ ] StorageService 추상화 레이어 구현
- [ ] CategoryService AsyncStorage 연동
- [ ] PaymentMethodService AsyncStorage 연동
- [ ] TransactionService AsyncStorage 연동
- [ ] 앱 시작 시 데이터 로드
- [ ] 테스트 코드 업데이트

### Phase 3: Google Sheets 동기화
- [ ] Google OAuth 인증 구현
- [ ] Google Sheets API 연동
- [ ] 내보내기 기능
- [ ] 가져오기 기능
- [ ] 설정 화면에 백업/복원 UI 추가

---

## 7. 참고 자료

- [Google Sheets API Usage Limits](https://developers.google.com/workspace/sheets/api/limits)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Offline-First Architecture](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
