# PRD: 테마 시스템 (Phase 1.5)

> 작성일: 2026-03-13
> 상태: 🔴 미착수

---

## 1. 목표

앱 전체에 Light/Dark 테마를 적용하여 사용자 환경에 맞는 시각적 경험 제공.

### 핵심 요구사항
1. Light Mode / Dark Mode 수동 전환
2. 시스템 설정 자동 연동 옵션 (`system` 모드)
3. 테마 설정 AsyncStorage 영속화
4. 기존 18개 컴포넌트 + 4개 화면 + App.tsx 전면 적용
5. 39개 하드코딩 색상 → 테마 토큰 전환

---

## 2. 컬러 토큰 설계

### 2.1 Theme 타입

```typescript
// src/types/theme.ts

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // 기본 배경/텍스트
  background: string;        // 앱 전체 배경
  surface: string;           // 카드/섹션 배경 (한 단계 위)
  surfaceVariant: string;    // 입력 필드, 비활성 버튼 배경
  text: string;              // 주요 텍스트
  textSecondary: string;     // 보조 텍스트
  textTertiary: string;      // 약한 텍스트 (힌트, 빈 상태)
  border: string;            // 구분선, 테두리
  borderLight: string;       // 얇은 구분선 (카드 내부)
  divider: string;           // 오버레이 위 구분선

  // 시맨틱 색상
  income: string;            // 수입 (초록)
  incomeLight: string;       // 수입 연한 배경
  incomeSoft: string;        // 수입 (카드 위 연한 텍스트)
  expense: string;           // 지출 (빨강)
  expenseLight: string;      // 지출 연한 배경 (삭제 버튼 등)
  expenseSoft: string;       // 지출 (카드 위 연한 텍스트)
  warning: string;           // 경고 (주황)
  primary: string;           // 주요 액션 (파랑)
  primaryDark: string;       // 강조 파랑
  primaryLight: string;      // 연한 파랑 배경

  // 컴포넌트
  cardBackground: string;    // 카드 배경
  modalBackground: string;   // 모달 배경
  modalOverlay: string;      // 모달 오버레이
  tabBarBackground: string;  // 탭 바
  tabBarBorder: string;      // 탭 바 테두리

  // 캘린더
  todayBackground: string;   // 오늘 날짜 배경
  selectedDayBackground: string; // 선택 날짜 배경

  // 저축/자산
  savingsBackground: string; // 저축 카드 배경
  savingsText: string;       // 저축 강조 텍스트
  savingsTitle: string;      // 저축 타이틀

  // 차트
  chartColors: string[];     // 차트 색상 팔레트 (10색)
}

export interface Theme {
  mode: 'light' | 'dark';
  colors: ThemeColors;
}
```

### 2.2 컬러 팔레트 매핑

| 토큰 | Light | Dark | 현재 하드코딩 |
|------|-------|------|-------------|
| `background` | `#FFFFFF` | `#121212` | `#FFFFFF`, `#F5F5F5` (container) |
| `surface` | `#F5F5F5` | `#1E1E1E` | `#F5F5F5` |
| `surfaceVariant` | `#FAFAFA` | `#2C2C2C` | `#FAFAFA`, `#F0F0F0` |
| `text` | `#333333` | `#FFFFFF` | `#333`, `#212121`, `#000` |
| `textSecondary` | `#666666` | `#B0B0B0` | `#666`, `#555` |
| `textTertiary` | `#999999` | `#777777` | `#999`, `#BBB` |
| `border` | `#E0E0E0` | `#333333` | `#E0E0E0` |
| `borderLight` | `#F0F0F0` | `#2A2A2A` | `#F0F0F0`, `#EEE` |
| `divider` | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.2)` |
| `income` | `#4CAF50` | `#81C784` | `#4CAF50` |
| `incomeLight` | `#E8F5E9` | `#1B3A1B` | `#E8F5E9` |
| `incomeSoft` | `#A5D6A7` | `#66BB6A` | `#A5D6A7` |
| `expense` | `#F44336` | `#E57373` | `#F44336` |
| `expenseLight` | `#FFEBEE` | `#3A1B1B` | `#FFEBEE` |
| `expenseSoft` | `#FFCDD2` | `#EF9A9A` | `#FFCDD2` |
| `warning` | `#FF9800` | `#FFB74D` | `#FF9800` |
| `primary` | `#2196F3` | `#64B5F6` | `#2196F3` |
| `primaryDark` | `#1565C0` | `#42A5F5` | `#1565C0` |
| `primaryLight` | `#E3F2FD` | `#1A3A5C` | `#E3F2FD`, `#BBDEFB` |
| `cardBackground` | `#FFFFFF` | `#1E1E1E` | `#FFF`, `#fff` |
| `modalBackground` | `#FFFFFF` | `#2C2C2C` | `#FFF` (모달) |
| `modalOverlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` |
| `tabBarBackground` | `#FFFFFF` | `#1E1E1E` | App.tsx |
| `tabBarBorder` | `#E0E0E0` | `#333333` | App.tsx |
| `todayBackground` | `#2196F3` | `#1565C0` | `#2196F3` (DayCell) |
| `selectedDayBackground` | `#E3F2FD` | `#1A3A5C` | `#BBDEFB` (DayCell) |
| `savingsBackground` | `#E8F5E9` | `#1B3A1B` | `#E8F5E9` |
| `savingsText` | `#2E7D32` | `#81C784` | `#2E7D32` |
| `savingsTitle` | `#388E3C` | `#66BB6A` | `#388E3C` |
| `chartColors` | (아래 참조) | (아래 참조) | StatisticsScreen CHART_COLORS |

