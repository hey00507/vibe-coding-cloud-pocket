import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AddTransactionScreenProps } from '../../types/navigation';
import {
  TransactionType,
  Category,
  SubCategory,
  PaymentMethod,
  CreateTransactionInput,
} from '../../types';
import {
  transactionService,
  categoryService,
  paymentMethodService,
  subCategoryService,
} from '../../services/ServiceRegistry';
import DateSelector from '../components/DateSelector';
import { useTheme } from '../../controllers/useTheme';

export default function AddTransactionScreen({
  navigation,
}: AddTransactionScreenProps) {
  const { theme } = useTheme();
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // 소분류 로드
  const loadSubCategories = useCallback((categoryId: string) => {
    if (categoryId) {
      const subs = subCategoryService.getByCategoryId(categoryId);
      setSubCategories(subs);
      setSelectedSubCategoryId(subs[0]?.id ?? '');
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId('');
    }
  }, []);

  // 화면에 포커스될 때마다 카테고리/결제수단 새로고침
  const loadData = useCallback(() => {
    const cats = categoryService.getByType(type);
    setCategories(cats);
    if (!selectedCategoryId || !cats.find((c) => c.id === selectedCategoryId)) {
      const firstCatId = cats[0]?.id ?? '';
      setSelectedCategoryId(firstCatId);
      if (type === 'expense') {
        loadSubCategories(firstCatId);
      } else {
        setSubCategories([]);
        setSelectedSubCategoryId('');
      }
    }

    const methods = paymentMethodService.getAll();
    setPaymentMethods(methods);
    if (
      !selectedPaymentMethodId ||
      !methods.find((m) => m.id === selectedPaymentMethodId)
    ) {
      setSelectedPaymentMethodId(methods[0]?.id ?? '');
    }
  }, [type, selectedCategoryId, selectedPaymentMethodId, loadSubCategories]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const cats = categoryService.getByType(newType);
    setCategories(cats);
    const firstCatId = cats[0]?.id ?? '';
    setSelectedCategoryId(firstCatId);

    if (newType === 'expense') {
      loadSubCategories(firstCatId);
    } else {
      setSubCategories([]);
      setSelectedSubCategoryId('');
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (type === 'expense') {
      loadSubCategories(categoryId);
    }
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('오류', '올바른 금액을 입력해주세요');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('오류', '카테고리를 선택해주세요');
      return;
    }

    if (!selectedPaymentMethodId) {
      Alert.alert('오류', '결제수단을 선택해주세요');
      return;
    }

    const input: CreateTransactionInput = {
      type,
      amount: numAmount,
      date: selectedDate,
      categoryId: selectedCategoryId,
      subCategoryId: selectedSubCategoryId || undefined,
      paymentMethodId: selectedPaymentMethodId,
      memo: memo.trim() || undefined,
    };

    transactionService.create(input);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const typeText = type === 'expense' ? '지출' : '수입';
    Alert.alert('완료', `${typeText} ${numAmount.toLocaleString()}원이 등록되었습니다`, [
      {
        text: '완료',
        onPress: () => {
          setAmount('');
          setMemo('');
          navigation.navigate('Home', { selectedDate: dateStr });
        },
      },
      {
        text: '계속 등록',
        onPress: () => {
          setAmount('');
          setMemo('');
          setSelectedDate(new Date());
        },
      },
    ]);
  };

  const formatAmount = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    return numbers;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: theme.colors.border },
              type === 'expense' && { backgroundColor: theme.colors.expense },
            ]}
            onPress={() => handleTypeChange('expense')}
          >
            <Text
              style={[
                styles.typeText,
                { color: theme.colors.textSecondary },
                type === 'expense' && styles.typeTextActive,
              ]}
            >
              지출
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              { backgroundColor: theme.colors.border },
              type === 'income' && { backgroundColor: theme.colors.income },
            ]}
            onPress={() => handleTypeChange('income')}
          >
            <Text
              style={[
                styles.typeText,
                { color: theme.colors.textSecondary },
                type === 'income' && styles.typeTextActive,
              ]}
            >
              수입
            </Text>
          </TouchableOpacity>
        </View>

        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>금액</Text>
          <View style={[styles.amountContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <TextInput
              style={[styles.amountInput, { color: theme.colors.text }]}
              value={amount}
              onChangeText={(text) => setAmount(formatAmount(text))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.textTertiary}
            />
            <Text style={[styles.currency, { color: theme.colors.textSecondary }]}>원</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>카테고리</Text>
          {categories.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              카테고리가 없습니다. 먼저 카테고리를 추가해주세요.
            </Text>
          ) : (
            <View style={styles.optionsContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                    selectedCategoryId === cat.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => handleCategorySelect(cat.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedCategoryId === cat.id && styles.optionTextActive,
                    ]}
                  >
                    {cat.icon ? `${cat.icon} ` : ''}
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 소분류 선택 (지출일 때만, 소분류가 있을 때만) */}
        {type === 'expense' && subCategories.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>소분류</Text>
            <View style={styles.optionsContainer}>
              {subCategories.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                    selectedSubCategoryId === sub.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedSubCategoryId(sub.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedSubCategoryId === sub.id && styles.optionTextActive,
                    ]}
                  >
                    {sub.icon ? `${sub.icon} ` : ''}
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>결제수단</Text>
          {paymentMethods.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              결제수단이 없습니다. 먼저 결제수단을 추가해주세요.
            </Text>
          ) : (
            <View style={styles.optionsContainer}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.optionButton,
                    { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                    selectedPaymentMethodId === method.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedPaymentMethodId(method.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      selectedPaymentMethodId === method.id &&
                        styles.optionTextActive,
                    ]}
                  >
                    {method.icon ? `${method.icon} ` : ''}
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>메모 (선택)</Text>
          <TextInput
            style={[styles.memoInput, { backgroundColor: theme.colors.cardBackground, color: theme.colors.text }]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: type === 'expense' ? theme.colors.expense : theme.colors.income },
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {type === 'expense' ? '지출' : '수입'} 추가
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#FFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 16,
  },
  currency: {
    fontSize: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  optionTextActive: {
    color: '#FFF',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  memoInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});
