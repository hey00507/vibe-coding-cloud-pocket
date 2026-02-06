# 챗 로그 - Expo SDK 54 업그레이드 및 의존성 안정화

## 논의 주제
- package.json 의존성 버전 안정화 및 npm install 정상화

## 주요 결정

### SDK 버전 선택: Expo SDK 54 (최신 안정)
- SDK 52 내에서 패치만 하는 방안 vs SDK 54로 업그레이드하는 방안 검토
- SDK 54 선택 이유:
  - 최신 안정 버전으로 장기 지원에 유리
  - `tar` 관련 보안 취약점(high severity 4건)이 SDK 52에서는 해결 불가
  - React 19 + React Native 0.81 으로 최신 생태계 활용 가능

### 의존성 버전 결정 방식
- `npx expo-doctor`와 `npx expo install --fix`를 활용하여 Expo가 권장하는 정확한 버전 확인
- react-native-screens: 최신(4.22.0) 대신 Expo 권장(~4.16.0) 사용
- react/react-dom: 19.1.4 대신 Expo 권장(19.1.0) 사용
- typescript: ~5.9.2 (Expo 54 권장 버전)

### @types/jest 버전 수정
- `^30.0.0`은 jest 29.x와 불일치 → `^29.5.14`로 수정

### @testing-library/jest-native 제거
- deprecated 패키지로, @testing-library/react-native 내장 매처로 대체

## 트러블슈팅

### react-test-renderer peer dependency 충돌
- **문제**: `react-test-renderer@19.1.4`가 `react@^19.1.4`를 요구하지만 Expo SDK 54는 `react@19.1.0`을 권장
- **해결**: `react-test-renderer`를 `19.1.0`으로 맞춤 (react 버전과 동일)