**차트 색상 팔레트:**
```
Light: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF','#FF9F40','#FF8A80','#7BC8A4','#B39DDB','#38E0DE']
Dark:  ['#FF7997','#5BB8F5','#FFD97A','#6DD4D4','#B08AFF','#FFB566','#FFA099','#8FD9B5','#C4B2E6','#5EEAE8']
```

---

## 3. 아키텍처

### 3.1 파일 구조

```
신규 파일:
  src/types/theme.ts                    # 타입 정의
  src/constants/theme.ts                # lightTheme, darkTheme 객체
  src/controllers/ThemeContext.tsx       # ThemeProvider + Context
  src/controllers/useTheme.ts           # useTheme 훅
  __tests__/controllers/ThemeContext.test.tsx  # 테스트

수정 파일:
  src/constants/storageKeys.ts          # themeMode 키 추가
  src/services/AppInitializer.ts        # 테마 초기 로드 (optional)
  App.tsx                               # ThemeProvider 래핑 + 네비게이션 테마
  src/views/screens/*.tsx               # 4개 화면
  src/views/components/*.tsx            # 18개 컴포넌트
```

### 3.2 ThemeContext API

```typescript
interface ThemeContextValue {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}
```

### 3.3 데이터 흐름

```
앱 시작
  → AsyncStorage.getItem('@cloudpocket/themeMode')
  → themeMode 결정 ('light' | 'dark' | 'system', 기본값: 'system')
  → system인 경우 useColorScheme() 값 사용
  → Theme 객체 생성 (lightTheme 또는 darkTheme)
  → ThemeProvider로 전달

테마 변경
  → setThemeMode(newMode) 호출
  → AsyncStorage.setItem('@cloudpocket/themeMode', newMode)
  → 상태 업데이트 → 리렌더
```

---

## 4. 구현 단계 (Step-by-Step)

---

### Step 1: 타입 정의

**파일:** `src/types/theme.ts` (신규)

**작업 내용:**
1. `ThemeMode` 타입 정의: `'light' | 'dark' | 'system'`
2. `ThemeColors` 인터페이스 정의: 섹션 2.1의 전체 토큰
3. `Theme` 인터페이스 정의: `{ mode, colors }`
4. 모든 타입 export

**테스트:** 타입 파일이므로 컴파일 확인만 (`npm run lint`)

**완료 기준:**
- [ ] `src/types/theme.ts` 생성
- [ ] TypeScript 컴파일 에러 없음

---

### Step 2: 테마 상수 정의

**파일:** `src/constants/theme.ts` (신규)

**작업 내용:**
1. `lightTheme: Theme` 객체 — 섹션 2.2 Light 컬럼 값 사용
2. `darkTheme: Theme` 객체 — 섹션 2.2 Dark 컬럼 값 사용
3. `chartColors` 배열 Light/Dark 분리

**구현 코드 (골격):**
```typescript
import { Theme } from '../types/theme';

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    // ... 섹션 2.2 전체 매핑
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    // ... 섹션 2.2 전체 매핑
  },
};
```

