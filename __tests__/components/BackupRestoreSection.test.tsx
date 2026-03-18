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

  // ========== 스프레드시트 ID 모달 ==========

  it('ID 미등록 시 등록 버튼 표시', () => {
    const { getByTestId, queryByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} spreadsheetId="" />
    );
    expect(getByTestId('register-sheet-id-button')).toBeTruthy();
    expect(queryByTestId('spreadsheet-id-display')).toBeNull();
  });

  it('ID 등록됨 → 마스킹된 ID + 변경 버튼 표시', () => {
    const { getByTestId, queryByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} spreadsheetId="1S5H-FmixaZ-H8Vc8p2N0MMDOPuvJHCXmPejru3snyLY" />
    );
    expect(getByTestId('spreadsheet-id-display')).toBeTruthy();
    expect(getByTestId('change-sheet-id-button')).toBeTruthy();
    expect(queryByTestId('register-sheet-id-button')).toBeNull();
  });

  it('등록 버튼 클릭 → 모달 열림', () => {
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} spreadsheetId="" />
    );

    fireEvent.press(getByTestId('register-sheet-id-button'));
    expect(getByTestId('sheet-id-modal')).toBeTruthy();
    expect(getByTestId('spreadsheet-id-input')).toBeTruthy();
  });

  it('변경 버튼 클릭 → 모달 열림 (기존 ID 표시)', () => {
    const id = '1S5H-FmixaZ-H8Vc8p2N0MMDOPuvJHCXmPejru3snyLY';
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} spreadsheetId={id} />
    );

    fireEvent.press(getByTestId('change-sheet-id-button'));
    const input = getByTestId('spreadsheet-id-input');
    expect(input.props.value).toBe(id);
  });

  it('모달에서 URL 입력 → ID 추출 후 저장', async () => {
    const onSpreadsheetIdChange = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onSpreadsheetIdChange={onSpreadsheetIdChange} />
    );

    fireEvent.press(getByTestId('register-sheet-id-button'));
    fireEvent.changeText(
      getByTestId('spreadsheet-id-input'),
      'https://docs.google.com/spreadsheets/d/1S5H-FmixaZ-abc123/edit#gid=0'
    );
    fireEvent.press(getByTestId('modal-save-button'));

    await waitFor(() => {
      expect(onSpreadsheetIdChange).toHaveBeenCalledWith('1S5H-FmixaZ-abc123');
    });
  });

  it('모달에서 ID 직접 입력 → 그대로 저장', async () => {
    const onSpreadsheetIdChange = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onSpreadsheetIdChange={onSpreadsheetIdChange} />
    );

    fireEvent.press(getByTestId('register-sheet-id-button'));
    fireEvent.changeText(getByTestId('spreadsheet-id-input'), 'abc123-direct-id');
    fireEvent.press(getByTestId('modal-save-button'));

    await waitFor(() => {
      expect(onSpreadsheetIdChange).toHaveBeenCalledWith('abc123-direct-id');
    });
  });

  it('모달 취소 → onSpreadsheetIdChange 미호출', () => {
    const onSpreadsheetIdChange = jest.fn();
    const { getByTestId } = render(
      <BackupRestoreSection {...defaultProps} isSignedIn={true} onSpreadsheetIdChange={onSpreadsheetIdChange} />
    );

    fireEvent.press(getByTestId('register-sheet-id-button'));
    fireEvent.changeText(getByTestId('spreadsheet-id-input'), 'some-id');
    fireEvent.press(getByTestId('modal-cancel-button'));

    expect(onSpreadsheetIdChange).not.toHaveBeenCalled();
  });
});
