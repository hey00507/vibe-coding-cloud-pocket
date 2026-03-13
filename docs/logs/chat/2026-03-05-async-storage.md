# AsyncStorage 연동 구현

## 논의 주제
- AsyncStorage를 활용한 데이터 영속성 확보
- 기존 메모리 기반 서비스를 Write-Through Cache 패턴으로 전환

## 주요 결정

### 1. Write-Through Cache 아키텍처
- **읽기**: 기존과 동일 (동기, Map에서 읽기)
- **쓰기**: Map 변경 후 AsyncStorage에 fire-and-forget 저장
- **이유**: UI 코드 변경 없이 영속성 확보, 기존 528개 테스트 무영향

### 2. hydrate/persist 패턴
- `hydrate(storageService, storageKey, idCounterKey)`: 앱 시작 시 AsyncStorage → Map 복원
- `persist()`: create/update/delete 후 자동 호출
- `storageService`가 null이면 persist()는 no-op → 기존 테스트 호환

### 3. Date 필드 자동 복원
- JSON.parse 후 문자열로 남는 Date 필드를 `new Date()`로 변환
- TransactionService: `date` 필드
- SavingsService: `startDate`, `endDate` 필드

### 4. AppInitializer 초기화 순서
1. SeedService hydrate (seeded 플래그 복원)
2. 7개 서비스 병렬 hydrate (`Promise.all`)
3. 미시딩 시 `seedAll()` 실행

### 5. 에러 처리
- StorageService에서 에러 발생 시 console.error 로깅만 하고 throw하지 않음
- 앱이 에러로 크래시하지 않도록 graceful degradation

## 트러블슈팅
- 특이 이슈 없음. jest.setup.js의 AsyncStorage mock 주석 해제와 transformIgnorePatterns 업데이트로 테스트 환경 완성