**테스트:** 컴파일 확인 + 각 테마 객체의 모든 키 존재 여부

**완료 기준:**
- [ ] `src/constants/theme.ts` 생성
- [ ] lightTheme, darkTheme 모든 토큰 값 채움
- [ ] TypeScript 컴파일 에러 없음

---

### Step 3: StorageKey 추가

**파일:** `src/constants/storageKeys.ts` (수정)

**작업 내용:**
1. `THEME_MODE: '@cloudpocket/themeMode'` 키 추가

**변경량:** 1줄 추가

**완료 기준:**
- [ ] storageKeys에 THEME_MODE 추가
- [ ] 기존 테스트 통과 확인

---

### Step 4: ThemeContext + ThemeProvider 구현

**파일:** `src/controllers/ThemeContext.tsx` (신규)

**작업 내용:**
1. `ThemeContext` 생성 (`createContext`)
2. `ThemeProvider` 컴포넌트:
   - `useState<ThemeMode>` — 기본값 `'system'`
   - `useColorScheme()` — 시스템 테마 감지
   - `useEffect` — 마운트 시 AsyncStorage에서 themeMode 로드
   - `setThemeMode` — 상태 변경 + AsyncStorage 저장
   - `useMemo` — resolvedTheme 계산 (system일 때 시스템 값 적용)
   - `useMemo` — contextValue 메모이제이션
3. children 래핑

**상세 로직:**
```typescript
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null

  // 1. 마운트 시 저장된 테마 로드
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // 2. 테마 변경 핸들러
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  }, []);

  // 3. 실제 적용 테마 계산
  const resolvedMode = themeMode === 'system'
    ? (systemScheme ?? 'light')
    : themeMode;

  const theme = useMemo(
    () => resolvedMode === 'dark' ? darkTheme : lightTheme,
    [resolvedMode]
  );

  const isDark = resolvedMode === 'dark';

  const value = useMemo(
    () => ({ theme, themeMode, setThemeMode, isDark }),
    [theme, themeMode, setThemeMode, isDark]
  );

  if (!isLoaded) return null; // 또는 로딩 스피너

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**완료 기준:**
- [ ] ThemeContext, ThemeProvider 구현
- [ ] isLoaded 로딩 상태 처리
- [ ] useMemo로 불필요한 리렌더 방지

---

### Step 5: useTheme 훅

**파일:** `src/controllers/useTheme.ts` (신규)

**작업 내용:**
```typescript
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**완료 기준:**
- [ ] useTheme 훅 구현
- [ ] Context 없을 때 에러 throw

---

### Step 6: ThemeContext 테스트

**파일:** `__tests__/controllers/ThemeContext.test.tsx` (신규)

**테스트 케이스:**

| # | 테스트명 | 검증 내용 |
|---|---------|----------|
| 1 | 기본 테마는 system 모드 | `themeMode === 'system'` |
| 2 | light 모드 설정 시 lightTheme 적용 | `theme.mode === 'light'`, 색상 확인 |
| 3 | dark 모드 설정 시 darkTheme 적용 | `theme.mode === 'dark'`, 색상 확인 |
| 4 | setThemeMode로 모드 전환 | light → dark 전환 후 theme.colors 변경 |
| 5 | AsyncStorage에 테마 저장 | setThemeMode 후 AsyncStorage.setItem 호출 확인 |
| 6 | 앱 시작 시 저장된 테마 로드 | AsyncStorage에 'dark' 저장 → 마운트 시 dark 적용 |
| 7 | system 모드에서 시스템 dark일 때 | useColorScheme='dark' → darkTheme 적용 |
| 8 | system 모드에서 시스템 light일 때 | useColorScheme='light' → lightTheme 적용 |
| 9 | isDark 플래그 정확성 | dark 모드일 때 true, light일 때 false |
| 10 | ThemeProvider 없이 useTheme 호출 시 에러 | Error throw 확인 |

**완료 기준:**
- [ ] 10개 테스트 케이스 작성 및 통과
- [ ] AsyncStorage mock 사용

---

### Step 7: App.tsx 통합

**파일:** `App.tsx` (수정)

**작업 내용:**

1. **ThemeProvider로 앱 래핑:**
```tsx
// Before
<NavigationContainer>
  <Tab.Navigator>...</Tab.Navigator>
</NavigationContainer>

// After
<ThemeProvider>
  <AppContent />
</ThemeProvider>
```

