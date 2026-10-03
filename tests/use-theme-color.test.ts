import { Colors } from '../constants/theme';
import { useThemeColor } from '../hooks/use-theme-color';
import { renderHook } from './helpers/render-hook';

const mockColorScheme = jest.fn<string | null, []>(() => 'light');
jest.mock('../hooks/use-color-scheme', () => ({
  useColorScheme: () => mockColorScheme(),
}));

describe('useThemeColor', () => {
  it('usa a cor das props quando presente no esquema atual', () => {
    mockColorScheme.mockReturnValue('light');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#111111', dark: '#eeeeee' }, 'background')
    );
    expect(result.current).toBe('#111111');
  });

  it('usa a cor das props no modo escuro', () => {
    mockColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#111111', dark: '#eeeeee' }, 'background')
    );
    expect(result.current).toBe('#eeeeee');
  });

  it('cai para a cor do tema quando a prop não é informada', () => {
    mockColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({}, 'background'));
    expect(result.current).toBe(Colors.dark.background);
  });

  it('assume "light" quando o esquema de cores é null', () => {
    mockColorScheme.mockReturnValue(null);
    const { result } = renderHook(() => useThemeColor({}, 'tint'));
    expect(result.current).toBe(Colors.light.tint);
  });
});
