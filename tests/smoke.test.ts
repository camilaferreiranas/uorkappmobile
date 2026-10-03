describe('smoke', () => {
  it('executa o pipeline Jest/Babel do Expo', () => {
    expect(1 + 1).toBe(2);
  });

  it('resolve TypeScript', () => {
    const value: number = 42;
    expect(value).toBe(42);
  });

  it('possível fetch global está disponível para mock', () => {
    expect(typeof globalThis.fetch).toBe('function');
  });
});