2. **AppContent 분리** (ThemeProvider 안에서 useTheme 사용하기 위해):
```tsx
function AppContent() {
  const { theme, isDark } = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.cardBackground,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
    fonts: DefaultTheme.fonts, // React Navigation 기본 폰트
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.tabBarBorder,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          headerStyle: {
            backgroundColor: theme.colors.cardBackground,
          },
          headerTintColor: theme.colors.text,
        }}
      >
        ...
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

3. **기존 로딩 스피너 색상 변경:**
   - `#FFFFFF` → ThemeProvider 로딩이 먼저 처리되므로 AppInitializer 로딩과 조율

**교체 대상 (하드코딩 색상):**
| 기존 | 토큰 | 위치 |
|------|------|------|
| `#FFFFFF` (loadingContainer) | `background` | ActivityIndicator 래퍼 |
| `#2196F3` (tabBarActiveTintColor) | `primary` | Tab.Navigator |
| `#999` (tabBarInactiveTintColor) | `textSecondary` | Tab.Navigator |

**완료 기준:**
- [ ] ThemeProvider 래핑
- [ ] AppContent 분리
- [ ] NavigationContainer theme 연동
- [ ] Tab.Navigator 스타일 테마 적용
- [ ] 기존 기능 정상 동작 확인

---

### Step 8: HomeScreen 테마 적용

**파일:** `src/views/screens/HomeScreen.tsx` (수정)

**변경 방식:** `const { theme } = useTheme();` 추가 후 스타일 오버라이드

**교체 대상 (14개 색상):**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#F5F5F5` | `surface` |
| `filterButton` | backgroundColor | `#E0E0E0` | `border` |
| `filterButtonActive` | backgroundColor | `#2196F3` | `primary` |
| `filterText` | color | `#666` | `textSecondary` |
| `filterTextActive` | color | `#FFF` | `cardBackground` |
| `emptyText` | color | `#999` | `textTertiary` |
| `emptySubtext` | color | `#BBB` | `textTertiary` |
| `monthlySummary` | backgroundColor | `#fff` | `cardBackground` |
| `balanceRow` | borderTopColor | `#eee` | `borderLight` |
| `summaryLabel` | color | `#666` | `textSecondary` |
| `incomeText` | color | `#4CAF50` | `income` |
| `expenseText` | color | `#F44336` | `expense` |

**적용 패턴:**
```tsx
export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { theme } = useTheme();
  // ...
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 필터 버튼 */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: theme.colors.border },
          filter === type && { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text style={[
          styles.filterText,
          { color: theme.colors.textSecondary },
          filter === type && { color: '#FFF' },
        ]}>
      </TouchableOpacity>
      {/* ... */}
    </View>
  );
}
```

**완료 기준:**
- [ ] useTheme 훅 연결
- [ ] 14개 하드코딩 색상 → 테마 토큰
- [ ] 리스트 뷰 정상 렌더링
- [ ] 캘린더 뷰 정상 렌더링
- [ ] 기존 테스트 통과

---

### Step 9: AddTransactionScreen 테마 적용

**파일:** `src/views/screens/AddTransactionScreen.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#F5F5F5` | `surface` |
| `formCard` | backgroundColor | `#FFF` | `cardBackground` |
| `label` | color | `#333` | `text` |
| `input` | backgroundColor | `#F5F5F5` | `surfaceVariant` |
| `input` | borderColor | `#E0E0E0` | `border` |
| `input` | color | `#333` | `text` |
| `typeButton` (income active) | backgroundColor | `#4CAF50` | `income` |
| `typeButton` (expense active) | backgroundColor | `#F44336` | `expense` |
| `typeButton` (inactive) | backgroundColor | `#E0E0E0` | `border` |
| `typeButtonText` | color | `#666` | `textSecondary` |
| `submitButton` | backgroundColor | `#2196F3` | `primary` |
| `submitButtonDisabled` | backgroundColor | `#E0E0E0` | `border` |
| `picker/select` 관련 | borderColor | `#E0E0E0` | `border` |
| `picker/select` 관련 | color | `#333` / `#666` | `text` / `textSecondary` |

**완료 기준:**
- [ ] useTheme 훅 연결
- [ ] 모든 하드코딩 색상 → 테마 토큰
- [ ] 수입/지출 토글 색상 정상
- [ ] 기존 테스트 통과

