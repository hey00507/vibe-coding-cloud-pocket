import React, { useState, useCallback } from 'react';
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
} from '../../services/ServiceRegistry';
import CategoryGroupItem from '../components/CategoryGroupItem';

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

export default function SettingsScreen() {
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
    <View style={styles.listItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemIcon}>{item.icon || '💳'}</Text>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.type && (
            <Text style={styles.itemType}>{getPaymentTypeLabel(item.type)}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePayment(item.id, item.name)}
      >
        <Text style={styles.deleteText}>삭제</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = (type: string) => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{type}이(가) 없습니다</Text>
      <Text style={styles.emptySubtext}>+ 버튼을 눌러 추가해보세요</Text>
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
    <View style={styles.container}>
      {/* 메인 탭 */}
      <View style={styles.mainTabContainer}>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'category' && styles.mainTabActive,
          ]}
          onPress={() => setActiveTab('category')}
        >
          <Text
            style={[
              styles.mainTabText,
              activeTab === 'category' && styles.mainTabTextActive,
            ]}
          >
            카테고리
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainTab,
            activeTab === 'paymentMethod' && styles.mainTabActive,
          ]}
          onPress={() => setActiveTab('paymentMethod')}
        >
          <Text
            style={[
              styles.mainTabText,
              activeTab === 'paymentMethod' && styles.mainTabTextActive,
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
                categoryType === 'expense' && styles.expenseActive,
              ]}
              onPress={() => setCategoryType('expense')}
            >
              <Text
                style={[
                  styles.subTabText,
                  categoryType === 'expense' && styles.subTabTextActive,
                ]}
              >
                지출
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subTab,
                categoryType === 'income' && styles.incomeActive,
              ]}
              onPress={() => setCategoryType('income')}
            >
              <Text
                style={[
                  styles.subTabText,
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
            style={styles.addButton}
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
            style={styles.addButton}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              새 {categoryType === 'expense' ? '지출' : '수입'} 카테고리
            </Text>

            <TextInput
              style={styles.input}
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor="#999"
            />

            <Text style={styles.iconLabel}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newCategoryIcon === icon && styles.iconOptionActive,
                  ]}
                  onPress={() => setNewCategoryIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewCategoryName('');
                  setNewCategoryIcon('');
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 소분류</Text>

            <TextInput
              style={styles.input}
              placeholder="소분류 이름"
              value={newSubCategoryName}
              onChangeText={setNewSubCategoryName}
              placeholderTextColor="#999"
            />

            <Text style={styles.iconLabel}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {SUB_CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newSubCategoryIcon === icon && styles.iconOptionActive,
                  ]}
                  onPress={() => setNewSubCategoryIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewSubCategoryName('');
                  setNewSubCategoryIcon('');
                  setSubCategoryModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 결제수단</Text>

            <TextInput
              style={styles.input}
              placeholder="결제수단 이름 (예: 신한카드)"
              value={newPaymentName}
              onChangeText={setNewPaymentName}
              placeholderTextColor="#999"
            />

            <Text style={styles.iconLabel}>유형 선택</Text>
            <View style={styles.optionsContainer}>
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeOption,
                    newPaymentType === option.value && styles.typeOptionActive,
                  ]}
                  onPress={() => setNewPaymentType(option.value)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      newPaymentType === option.value && styles.typeOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.iconLabel}>아이콘 선택</Text>
            <View style={styles.iconGrid}>
              {PAYMENT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newPaymentIcon === icon && styles.iconOptionActive,
                  ]}
                  onPress={() => setNewPaymentIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewPaymentName('');
                  setNewPaymentIcon('');
                  setNewPaymentType('credit');
                  setPaymentModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
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
    backgroundColor: '#F5F5F5',
  },
  mainTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  mainTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: '#2196F3',
  },
  mainTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  mainTabTextActive: {
    color: '#2196F3',
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
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  expenseActive: {
    backgroundColor: '#F44336',
  },
  incomeActive: {
    backgroundColor: '#4CAF50',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: '#FFF',
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
    color: '#333',
  },
  itemType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  deleteText: {
    fontSize: 14,
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
  },
  addButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
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
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
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
    backgroundColor: '#F5F5F5',
  },
  typeOptionActive: {
    backgroundColor: '#2196F3',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
