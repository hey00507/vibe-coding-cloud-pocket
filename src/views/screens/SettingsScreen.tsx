import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CONFIG } from '../../constants/googleSheets';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Category,
  SubCategory,
  PaymentMethod,
  TransactionType,
  CreateCategoryInput,
  CreateSubCategoryInput,
  CreatePaymentMethodInput,
  PaymentMethodType,
} from '../../types';
import {
  categoryService,
  paymentMethodService,
  subCategoryService,
  googleAuthService,
  googleSheetsService,
} from '../../services/ServiceRegistry';
import CategoryGroupItem from '../components/CategoryGroupItem';
import BackupRestoreSection from '../components/BackupRestoreSection';
import { useTheme } from '../../controllers/useTheme';
import { ThemeMode } from '../../types/theme';
import { SyncResult } from '../../types/googleSheets';

type TabType = 'category' | 'paymentMethod';

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

  // 결제수단 상태
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentIcon, setNewPaymentIcon] = useState('');
  const [newPaymentType, setNewPaymentType] = useState<PaymentMethodType>('credit');

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

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadPaymentMethods();
    }, [loadCategories, loadPaymentMethods])
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
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('오류', '카테고리 이름을 입력해주세요');
      return;
    }

    const categoryName = newCategoryName.trim();
    const input: CreateCategoryInput = {
      name: categoryName,
      type: categoryType,
      icon: newCategoryIcon || undefined,
    };

    categoryService.create(input);

    setNewCategoryName('');
    setNewCategoryIcon('');
    setCategoryModalVisible(false);
    loadCategories();

    Alert.alert('완료', `"${categoryName}" 카테고리가 생성되었습니다`);
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
    setTargetCategoryId(categoryId);
    setNewSubCategoryName('');
    setNewSubCategoryIcon('');
    setSubCategoryModalVisible(true);
  };

  const handleAddSubCategory = () => {
    if (!newSubCategoryName.trim()) {
      Alert.alert('오류', '소분류 이름을 입력해주세요');
      return;
    }

    const subName = newSubCategoryName.trim();
    const input: CreateSubCategoryInput = {
      categoryId: targetCategoryId,
      name: subName,
      icon: newSubCategoryIcon || undefined,
    };

    subCategoryService.create(input);

    setNewSubCategoryName('');
    setNewSubCategoryIcon('');
    setSubCategoryModalVisible(false);
    loadCategories();

    Alert.alert('완료', `"${subName}" 소분류가 생성되었습니다`);
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
  const handleAddPayment = () => {
    if (!newPaymentName.trim()) {
      Alert.alert('오류', '결제수단 이름을 입력해주세요');
      return;
    }

    const methodName = newPaymentName.trim();
    const input: CreatePaymentMethodInput = {
      name: methodName,
      icon: newPaymentIcon || undefined,
      type: newPaymentType,
    };

    paymentMethodService.create(input);

    setNewPaymentName('');
    setNewPaymentIcon('');
    setNewPaymentType('credit');
    setPaymentModalVisible(false);
    loadPaymentMethods();

    Alert.alert('완료', `"${methodName}" 결제수단이 생성되었습니다`);
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
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.colors.expenseLight }]}
        onPress={() => handleDeletePayment(item.id, item.name)}
      >
        <Text style={[styles.deleteText, { color: theme.colors.expense }]}>삭제</Text>
      </TouchableOpacity>
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
      onDeleteCategory={handleDeleteCategory}
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

      {/* 카테고리 추가 모달 */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              새 {categoryType === 'expense' ? '지출' : '수입'} 카테고리
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
                <Text style={styles.confirmText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 소분류 추가 모달 */}
      <Modal
        visible={subCategoryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSubCategoryModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>새 소분류</Text>

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
                <Text style={styles.confirmText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 결제수단 추가 모달 */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>새 결제수단</Text>

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
                <Text style={styles.confirmText}>추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
});