---

### Step 10: StatisticsScreen 테마 적용

**파일:** `src/views/screens/StatisticsScreen.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#F5F5F5` | `surface` |
| `sectionTitle` | color | `#333` | `text` |
| `CHART_COLORS` 배열 | - | 10색 하드코딩 | `chartColors` |
| 텍스트 전반 | color | `#333`, `#666` | `text`, `textSecondary` |
| 카드 배경 | backgroundColor | `#FFF` | `cardBackground` |

**특이사항:** CHART_COLORS를 `theme.colors.chartColors`로 교체. 차트 컴포넌트(DonutChart, GroupedBarChart)에 props로 전달.

**완료 기준:**
- [ ] useTheme 훅 연결
- [ ] CHART_COLORS → theme.colors.chartColors
- [ ] 차트 렌더링 정상
- [ ] 기존 테스트 통과

---

### Step 11: SettingsScreen 테마 적용 + 테마 설정 UI

**파일:** `src/views/screens/SettingsScreen.tsx` (수정)

**Part A — 기존 색상 교체:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#F5F5F5` | `surface` |
| `tabButton` | backgroundColor | `#E0E0E0` | `border` |
| `tabButtonActive` | backgroundColor | `#2196F3` | `primary` |
| `tabButtonText` | color | `#666` | `textSecondary` |
| `tabButtonTextActive` | color | `#FFF` | (white 유지) |
| `modalOverlay` | backgroundColor | `rgba(0,0,0,0.5)` | `modalOverlay` |
| `modalContent` | backgroundColor | `#FFF` | `modalBackground` |
| `modalTitle` | color | `#333` | `text` |
| `input` | borderColor | `#E0E0E0` | `border` |
| `deleteButton` | backgroundColor | `#FFEBEE` | `expenseLight` |
| `deleteButton` | color | `#F44336` | `expense` |
| `addButton` | backgroundColor | `#2196F3` | `primary` |
| `emptyText` | color | `#999` | `textTertiary` |
| `iconOptionActive` | backgroundColor | `#E3F2FD` | `primaryLight` |
| `iconOptionActive` | borderColor | `#2196F3` | `primary` |

**Part B — 테마 설정 UI 추가:**

기존 탭 버튼(카테고리/결제수단) 위에 테마 선택 섹션 추가:

```
┌────────────────────────────────────┐
│  테마 설정                          │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │☀ 라이트│ │🌙 다크 │ │📱 시스템│       │
│  └──────┘ └──────┘ └──────┘       │
├────────────────────────────────────┤
│  [카테고리] [결제수단]              │
│  ...기존 콘텐츠...                  │
└────────────────────────────────────┘
```

**구현:**
```tsx
const { theme, themeMode, setThemeMode } = useTheme();

// 테마 선택 섹션
<View style={[styles.themeSection, { backgroundColor: theme.colors.cardBackground }]}>
  <Text style={[styles.themeSectionTitle, { color: theme.colors.text }]}>
    테마 설정
  </Text>
  <View style={styles.themeButtons}>
    {([
      { mode: 'light', label: '☀ 라이트' },
      { mode: 'dark', label: '🌙 다크' },
      { mode: 'system', label: '📱 시스템' },
    ] as const).map(({ mode, label }) => (
      <TouchableOpacity
        key={mode}
        style={[
          styles.themeButton,
          { borderColor: theme.colors.border },
          themeMode === mode && {
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.primary,
          },
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <Text style={[
          styles.themeButtonText,
          { color: theme.colors.textSecondary },
          themeMode === mode && { color: theme.colors.primary },
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

**신규 스타일:**
```typescript
themeSection: {
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 8,
  padding: 16,
  borderRadius: 12,
},
themeSectionTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 12,
},
themeButtons: {
  flexDirection: 'row',
  gap: 8,
},
themeButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 8,
  borderWidth: 1.5,
  alignItems: 'center',
},
themeButtonText: {
  fontSize: 13,
  fontWeight: '500',
},
```

**완료 기준:**
- [ ] 기존 색상 전부 테마 토큰으로 교체
- [ ] 테마 선택 UI 추가 (라이트/다크/시스템 3버튼)
- [ ] 버튼 누르면 즉시 테마 전환
- [ ] 기존 테스트 통과

---

### Step 12: ViewToggle 테마 적용

**파일:** `src/views/components/ViewToggle.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#E0E0E0` | `border` |
| `activeButton` | backgroundColor | `#FFF` | `cardBackground` |
| `activeText` | color | `#000` | `text` |
| `inactiveText` | color | `#666` | `textSecondary` |

