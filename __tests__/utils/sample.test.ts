/**
 * 테스트 프레임워크 동작 확인을 위한 샘플 테스트
 * 실제 구현 시 삭제하거나 실제 테스트로 대체
 */
describe('Test Framework Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async tests', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(2);
    expect(arr).toHaveLength(3);
  });

  it('should handle objects', () => {
    const obj = { name: 'CloudPocket', type: 'app' };
    expect(obj).toHaveProperty('name', 'CloudPocket');
    expect(obj).toMatchObject({ type: 'app' });
  });
});
