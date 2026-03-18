import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG } from '../../constants/googleSheets';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Category,
  SubCategory,
  PaymentMethod,
  Budget,
  SavingsProduct,
  BankAccount,
  IncomeTarget,
  TransactionType,
  SavingsProductStatus,
  BankTier,
  CreateCategoryInput,
  CreateSubCategoryInput,
  CreatePaymentMethodInput,
  PaymentMethodType,
} from '../../types';
import {
  categoryService,
  paymentMethodService,
  subCategoryService,
  budgetService,
  savingsService,
  bankAccountService,
  incomeTargetService,
  googleAuthService,
  googleSheetsService,
} from '../../services/ServiceRegistry';
import CategoryGroupItem from '../components/CategoryGroupItem';
import BackupRestoreSection from '../components/BackupRestoreSection';
import { useTheme } from '../../controllers/useTheme';
import { ThemeMode } from '../../types/theme';
import { SyncResult } from '../../types/googleSheets';

type TabType = 'category' | 'paymentMethod' | 'budget' | 'asset';
type AssetSubTab = 'savings' | 'bank' | 'incomeTarget';

const CATEGORY_ICONS = ['🍔', '🚗', '🏠', '💡', '🎮', '👕', '💊', '📚', '✈️', '💰', '💼', '🎁'];
const SUB_CATEGORY_ICONS = ['📋', '🛒', '🍽️', '☕', '🛵', '🚌', '🚕', '⛽', '🧻', '🏥', '🎬', '🎨', '🎓', '💐', '🐾', '🦴'];
const PAYMENT_ICONS = ['💳', '💵', '🏦', '📱', '💰', '🪙', '💸', '🏧'];

const PAYMENT_TYPE_OPTIONS: { label: string; value: PaymentMethodType }[] = [
  { label: '신용카드', value: 'credit' },
  { label: '체크카드', value: 'debit' },
  { label: '현금', value: 'cash' },
  { label: '계좌이체', value: 'account' },
];

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: '라이트', value: 'light', icon: '☀️' },
  { label: '다크', value: 'dark', icon: '🌙' },
  { label: '시스템', value: 'system', icon: '📱' },
];

WebBrowser.maybeCompleteAuthSession();