**완료 기준:**
- [ ] 4개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 13: CalendarHeader 테마 적용

**파일:** `src/views/components/CalendarHeader.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `title` | color | `#333` | `text` |
| `navButton/navText` | color | `#2196F3` | `primary` |
| `navText` (disabled) | color | `#666` | `textSecondary` |

**완료 기준:**
- [ ] 3개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 14: CalendarGrid 테마 적용

**파일:** `src/views/components/CalendarGrid.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `weekdayText` | color | `#666` | `textSecondary` |
| `grid` | borderColor | `#F0F0F0` | `borderLight` |

**완료 기준:**
- [ ] 3개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 15: DayCell 테마 적용

**파일:** `src/views/components/DayCell.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `dayText` | color | `#333` | `text` |
| `todayCell` | backgroundColor | `#E3F2FD` | `todayBackground` |
| `todayText` | color | `#2196F3` | `primary` |
| `selectedCell` | backgroundColor | `#BBDEFB` | `selectedDayBackground` |
| `incomeText` | color | `#4CAF50` | `income` |
| `expenseText` | color | `#F44336` | `expense` |
| `emptyCell` | (투명) | - | - |

**완료 기준:**
- [ ] 6개 색상 교체
- [ ] 오늘/선택/일반 날짜 구분 정상
- [ ] 기존 테스트 통과

---

### Step 16: DayDetailModal 테마 적용

**파일:** `src/views/components/DayDetailModal.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `overlay` | backgroundColor | `rgba(0,0,0,0.5)` | `modalOverlay` |
| `modal` | backgroundColor | `#FFF` | `modalBackground` |
| `title` | color | `#333` | `text` |
| `closeButton` | color | `#666` | `textSecondary` |
| `categoryName` | color | `#333` | `text` |
| `paymentMethod` | color | `#666` | `textSecondary` |
| `memo` | color | `#999` | `textTertiary` |
| `incomeAmount` | color | `#4CAF50` | `income` |
| `expenseAmount` | color | `#F44336` | `expense` |
| `divider` | borderColor | `#F0F0F0` | `borderLight` |
| `summaryDivider` | borderColor | `#EEE` | `borderLight` |

**완료 기준:**
- [ ] 11개 색상 교체
- [ ] 모달 열기/닫기 정상
- [ ] 기존 테스트 통과

---

### Step 17: TransactionItem 테마 적용

**파일:** `src/views/components/TransactionItem.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `categoryName` | color | `#333` | `text` |
| `paymentMethod` | color | `#666` | `textSecondary` |
| `memo` | color | `#999` | `textTertiary` |
| `incomeAmount` | color | `#4CAF50` | `income` |
| `expenseAmount` | color | `#F44336` | `expense` |

**완료 기준:**
- [ ] 6개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 18: SummaryCard 테마 적용

**파일:** `src/views/components/SummaryCard.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#2196F3` | `primary` |
| `balanceLabel` | color | `rgba(255,255,255,0.8)` | `divider` 계열 (white 유지) |
| `balanceAmount` | color | `#FFF` | (white 유지, 그라데이션 카드) |
| `detailLabel` | color | `rgba(255,255,255,0.8)` | (white 유지) |
| `incomeAmount` | color | `#A5D6A7` | `incomeSoft` |
| `expenseAmount` | color | `#FFCDD2` | `expenseSoft` |
| `savingsAmount` | color | `#90CAF9` | (primary 카드 위 연한 파랑) |
| `divider` | backgroundColor | `rgba(255,255,255,0.2)` | `divider` |

**특이사항:** SummaryCard는 `primary` 색상 배경 위에 흰색 텍스트를 사용하는 특수 카드. Dark 모드에서도 이 패턴은 유지하되 `primary` 값만 다크 팔레트로 변경.

**완료 기준:**
- [ ] container 배경 → theme.colors.primary
- [ ] 카드 위 텍스트 색상 조정
- [ ] 기존 테스트 통과

---

### Step 19: DateSelector 테마 적용

