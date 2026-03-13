import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../controllers/useTheme';
import { SyncStatus, SyncResult } from '../../types/googleSheets';

interface BackupRestoreSectionProps {
  isSignedIn: boolean;
  lastSync: Date | null;
  spreadsheetId: string;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onExport: () => Promise<SyncResult>;
  onImport: () => Promise<SyncResult>;
  onSpreadsheetIdChange: (id: string) => Promise<void>;
}

export default function BackupRestoreSection({
  isSignedIn,
  lastSync,
  spreadsheetId,
  onSignIn,
  onSignOut,
  onExport,
  onImport,
  onSpreadsheetIdChange,
}: BackupRestoreSectionProps) {
  const { theme } = useTheme();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [sheetId, setSheetId] = useState(spreadsheetId);

  useEffect(() => {
    setSheetId(spreadsheetId);
  }, [spreadsheetId]);

  const handleExport = useCallback(async () => {
    setSyncStatus('syncing');
    setSyncResult(null);
    try {
      const result = await onExport();
      setSyncStatus(result.status);
      setSyncResult(result);
    } catch (error) {
      setSyncStatus('error');
      setSyncResult({
        status: 'error',
        message: error instanceof Error ? error.message : '내보내기 실패',
        timestamp: new Date(),
      });
    }
  }, [onExport]);

  const handleImport = useCallback(() => {
    Alert.alert(
      '가져오기 확인',
      '가져오기를 실행하면 현재 로컬 데이터가 모두 삭제되고 Google Sheets 데이터로 대체됩니다.\n\n계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '가져오기',
          style: 'destructive',
          onPress: async () => {
            setSyncStatus('syncing');
            setSyncResult(null);
            try {
              const result = await onImport();
              setSyncStatus(result.status);
              setSyncResult(result);
            } catch (error) {
              setSyncStatus('error');
              setSyncResult({
                status: 'error',
                message: error instanceof Error ? error.message : '가져오기 실패',
                timestamp: new Date(),
              });
            }
          },
        },
      ]
    );
  }, [onImport]);

  const handleSheetIdSave = useCallback(async () => {
    await onSpreadsheetIdChange(sheetId);
  }, [sheetId, onSpreadsheetIdChange]);

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Google Sheets 연동</Text>

      {!isSignedIn ? (
        <TouchableOpacity
          testID="sign-in-button"
          style={[styles.signInButton, { backgroundColor: theme.colors.primary }]}
          onPress={onSignIn}
        >
          <Text style={styles.signInText}>Google 계정 연결</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {/* 스프레드시트 ID 입력 */}
          <View style={styles.sheetIdContainer}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>스프레드시트 ID</Text>
            <View style={styles.sheetIdRow}>
              <TextInput
                testID="spreadsheet-id-input"
                style={[styles.sheetIdInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={sheetId}
                onChangeText={setSheetId}
                placeholder="스프레드시트 ID 입력"
                placeholderTextColor={theme.colors.textTertiary}
              />
              <TouchableOpacity
                testID="save-sheet-id-button"
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSheetIdSave}
              >
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 마지막 동기화 시간 */}
          {lastSync && (
            <Text testID="last-sync-text" style={[styles.lastSync, { color: theme.colors.textTertiary }]}>
              마지막 동기화: {formatDate(lastSync)}
            </Text>
          )}

          {/* 동기화 버튼 */}
          {syncStatus === 'syncing' ? (
            <View testID="sync-spinner" style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.syncingText, { color: theme.colors.textSecondary }]}>동기화 중...</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                testID="export-button"
                style={[styles.syncButton, { backgroundColor: theme.colors.income }]}
                onPress={handleExport}
              >
                <Text style={styles.syncButtonText}>내보내기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="import-button"
                style={[styles.syncButton, { backgroundColor: theme.colors.warning }]}
                onPress={handleImport}
              >
                <Text style={styles.syncButtonText}>가져오기</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 결과 메시지 */}
          {syncResult && (
            <View testID="sync-result" style={[
              styles.resultContainer,
              { backgroundColor: syncResult.status === 'success' ? theme.colors.incomeLight : theme.colors.expenseLight },
            ]}>
              <Text style={[
                styles.resultText,
                { color: syncResult.status === 'success' ? theme.colors.income : theme.colors.expense },
              ]}>
                {syncResult.message}
              </Text>
            </View>
          )}

          {/* 연결 해제 */}
          <TouchableOpacity
            testID="sign-out-button"
            style={[styles.signOutButton, { borderColor: theme.colors.expense }]}
            onPress={onSignOut}
          >
            <Text style={[styles.signOutText, { color: theme.colors.expense }]}>연결 해제</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  signInButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sheetIdContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  sheetIdRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetIdInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  lastSync: {
    fontSize: 12,
    marginBottom: 12,
  },
  spinnerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  syncingText: {
    fontSize: 14,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  syncButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signOutButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
