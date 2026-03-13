import React from 'react';
import { Alert } from 'react-native';
import { render, fireEvent, waitFor } from '../test-utils';
import BackupRestoreSection from '../../src/views/components/BackupRestoreSection';
import { SyncResult } from '../../src/types/googleSheets';

jest.spyOn(Alert, 'alert');

const mockSuccessResult: SyncResult = {
  status: 'success',
  message: '내보내기 완료 (거래 10건)',
  timestamp: new Date('2026-03-13T14:30:00'),
  recordCounts: {
    transactions: 10,
    categories: 5,
    subCategories: 8,
    paymentMethods: 3,
    incomeTargets: 0,
    savings: 0,
    bankAccounts: 0,
  },
};

const mockErrorResult: SyncResult = {
  status: 'error',
  message: '네트워크 오류',
  timestamp: new Date(),
};

const defaultProps = {
  isSignedIn: false,
  lastSync: null,
  spreadsheetId: '',
  onSignIn: jest.fn().mockResolvedValue(undefined),
  onSignOut: jest.fn().mockResolvedValue(undefined),
  onExport: jest.fn().mockResolvedValue(mockSuccessResult),
  onImport: jest.fn().mockResolvedValue(mockSuccessResult),
  onSpreadsheetIdChange: jest.fn().mockResolvedValue(undefined),
};

describe('BackupRestoreSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('미연결 시 로그인 버튼 표시', () => {
    const { getByTestId, queryByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={false} />
    );
    expect(getByTestId('sign-in-button')).toBeTruthy();
    expect(queryByTestId('export-button')).toBeNull();
    expect(queryByTestId('import-button')).toBeNull();
  });

  it('연결 후 내보내기/가져오기 버튼 표시', () => {
    const { getByTestId, queryByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} />
    );
    expect(queryByTestId('sign-in-button')).toBeNull();
    expect(getByTestId('export-button')).toBeTruthy();
    expect(getByTestId('import-button')).toBeTruthy();
  });

  it('내보내기 버튼 클릭 시 onExport 호출', async () => {
    const onExport = jest.fn().mockResolvedValue(mockSuccessResult);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onExport={onExport} />
    );

    fireEvent.press(getByTestId('export-button'));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalled();
    });
  });

  it('가져오기 버튼 클릭 시 확인 Alert 표시', () => {
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} />
    );

    fireEvent.press(getByTestId('import-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      '가져오기 확인',
      expect.stringContaining('현재 로컬 데이터가 모두 삭제'),
      expect.arrayContaining([
        expect.objectContaining({ text: '취소' }),
        expect.objectContaining({ text: '가져오기' }),
      ])
    );
  });

  it('동기화 중 스피너 표시', async () => {
    // Create a never-resolving export to keep syncing state
    let resolveExport: (result: SyncResult) => void;
    const onExport = jest.fn().mockReturnValue(
      new Promise<SyncResult>((resolve) => {
        resolveExport = resolve;
      })
    );

    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onExport={onExport} />
    );

    fireEvent.press(getByTestId('export-button'));

    await waitFor(() => {
      expect(getByTestId('sync-spinner')).toBeTruthy();
    });

    // Cleanup: resolve the promise
    resolveExport!(mockSuccessResult);
  });

  it('성공 시 결과 메시지 표시', async () => {
    const onExport = jest.fn().mockResolvedValue(mockSuccessResult);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onExport={onExport} />
    );

    fireEvent.press(getByTestId('export-button'));

    await waitFor(() => {
      const result = getByTestId('sync-result');
      expect(result).toBeTruthy();
    });
  });

  it('에러 시 에러 메시지 표시', async () => {
    const onExport = jest.fn().mockResolvedValue(mockErrorResult);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onExport={onExport} />
    );

    fireEvent.press(getByTestId('export-button'));

    await waitFor(() => {
      const result = getByTestId('sync-result');
      expect(result).toBeTruthy();
    });
  });

  it('연결 해제 시 onSignOut 호출', () => {
    const onSignOut = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onSignOut={onSignOut} />
    );

    fireEvent.press(getByTestId('sign-out-button'));
    expect(onSignOut).toHaveBeenCalled();
  });
});