**파일:** `src/views/components/DateSelector.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `button` | borderColor | `#E0E0E0` | `border` |
| `button` | backgroundColor | `#FFF` | `cardBackground` |
| `dateText` | color | `#333` | `text` |
| `label` | color | `#666` | `textSecondary` |
| `activeButton` | borderColor | `#2196F3` | `primary` |

**완료 기준:**
- [ ] 5개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 20: PeriodSelector 테마 적용

**파일:** `src/views/components/PeriodSelector.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `tabButton` | backgroundColor | `#E0E0E0` | `border` |
| `tabButtonActive` | backgroundColor | `#2196F3` | `primary` |
| `navText` | color | `#2196F3` | `primary` |
| `periodText` | color | `#333` | `text` |
| `inactiveText` | color | `#666` | `textSecondary` |

**완료 기준:**
- [ ] 6개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 21: DonutChart 테마 적용

**파일:** `src/views/components/DonutChart.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| 중앙 텍스트 | color | `#333` | `text` |
| 중앙 서브텍스트 | color | `#666` | `textSecondary` |
| 차트 배경 원 | stroke | `#F0F0F0` | `borderLight` |
| 범례 텍스트 | color | `#333` | `text` |
| 범례 퍼센트 | color | `#999` | `textTertiary` |

**추가:** `colors` prop 추가하여 외부에서 `theme.colors.chartColors` 주입 가능하게.

**완료 기준:**
- [ ] 5개+ 색상 교체
- [ ] colors prop 추가
- [ ] 기존 테스트 통과

---

### Step 22: GroupedBarChart 테마 적용

**파일:** `src/views/components/GroupedBarChart.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| Y축 텍스트 | fill/color | `#666` | `textSecondary` |
| X축 라벨 | fill/color | `#666` | `textSecondary` |
| 그리드 선 | stroke | `#F0F0F0` | `borderLight` |
| 수입 바 | fill | `#4CAF50` | `income` |
| 지출 바 | fill | `#F44336` | `expense` |
| 범례 텍스트 | color | `#333` | `text` |
| 범례 배경 | backgroundColor | `#FFF` | `cardBackground` |

**완료 기준:**
- [ ] 7개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 23: BreakdownList 테마 적용

**파일:** `src/views/components/BreakdownList.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `title` | color | `#333` | `text` |
| `itemName` | color | `#333` | `text` |
| `itemAmount` | color | `#333` | `text` |
| `itemPercentage` | color | `#666` | `textSecondary` |
| `progressBarBg` | backgroundColor | `#F0F0F0` | `borderLight` |
| `progressBarFill` | backgroundColor | `#2196F3` | `primary` |

**완료 기준:**
- [ ] 7개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 24: IncomeSummaryCard 테마 적용

**파일:** `src/views/components/IncomeSummaryCard.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `label` | color | `#333` | `text` |
| `value` | color | `#333` | `text` |
| `subLabel` | color | `#999` | `textTertiary` |
| `divider` | borderColor | `#E0E0E0` | `border` |
| `incomeValue` | color | `#4CAF50` | `income` |
| `warningValue` | color | `#FF9800` | `warning` |

**완료 기준:**
- [ ] 7개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 25: AnnualDashboard 테마 적용

**파일:** `src/views/components/AnnualDashboard.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#F5F5F5` | `surface` |
| `card` | backgroundColor | `#FFF` | `cardBackground` |
| `title` | color | `#333` | `text` |
| `headerCell` | color | `#555` | `textSecondary` |
| `dataCell` | color | `#333` | `text` |
| `totalCell` | backgroundColor | `#FAFAFA` | `surfaceVariant` |
| `incomeText` | color | `#4CAF50` | `income` |
| `expenseText` | color | `#F44336` | `expense` |
| `warningText` | color | `#FF9800` | `warning` |
| `border` | borderColor | `#E0E0E0` | `border` |
| `gridLine` | borderColor | `#F0F0F0` | `borderLight` |

**완료 기준:**
- [ ] 11개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 26: AssetOverview 테마 적용

**파일:** `src/views/components/AssetOverview.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `title` | color | `#333` | `text` |
| `totalAmount` | color | `#1565C0` | `primaryDark` |
| `bankName` | color | `#333` | `text` |
| `purpose` | color | `#666` | `textSecondary` |
| `tierLabel` | color | `#555` | `textSecondary` |
| `balance` | color | `#333` | `text` |
| `inactiveRow` | backgroundColor | `#F5F5F5` | `surface` |
| `divider` | borderColor | `#F0F0F0` | `borderLight` |