// iOS client ID의 reversed scheme → Google이 여기로 redirect
const IOS_REDIRECT_URI = `com.googleusercontent.apps.${GOOGLE_CONFIG.IOS_CLIENT_ID.split('.apps.')[0]}:/oauthredirect`;

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  // Google Sheets 백업 상태
  const [gsIsSignedIn, setGsIsSignedIn] = useState(false);
  const [gsLastSync, setGsLastSync] = useState<Date | null>(null);
  const [gsSpreadsheetId, setGsSpreadsheetId] = useState('');

  // 초기화: 저장된 인증/동기화 상태 복원
  useEffect(() => {
    const initGoogleSheets = async () => {
      await googleAuthService.hydrate();
      await googleSheetsService.initialize();
      setGsIsSignedIn(googleAuthService.isSignedIn());
      setGsLastSync(googleSheetsService.getLastSyncTime());
      setGsSpreadsheetId(googleSheetsService.getSpreadsheetId() || '');
    };
    initGoogleSheets();
  }, []);

  const handleGsSignIn = useCallback(async () => {
    try {
      const authUrl =
        'https://accounts.google.com/o/oauth2/v2/auth' +
        `?client_id=${GOOGLE_CONFIG.IOS_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(IOS_REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(GOOGLE_CONFIG.SCOPES.join(' '))}` +
        `&access_type=offline`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, IOS_REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        const urlParts = result.url.split('?');
        const params = new URLSearchParams(urlParts[1] || '');
        const code = params.get('code');

        if (code) {
          await googleAuthService.signInWithIOS(code, IOS_REDIRECT_URI);
          setGsIsSignedIn(true);
        } else {
          Alert.alert('로그인 실패', '인증 코드를 받지 못했습니다');
        }
      }
    } catch (error) {
      Alert.alert('로그인 실패', error instanceof Error ? error.message : '알 수 없는 오류');
    }
  }, []);

  const handleGsSignOut = useCallback(async () => {
    await googleAuthService.signOut();
    setGsIsSignedIn(false);
    setGsLastSync(null);
  }, []);

  const handleGsExport = useCallback(async (): Promise<SyncResult> => {
    const result = await googleSheetsService.exportAll();
    if (result.status === 'success') {
      setGsLastSync(googleSheetsService.getLastSyncTime());
    }
    return result;
  }, []);

  const handleGsImport = useCallback(async (): Promise<SyncResult> => {
    const result = await googleSheetsService.importAll();
    if (result.status === 'success') {
      setGsLastSync(googleSheetsService.getLastSyncTime());
    }
    return result;
  }, []);

  const handleGsSpreadsheetIdChange = useCallback(async (id: string) => {
    await googleSheetsService.setSpreadsheetId(id);
    setGsSpreadsheetId(id);
  }, []);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>('category');

  // 카테고리 상태
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');

  // 소분류 상태
  const [subCategoriesMap, setSubCategoriesMap] = useState<Map<string, SubCategory[]>>(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [subCategoryModalVisible, setSubCategoryModalVisible] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryIcon, setNewSubCategoryIcon] = useState('');

  // 편집 상태 (카테고리/소분류/결제수단 공통)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  // 결제수단 상태
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentIcon, setNewPaymentIcon] = useState('');
  const [newPaymentType, setNewPaymentType] = useState<PaymentMethodType>('credit');

  // 예산 상태
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetCategoryId, setBudgetCategoryId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  // 자산 탭 상태
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>('savings');
  const [savingsProducts, setSavingsProducts] = useState<SavingsProduct[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [incomeTargets, setIncomeTargets] = useState<IncomeTarget[]>([]);

  // 저축 모달
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [editingSavingsId, setEditingSavingsId] = useState<string | null>(null);
  const [savingsName, setSavingsName] = useState('');
  const [savingsBank, setSavingsBank] = useState('');
  const [savingsRate, setSavingsRate] = useState('');
  const [savingsMonthly, setSavingsMonthly] = useState('');
  const [savingsStatus, setSavingsStatus] = useState<SavingsProductStatus>('active');

  // 은행 모달
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState('');
  const [bankPurpose, setBankPurpose] = useState('');
  const [bankBalance, setBankBalance] = useState('');
  const [bankTier, setBankTier] = useState<BankTier>('primary');

  // 수입 목표 모달
  const [incomeModalVisible, setIncomeModalVisible] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [incomeCategoryId, setIncomeCategoryId] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');

  const loadCategories = useCallback(() => {
    const cats = categoryService.getByType(categoryType);
    setCategories(cats);

    // 각 카테고리의 소분류 로드
    const subMap = new Map<string, SubCategory[]>();
    cats.forEach((cat) => {
      subMap.set(cat.id, subCategoryService.getByCategoryId(cat.id));
    });
    setSubCategoriesMap(subMap);
  }, [categoryType]);

  const loadPaymentMethods = useCallback(() => {
    const methods = paymentMethodService.getAll();
    setPaymentMethods(methods);
  }, []);

  const loadBudgets = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    // 이전 월 예산 자동 복사
    budgetService.copyFromPreviousMonth(year, month);
    setBudgets(budgetService.getByMonth(year, month));
  }, []);

  const loadAssets = useCallback(() => {
    setSavingsProducts(savingsService.getAll());
    setBankAccounts(bankAccountService.getAll());
    const now = new Date();
    setIncomeTargets(incomeTargetService.getByMonth(now.getFullYear(), now.getMonth() + 1));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadPaymentMethods();
      loadBudgets();
      loadAssets();
    }, [loadCategories, loadPaymentMethods, loadBudgets, loadAssets])
  );

  // 카테고리 토글
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // 카테고리 핸들러
  const handleEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryIcon(category.icon || '');
    setCategoryType(category.type);
    setCategoryModalVisible(true);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('오류', '카테고리 이름을 입력해주세요');
      return;
    }

    const categoryName = newCategoryName.trim();

    if (editingCategoryId) {
      categoryService.update(editingCategoryId, {
        name: categoryName,
        icon: newCategoryIcon || undefined,
      });
      Alert.alert('완료', `"${categoryName}" 카테고리가 수정되었습니다`);
    } else {
      const input: CreateCategoryInput = {
        name: categoryName,
        type: categoryType,
        icon: newCategoryIcon || undefined,
      };
      categoryService.create(input);
      Alert.alert('완료', `"${categoryName}" 카테고리가 생성되었습니다`);
    }

    setEditingCategoryId(null);
    setNewCategoryName('');
    setNewCategoryIcon('');
    setCategoryModalVisible(false);
    loadCategories();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 카테고리와 모든 소분류를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          // 소분류도 함께 삭제
          const subs = subCategoryService.getByCategoryId(id);
          subs.forEach((sub) => subCategoryService.delete(sub.id));
          categoryService.delete(id);
          loadCategories();
          Alert.alert('완료', `"${name}" 카테고리가 삭제되었습니다`);
        },
      },
    ]);
  };

  // 소분류 핸들러
  const handleOpenSubCategoryModal = (categoryId: string) => {
    setEditingSubCategoryId(null);
    setTargetCategoryId(categoryId);
    setNewSubCategoryName('');
    setNewSubCategoryIcon('');
    setSubCategoryModalVisible(true);
  };

  const handleEditSubCategory = (sub: SubCategory) => {
    setEditingSubCategoryId(sub.id);
    setTargetCategoryId(sub.categoryId);
    setNewSubCategoryName(sub.name);
    setNewSubCategoryIcon(sub.icon || '');
    setSubCategoryModalVisible(true);
  };

  const handleAddSubCategory = () => {
    if (!newSubCategoryName.trim()) {
      Alert.alert('오류', '소분류 이름을 입력해주세요');
      return;
    }

    const subName = newSubCategoryName.trim();

    if (editingSubCategoryId) {
      subCategoryService.update(editingSubCategoryId, {
        name: subName,
        icon: newSubCategoryIcon || undefined,
      });
      Alert.alert('완료', `"${subName}" 소분류가 수정되었습니다`);
    } else {
      const input: CreateSubCategoryInput = {
        categoryId: targetCategoryId,
        name: subName,
        icon: newSubCategoryIcon || undefined,
      };
      subCategoryService.create(input);
      Alert.alert('완료', `"${subName}" 소분류가 생성되었습니다`);
    }

    setEditingSubCategoryId(null);
    setNewSubCategoryName('');
    setNewSubCategoryIcon('');
    setSubCategoryModalVisible(false);
    loadCategories();
  };

  const handleDeleteSubCategory = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 소분류를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          subCategoryService.delete(id);
          loadCategories();
          Alert.alert('완료', `"${name}" 소분류가 삭제되었습니다`);
        },
      },
    ]);
  };

  // 결제수단 핸들러
  const handleEditPayment = (pm: PaymentMethod) => {
    setEditingPaymentId(pm.id);
    setNewPaymentName(pm.name);
    setNewPaymentIcon(pm.icon || '');
    setNewPaymentType(pm.type || 'credit');
    setPaymentModalVisible(true);
  };

  const handleAddPayment = () => {
    if (!newPaymentName.trim()) {
      Alert.alert('오류', '결제수단 이름을 입력해주세요');
      return;
    }

    const methodName = newPaymentName.trim();

    if (editingPaymentId) {
      paymentMethodService.update(editingPaymentId, {
        name: methodName,
        icon: newPaymentIcon || undefined,
        type: newPaymentType,
      });
      Alert.alert('완료', `"${methodName}" 결제수단이 수정되었습니다`);
    } else {
      const input: CreatePaymentMethodInput = {
        name: methodName,
        icon: newPaymentIcon || undefined,
        type: newPaymentType,
      };
      paymentMethodService.create(input);
      Alert.alert('완료', `"${methodName}" 결제수단이 생성되었습니다`);
    }

    setEditingPaymentId(null);
    setNewPaymentName('');
    setNewPaymentIcon('');
    setNewPaymentType('credit');
    setPaymentModalVisible(false);
    loadPaymentMethods();
  };

  const handleDeletePayment = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 결제수단을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          paymentMethodService.delete(id);
          loadPaymentMethods();
          Alert.alert('완료', `"${name}" 결제수단이 삭제되었습니다`);
        },
      },
    ]);
  };

  // 예산 핸들러
  const expenseCategories = useMemo(() => categoryService.getByType('expense'), [categories]);

  const handleOpenBudgetModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudgetId(budget.id);
      setBudgetCategoryId(budget.categoryId);
      setBudgetAmount(budget.monthlyAmount.toString());
    } else {
      setEditingBudgetId(null);
      setBudgetCategoryId('');
      setBudgetAmount('');
    }
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = () => {
    const amount = parseInt(budgetAmount, 10);
    if (!budgetCategoryId) {
      Alert.alert('오류', '카테고리를 선택해주세요');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('오류', '유효한 금액을 입력해주세요');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (editingBudgetId) {
      budgetService.update(editingBudgetId, { monthlyAmount: amount });
      Alert.alert('완료', '예산이 수정되었습니다');
    } else {
      // 같은 카테고리에 이미 예산이 있는지 확인
      const existing = budgetService.getByCategoryAndMonth(budgetCategoryId, year, month);
      if (existing) {
        Alert.alert('오류', '이미 해당 카테고리에 예산이 설정되어 있습니다');
        return;
      }
      budgetService.create({ categoryId: budgetCategoryId, monthlyAmount: amount, year, month });
      Alert.alert('완료', '예산이 추가되었습니다');
    }

    setBudgetModalVisible(false);
    setBudgetCategoryId('');
    setBudgetAmount('');
    setEditingBudgetId(null);
    loadBudgets();
  };

  const handleDeleteBudget = (id: string, categoryName: string) => {
    Alert.alert('삭제 확인', `"${categoryName}" 예산을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          budgetService.delete(id);
          loadBudgets();
          Alert.alert('완료', '예산이 삭제되었습니다');
        },
      },
    ]);
  };

  // 저축 핸들러
  const handleOpenSavingsModal = (product?: SavingsProduct) => {
    if (product) {
      setEditingSavingsId(product.id);
      setSavingsName(product.name);
      setSavingsBank(product.bank);
      setSavingsRate(product.interestRate.toString());
      setSavingsMonthly(product.monthlyAmount.toString());
      setSavingsStatus(product.status);
    } else {
      setEditingSavingsId(null);
      setSavingsName('');
      setSavingsBank('');
      setSavingsRate('');
      setSavingsMonthly('');
      setSavingsStatus('active');
    }
    setSavingsModalVisible(true);
  };

  const handleSaveSavings = () => {
    if (!savingsName.trim()) { Alert.alert('오류', '상품명을 입력해주세요'); return; }
    const monthly = parseInt(savingsMonthly, 10);
    if (isNaN(monthly) || monthly <= 0) { Alert.alert('오류', '월 납입액을 입력해주세요'); return; }

    if (editingSavingsId) {
      savingsService.update(editingSavingsId, {
        name: savingsName.trim(), bank: savingsBank.trim(),
        interestRate: parseFloat(savingsRate) || 0, monthlyAmount: monthly, status: savingsStatus,
      });
    } else {
      savingsService.create({
        name: savingsName.trim(), bank: savingsBank.trim(), status: savingsStatus,
        interestRate: parseFloat(savingsRate) || 0, monthlyAmount: monthly,
        paidMonths: 0, currentAmount: 0,
      });
    }
    setSavingsModalVisible(false);
    loadAssets();
    Alert.alert('완료', editingSavingsId ? '저축 상품이 수정되었습니다' : '저축 상품이 추가되었습니다');
  };

  const handleDeleteSavings = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 상품을 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { savingsService.delete(id); loadAssets(); } },
    ]);
  };

  // 은행 계좌 핸들러
  const handleOpenBankModal = (account?: BankAccount) => {
    if (account) {
      setEditingBankId(account.id);
      setBankName(account.bank);
      setBankPurpose(account.purpose);
      setBankBalance(account.balance.toString());
      setBankTier(account.tier);
    } else {
      setEditingBankId(null);
      setBankName('');
      setBankPurpose('');
      setBankBalance('');
      setBankTier('primary');
    }
    setBankModalVisible(true);
  };

  const handleSaveBank = () => {
    if (!bankName.trim()) { Alert.alert('오류', '은행명을 입력해주세요'); return; }
    if (editingBankId) {
      bankAccountService.update(editingBankId, {
        bank: bankName.trim(), purpose: bankPurpose.trim(),
        balance: parseInt(bankBalance, 10) || 0, tier: bankTier,
      });
    } else {
      bankAccountService.create({
        bank: bankName.trim(), purpose: bankPurpose.trim(),
        balance: parseInt(bankBalance, 10) || 0, tier: bankTier, isActive: true,
      });
    }
    setBankModalVisible(false);
    loadAssets();
    Alert.alert('완료', editingBankId ? '계좌가 수정되었습니다' : '계좌가 추가되었습니다');
  };

  const handleDeleteBank = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 계좌를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { bankAccountService.delete(id); loadAssets(); } },
    ]);
  };

  // 수입 목표 핸들러
  const incomeCategories = useMemo(() => categoryService.getByType('income'), [categories]);

  const handleOpenIncomeModal = (target?: IncomeTarget) => {
    if (target) {
      setEditingIncomeId(target.id);
      setIncomeCategoryId(target.categoryId);
      setIncomeAmount(target.targetAmount.toString());
    } else {
      setEditingIncomeId(null);
      setIncomeCategoryId('');
      setIncomeAmount('');
    }
    setIncomeModalVisible(true);
  };

  const handleSaveIncome = () => {
    if (!incomeCategoryId) { Alert.alert('오류', '카테고리를 선택해주세요'); return; }
    const amount = parseInt(incomeAmount, 10);
    if (isNaN(amount) || amount <= 0) { Alert.alert('오류', '목표 금액을 입력해주세요'); return; }

    const now = new Date();
    if (editingIncomeId) {
      incomeTargetService.update(editingIncomeId, { targetAmount: amount });
    } else {
      incomeTargetService.create({
        categoryId: incomeCategoryId, targetAmount: amount,
        year: now.getFullYear(), month: now.getMonth() + 1,
      });
    }
    setIncomeModalVisible(false);
    loadAssets();
    Alert.alert('완료', editingIncomeId ? '수입 목표가 수정되었습니다' : '수입 목표가 추가되었습니다');
  };

  const handleDeleteIncome = (id: string, name: string) => {
    Alert.alert('삭제 확인', `"${name}" 수입 목표를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => { incomeTargetService.delete(id); loadAssets(); } },
    ]);
  };

  const TIER_OPTIONS: { label: string; value: BankTier }[] = [
    { label: '1금융권', value: 'primary' },
    { label: '2금융권', value: 'secondary' },
    { label: '저축은행', value: 'savings_bank' },
  ];

  const formatBudgetAmount = (amount: number): string => {
    return amount.toLocaleString('ko-KR') + '원';
  };

  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + b.monthlyAmount, 0),
    [budgets]
  );

  const getPaymentTypeLabel = (type?: PaymentMethodType): string => {
    const found = PAYMENT_TYPE_OPTIONS.find((o) => o.value === type);
    return found?.label ?? '';
  };

  // 결제수단 렌더링
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={[styles.listItem, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemIcon}>{item.icon || '💳'}</Text>
        <View>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
          {item.type && (
            <Text style={[styles.itemType, { color: theme.colors.textTertiary }]}>{getPaymentTypeLabel(item.type)}</Text>
          )}
        </View>
      </View>
      <View style={styles.itemButtons}>
        <TouchableOpacity
          testID={`edit-payment-${item.id}`}
          style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleEditPayment(item)}
        >
          <Text style={[styles.editText, { color: theme.colors.primary }]}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
          onPress={() => handleDeletePayment(item.id, item.name)}
        >
          <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = (type: string) => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>{type}이(가) 없습니다</Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>+ 버튼을 눌러 추가해보세요</Text>
    </View>
  );

  // 카테고리 탭 렌더링
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryGroupItem
      category={item}
      subCategories={subCategoriesMap.get(item.id) || []}
      expanded={expandedCategories.has(item.id)}
      onToggle={() => toggleCategory(item.id)}
      onEditCategory={handleEditCategory}
      onDeleteCategory={handleDeleteCategory}
      onEditSubCategory={handleEditSubCategory}
      onDeleteSubCategory={handleDeleteSubCategory}
      onAddSubCategory={handleOpenSubCategoryModal}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* 테마 설정 */}
      <View style={[styles.themeSection, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.themeSectionTitle, { color: theme.colors.text }]}>테마 설정</Text>
        <View style={styles.themeOptions}>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.themeOption,
                { backgroundColor: theme.colors.surface },
                themeMode === option.value && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setThemeMode(option.value)}
            >
              <Text style={styles.themeOptionIcon}>{option.icon}</Text>
              <Text style={[
                styles.themeOptionLabel,
                { color: theme.colors.textSecondary },
                themeMode === option.value && { color: theme.colors.primary, fontWeight: '600' },
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Google Sheets 연동 */}
      <BackupRestoreSection
        isSignedIn={gsIsSignedIn}
        lastSync={gsLastSync}
        spreadsheetId={gsSpreadsheetId}
        onSignIn={handleGsSignIn}
        onSignOut={handleGsSignOut}
        onExport={handleGsExport}
        onImport={handleGsImport}
        onSpreadsheetIdChange={handleGsSpreadsheetIdChange}
      />

      {/* 메인 탭 */}
      <View style={[styles.mainTabContainer, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'category' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('category')}
        >
          <Text
            style={[
              styles.mainTabText,
              { color: theme.colors.textTertiary },
              activeTab === 'category' && { color: theme.colors.primary },
            ]}
          >
            카테고리
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'paymentMethod' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('paymentMethod')}
        >
          <Text
            style={[
              styles.mainTabText,
              { color: theme.colors.textTertiary },
              activeTab === 'paymentMethod' && { color: theme.colors.primary },
            ]}
          >
            결제수단
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'budget' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('budget')}
        >
          <Text
            style={[
              styles.mainTabText,
              { color: theme.colors.textTertiary },
              activeTab === 'budget' && { color: theme.colors.primary },
            ]}
          >
            예산
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'asset' && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('asset')}
        >
          <Text
            style={[
              styles.mainTabText,
              { color: theme.colors.textTertiary },
              activeTab === 'asset' && { color: theme.colors.primary },
            ]}
          >
            자산
          </Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 탭 */}
      {activeTab === 'category' && (
        <>
          <View style={styles.subTabContainer}>
            <TouchableOpacity
              style={[
                styles.subTab,
                { backgroundColor: theme.colors.border },
                categoryType === 'expense' && { backgroundColor: theme.colors.expense },
              ]}
              onPress={() => setCategoryType('expense')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.colors.textSecondary },
                  categoryType === 'expense' && styles.subTabTextActive,
                ]}
              >
                지출
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subTab,
                { backgroundColor: theme.colors.border },
                categoryType === 'income' && { backgroundColor: theme.colors.income },
              ]}
              onPress={() => setCategoryType('income')}
            >
              <Text
                style={[
                  styles.subTabText,
                  { color: theme.colors.textSecondary },
                  categoryType === 'income' && styles.subTabTextActive,
                ]}
              >
                수입
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('카테고리')}
          />

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ 카테고리 추가</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 결제수단 탭 */}
      {activeTab === 'paymentMethod' && (
        <>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('결제수단')}
          />

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setPaymentModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ 결제수단 추가</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 예산 탭 */}
      {activeTab === 'budget' && (
        <>
          {/* 전체 합계 */}
          <View style={[styles.budgetTotalSection, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.budgetTotalLabel, { color: theme.colors.textSecondary }]}>
              이번 달 총 예산
            </Text>
            <Text style={[styles.budgetTotalAmount, { color: theme.colors.text }]}>
              {formatBudgetAmount(totalBudget)}
            </Text>
          </View>

          <FlatList
            data={budgets}
            renderItem={({ item }) => {
              const cat = categoryService.getById(item.categoryId);
              const categoryName = cat?.name ?? '(삭제된 카테고리)';
              const categoryIcon = cat?.icon ?? '📋';
              return (
                <View style={[styles.listItem, { backgroundColor: theme.colors.cardBackground }]}>
                  <TouchableOpacity
                    style={styles.itemInfo}
                    onPress={() => handleOpenBudgetModal(item)}
                  >
                    <Text style={styles.itemIcon}>{categoryIcon}</Text>
                    <View>
                      <Text style={[styles.itemName, { color: theme.colors.text }]}>{categoryName}</Text>
                      <Text style={[styles.itemType, { color: theme.colors.textTertiary }]}>
                        {formatBudgetAmount(item.monthlyAmount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
                    onPress={() => handleDeleteBudget(item.id, categoryName)}
                  >
                    <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => renderEmpty('예산')}
          />

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleOpenBudgetModal()}
          >
            <Text style={styles.addButtonText}>+ 예산 추가</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 자산 탭 */}
      {activeTab === 'asset' && (
        <>
          <View style={styles.subTabContainer}>
            {([
              { key: 'savings' as AssetSubTab, label: '저축' },
              { key: 'bank' as AssetSubTab, label: '계좌' },
              { key: 'incomeTarget' as AssetSubTab, label: '수입 목표' },
            ]).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.subTab,
                  { backgroundColor: theme.colors.border },
                  assetSubTab === tab.key && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setAssetSubTab(tab.key)}
              >
                <Text style={[
                  styles.subTabText,
                  { color: theme.colors.textSecondary },
                  assetSubTab === tab.key && styles.subTabTextActive,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 저축 서브탭 */}
          {assetSubTab === 'savings' && (
            <>
              <FlatList
                data={savingsProducts}
                renderItem={({ item }) => (
                  <View style={[styles.listItem, { backgroundColor: theme.colors.cardBackground }]}>
                    <TouchableOpacity style={styles.itemInfo} onPress={() => handleOpenSavingsModal(item)}>
                      <Text style={styles.itemIcon}>{item.status === 'active' ? '💰' : '⏳'}</Text>
                      <View>
                        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                        <Text style={[styles.itemType, { color: theme.colors.textTertiary }]}>
                          {item.bank} · {item.interestRate}% · 월 {item.monthlyAmount.toLocaleString()}원
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
                      onPress={() => handleDeleteSavings(item.id, item.name)}
                    >
                      <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => renderEmpty('저축 상품')}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleOpenSavingsModal()}
              >
                <Text style={styles.addButtonText}>+ 저축 상품 추가</Text>
              </TouchableOpacity>
            </>
          )}

          {/* 계좌 서브탭 */}
          {assetSubTab === 'bank' && (
            <>
              <FlatList
                data={bankAccounts}
                renderItem={({ item }) => (
                  <View style={[styles.listItem, { backgroundColor: theme.colors.cardBackground }]}>
                    <TouchableOpacity style={styles.itemInfo} onPress={() => handleOpenBankModal(item)}>
                      <Text style={styles.itemIcon}>🏦</Text>
                      <View>
                        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.bank}</Text>
                        <Text style={[styles.itemType, { color: theme.colors.textTertiary }]}>
                          {item.purpose} · {item.balance.toLocaleString()}원
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
                      onPress={() => handleDeleteBank(item.id, item.bank)}
                    >
                      <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => renderEmpty('은행 계좌')}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleOpenBankModal()}
              >
                <Text style={styles.addButtonText}>+ 계좌 추가</Text>
              </TouchableOpacity>
            </>
          )}

          {/* 수입 목표 서브탭 */}
          {assetSubTab === 'incomeTarget' && (
            <>
              <FlatList
                data={incomeTargets}
                renderItem={({ item }) => {
                  const cat = categoryService.getById(item.categoryId);
                  return (
                    <View style={[styles.listItem, { backgroundColor: theme.colors.cardBackground }]}>
                      <TouchableOpacity style={styles.itemInfo} onPress={() => handleOpenIncomeModal(item)}>
                        <Text style={styles.itemIcon}>{cat?.icon ?? '💼'}</Text>
                        <View>
                          <Text style={[styles.itemName, { color: theme.colors.text }]}>{cat?.name ?? '미분류'}</Text>
                          <Text style={[styles.itemType, { color: theme.colors.textTertiary }]}>
                            목표: {item.targetAmount.toLocaleString()}원
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
                        onPress={() => handleDeleteIncome(item.id, cat?.name ?? '미분류')}
                      >
                        <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => renderEmpty('수입 목표')}
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleOpenIncomeModal()}
              >
                <Text style={styles.addButtonText}>+ 수입 목표 추가</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* 저축 상품 모달 */}
      <Modal visible={savingsModalVisible} animationType="slide" transparent onRequestClose={() => setSavingsModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingSavingsId ? '저축 상품 수정' : '새 저축 상품'}
            </Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="상품명" value={savingsName} onChangeText={setSavingsName} placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="은행" value={savingsBank} onChangeText={setSavingsBank} placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="금리 (%)" value={savingsRate} onChangeText={setSavingsRate} keyboardType="decimal-pad" placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="월 납입액" value={savingsMonthly} onChangeText={setSavingsMonthly} keyboardType="numeric" placeholderTextColor={theme.colors.textTertiary} />
            <View style={styles.optionsContainer}>
              {([{ label: '운용중', value: 'active' as SavingsProductStatus }, { label: '대기', value: 'pending' as SavingsProductStatus }]).map((opt) => (
                <TouchableOpacity key={opt.value} style={[styles.typeOption, { backgroundColor: theme.colors.surface }, savingsStatus === opt.value && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setSavingsStatus(opt.value)}>
                  <Text style={[styles.typeOptionText, { color: theme.colors.textSecondary }, savingsStatus === opt.value && styles.typeOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.border }]} onPress={() => setSavingsModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveSavings}>
                <Text style={styles.confirmText}>{editingSavingsId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 은행 계좌 모달 */}
      <Modal visible={bankModalVisible} animationType="slide" transparent onRequestClose={() => setBankModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingBankId ? '계좌 수정' : '새 계좌'}
            </Text>
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="은행명" value={bankName} onChangeText={setBankName} placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="용도 (예: 급여, 저축)" value={bankPurpose} onChangeText={setBankPurpose} placeholderTextColor={theme.colors.textTertiary} />
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="잔액" value={bankBalance} onChangeText={setBankBalance} keyboardType="numeric" placeholderTextColor={theme.colors.textTertiary} />
            <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>등급</Text>
            <View style={styles.optionsContainer}>
              {TIER_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt.value} style={[styles.typeOption, { backgroundColor: theme.colors.surface }, bankTier === opt.value && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setBankTier(opt.value)}>
                  <Text style={[styles.typeOptionText, { color: theme.colors.textSecondary }, bankTier === opt.value && styles.typeOptionTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.border }]} onPress={() => setBankModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveBank}>
                <Text style={styles.confirmText}>{editingBankId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 수입 목표 모달 */}
      <Modal visible={incomeModalVisible} animationType="slide" transparent onRequestClose={() => setIncomeModalVisible(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingIncomeId ? '수입 목표 수정' : '새 수입 목표'}
            </Text>
            {!editingIncomeId && (
              <>
                <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>카테고리 선택</Text>
                <View style={styles.optionsContainer}>
                  {incomeCategories.map((cat) => (
                    <TouchableOpacity key={cat.id} style={[styles.typeOption, { backgroundColor: theme.colors.surface }, incomeCategoryId === cat.id && { backgroundColor: theme.colors.primary }]}
                      onPress={() => setIncomeCategoryId(cat.id)}>
                      <Text style={[styles.typeOptionText, { color: theme.colors.textSecondary }, incomeCategoryId === cat.id && styles.typeOptionTextActive]}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <TextInput style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="월 목표 금액" value={incomeAmount} onChangeText={setIncomeAmount} keyboardType="numeric" placeholderTextColor={theme.colors.textTertiary} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.colors.border }]} onPress={() => setIncomeModalVisible(false)}>
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]} onPress={handleSaveIncome}>
                <Text style={styles.confirmText}>{editingIncomeId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 예산 추가/수정 모달 */}
      <Modal
        visible={budgetModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingBudgetId ? '예산 수정' : '새 예산'}
            </Text>

            {!editingBudgetId && (
              <>
                <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>카테고리 선택</Text>
                <View style={styles.optionsContainer}>
                  {expenseCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.typeOption,
                        { backgroundColor: theme.colors.surface },
                        budgetCategoryId === cat.id && { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => setBudgetCategoryId(cat.id)}
                    >
                      <Text
                        style={[
                          styles.typeOptionText,
                          { color: theme.colors.textSecondary },
                          budgetCategoryId === cat.id && styles.typeOptionTextActive,
                        ]}
                      >
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="월 예산 금액"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
              placeholderTextColor={theme.colors.textTertiary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setBudgetModalVisible(false);
                  setBudgetCategoryId('');
                  setBudgetAmount('');
                  setEditingBudgetId(null);
                }}
              >
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveBudget}
              >
                <Text style={styles.confirmText}>{editingBudgetId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 카테고리 추가 모달 */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingCategoryId ? '카테고리 수정' : `새 ${categoryType === 'expense' ? '지출' : '수입'} 카테고리`}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor={theme.colors.textTertiary}
            />

            <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.colors.surface },
                    newCategoryIcon === icon && { backgroundColor: theme.colors.primaryLight, borderWidth: 2, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewCategoryIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setEditingCategoryId(null);
                  setNewCategoryName('');
                  setNewCategoryIcon('');
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddCategory}
              >
                <Text style={styles.confirmText}>{editingCategoryId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 소분류 추가/수정 모달 */}
      <Modal
        visible={subCategoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSubCategoryModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{editingSubCategoryId ? '소분류 수정' : '새 소분류'}</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="소분류 이름"
              value={newSubCategoryName}
              onChangeText={setNewSubCategoryName}
              placeholderTextColor={theme.colors.textTertiary}
            />

            <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {SUB_CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.colors.surface },
                    newSubCategoryIcon === icon && { backgroundColor: theme.colors.primaryLight, borderWidth: 2, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewSubCategoryIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setEditingSubCategoryId(null);
                  setNewSubCategoryName('');
                  setNewSubCategoryIcon('');
                  setSubCategoryModalVisible(false);
                }}
              >
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddSubCategory}
              >
                <Text style={styles.confirmText}>{editingSubCategoryId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 결제수단 추가 모달 */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{editingPaymentId ? '결제수단 수정' : '새 결제수단'}</Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text }]}
              placeholder="결제수단 이름 (예: 신한카드)"
              value={newPaymentName}
              onChangeText={setNewPaymentName}
              placeholderTextColor={theme.colors.textTertiary}
            />

            <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>유형 선택</Text>
            <View style={styles.optionsContainer}>
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeOption,
                    { backgroundColor: theme.colors.surface },
                    newPaymentType === option.value && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewPaymentType(option.value)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      { color: theme.colors.textSecondary },
                      newPaymentType === option.value && styles.typeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.iconLabel, { color: theme.colors.textSecondary }]}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {PAYMENT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    { backgroundColor: theme.colors.surface },
                    newPaymentIcon === icon && { backgroundColor: theme.colors.primaryLight, borderWidth: 2, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setNewPaymentIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => {
                  setEditingPaymentId(null);
                  setNewPaymentName('');
                  setNewPaymentIcon('');
                  setNewPaymentType('credit');
                  setPaymentModalVisible(false);
                }}
              >
                <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddPayment}
              >
                <Text style={styles.confirmText}>{editingPaymentId ? '수정' : '추가'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  themeSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeOptionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  themeOptionLabel: {
    fontSize: 12,
  },
  mainTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  subTabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemType: {
    fontSize: 12,
    marginTop: 2,
  },
  itemButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editText: {
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  addButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typeOptionText: {
    fontSize: 14,
  },
  typeOptionTextActive: {
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  budgetTotalSection: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  budgetTotalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  budgetTotalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
});
