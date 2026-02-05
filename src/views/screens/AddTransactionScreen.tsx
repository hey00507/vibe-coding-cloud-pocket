import React, { useState, useEffect } from 'react';
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
import { AddTransactionScreenProps } from '../../types/navigation';
import {
  TransactionType,
  Category,
  PaymentMethod,
  CreateTransactionInput,
} from '../../types';
import {
  transactionService,
  categoryService,
  paymentMethodService,
} from './HomeScreen';

export default function AddTransactionScreen({
  navigation,
}: AddTransactionScreenProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const cats = categoryService.getByType(type);
    setCategories(cats);
    setSelectedCategoryId(cats[0]?.id ?? '');

    const methods = paymentMethodService.getAll();
    setPaymentMethods(methods);
    setSelectedPaymentMethodId(methods[0]?.id ?? '');
  }, [type]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
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
      date: new Date(),
      categoryId: selectedCategoryId,
      paymentMethodId: selectedPaymentMethodId,
      memo: memo.trim() || undefined,
    };

    transactionService.create(input);

    const typeText = type === 'expense' ? '지출' : '수입';
    Alert.alert('완료', `${typeText} ${numAmount.toLocaleString()}원이 등록되었습니다`, [
      {
        text: '확인',
        onPress: () => {
          setAmount('');
          setMemo('');
          navigation.navigate('Home');
        },
      },
      {
        text: '계속 등록하기',
        onPress: () => {
          setAmount('');
          setMemo('');
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'expense' && styles.expenseButtonActive,
            ]}
            onPress={() => handleTypeChange('expense')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'expense' && styles.typeTextActive,
              ]}
            >
              지출
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'income' && styles.incomeButtonActive,
            ]}
            onPress={() => handleTypeChange('income')}
          >
            <Text
              style={[
                styles.typeText,
                type === 'income' && styles.typeTextActive,
              ]}
            >
              수입
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>금액</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(formatAmount(text))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999"
            />
            <Text style={styles.currency}>원</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>카테고리</Text>
          {categories.length === 0 ? (
            <Text style={styles.emptyText}>
              카테고리가 없습니다. 먼저 카테고리를 추가해주세요.
            </Text>
          ) : (
            <View style={styles.optionsContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.optionButton,
                    selectedCategoryId === cat.id && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>결제수단</Text>
          {paymentMethods.length === 0 ? (
            <Text style={styles.emptyText}>
              결제수단이 없습니다. 먼저 결제수단을 추가해주세요.
            </Text>
          ) : (
            <View style={styles.optionsContainer}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.optionButton,
                    selectedPaymentMethodId === method.id &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedPaymentMethodId(method.id)}
                >
                  <Text
                    style={[
                      styles.optionText,
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
          <Text style={styles.label}>메모 (선택)</Text>
          <TextInput
            style={styles.memoInput}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            type === 'expense'
              ? styles.expenseButtonActive
              : styles.incomeButtonActive,
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
  },
  expenseButtonActive: {
    backgroundColor: '#F44336',
  },
  incomeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
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
    color: '#333',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: 16,
    color: '#333',
  },
  currency: {
    fontSize: 18,
    color: '#666',
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
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextActive: {
    color: '#FFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  memoInput: {
    backgroundColor: '#FFF',
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