**완료 기준:**
- [ ] 9개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 27: SavingsProductItem 테마 적용

**파일:** `src/views/components/SavingsProductItem.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `name` | color | `#333` | `text` |
| `bank` | color | `#666` | `textSecondary` |
| `amount` | color | `#2196F3` | `primary` |
| `statusActive` | color | `#4CAF50` | `income` |
| `statusPending` | color | `#FF9800` | `warning` |
| `deleteButton` | backgroundColor | `#FFEBEE` | `expenseLight` |
| `deleteButtonText` | color | `#F44336` | `expense` |
| `progressBg` | backgroundColor | `#F0F0F0` | `borderLight` |

**완료 기준:**
- [ ] 9개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 28: SavingsSummaryCard 테마 적용

**파일:** `src/views/components/SavingsSummaryCard.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#E8F5E9` | `savingsBackground` |
| `title` | color | `#388E3C` | `savingsTitle` |
| `mainValue` | color | `#2E7D32` | `savingsText` |
| `label` | color | `#666` | `textSecondary` |
| `value` | color | `#333` | `text` |

**완료 기준:**
- [ ] 5개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 29: CategoryGroupItem 테마 적용

**파일:** `src/views/components/CategoryGroupItem.tsx` (수정)

**교체 대상:**

| 스타일명 | 속성 | 기존값 | 테마 토큰 |
|---------|------|--------|----------|
| `container` | backgroundColor | `#FFF` | `cardBackground` |
| `categoryName` | color | `#333` | `text` |
| `subCategoryName` | color | `#666` | `textSecondary` |
| `count` | color | `#999` | `textTertiary` |
| `deleteButton` | backgroundColor | `#FFEBEE` | `expenseLight` |
| `deleteButtonText` | color | `#F44336` | `expense` |
| `editButton` | borderColor | `#2196F3` | `primary` |
| `editButtonText` | color | `#2196F3` | `primary` |
| `divider` | borderColor | `#F0F0F0` | `borderLight` |

**완료 기준:**
- [ ] 9개 색상 교체
- [ ] 기존 테스트 통과

---

### Step 30: 전체 테스트 실행 및 검증

**작업 내용:**
1. `npm test` — 기존 612개 + 신규 테마 테스트 전체 통과 확인
2. `npm run lint` — ESLint 에러 없음 확인
3. `npm run test:coverage` — 커버리지 유지 확인 (95%+)

**검증 체크리스트:**
- [ ] 전체 테스트 통과
- [ ] ESLint 에러 없음
- [ ] 커버리지 95% 이상 유지
- [ ] Light 모드: 기존과 동일한 외관
- [ ] Dark 모드: 모든 텍스트 가독성 확인
- [ ] System 모드: OS 설정 변경 시 반영
- [ ] 앱 재시작 후 테마 유지

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] Light/Dark 모드 간 수동 전환 가능
- [ ] 시스템 테마 변경 시 자동 반영 (`system` 모드)
- [ ] 앱 재시작 후 마지막 선택 테마 유지 (AsyncStorage)
- [ ] 모든 화면/컴포넌트에서 하드코딩 색상 **0개**
- [ ] 기존 테스트 612개 전체 통과
- [ ] 신규 ThemeContext 테스트 10개+ 통과
- [ ] 커버리지 95% 이상 유지

---

## 6. 커밋 계획

| 순서 | 범위 | 커밋 메시지 |
|------|------|-----------|
| 1 | Step 1~3 | `Feat: 테마 타입 및 상수 정의` |
| 2 | Step 4~6 | `Feat: ThemeContext, useTheme 훅 및 테스트` |
| 3 | Step 7 | `Feat: App.tsx ThemeProvider 통합` |
| 4 | Step 8~11 | `Feat: 4개 화면 테마 적용 및 설정 UI` |
| 5 | Step 12~18 | `Feat: 캘린더/거래/요약 컴포넌트 테마 적용` |
| 6 | Step 19~23 | `Feat: 차트/선택기 컴포넌트 테마 적용` |
| 7 | Step 24~29 | `Feat: 자산/저축/설정 컴포넌트 테마 적용` |
| 8 | Step 30 | `Test: 전체 테스트 통과 및 커버리지 확인` |
| 9 | 문서 | `Docs: 테마 시스템 작업 로그` |
