import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ProfileScreenHeader } from '../../components/ui/profile-screen-header';
import { Colors } from '../../constants/theme';

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mockBack = jest.fn();

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function strings(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((t) => t.props.children)
    .filter((c): c is string => typeof c === 'string');
}

beforeEach(() => {
  (useRouter as unknown as jest.Mock).mockReturnValue({ back: mockBack });
});

describe('ProfileScreenHeader', () => {
  it('renderiza o título e o botão de voltar', () => {
    const renderer = render(<ProfileScreenHeader title="Meu perfil" />);

    expect(strings(renderer)).toEqual(['Meu perfil']);
    const back = renderer.root.findByType(TouchableOpacity);
    expect(back.props.accessibilityLabel).toBe('Voltar');
    expect(back.props.accessibilityRole).toBe('button');
  });

  it('chama router.back ao pressionar o botão de voltar', () => {
    const renderer = render(<ProfileScreenHeader title="Meu perfil" />);

    act(() => {
      renderer.root.findByType(TouchableOpacity).props.onPress();
    });

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('aplica o padding superior das safe area insets', () => {
    const renderer = render(<ProfileScreenHeader title="Meu perfil" />);

    const container = renderer.root.findAllByType(View)[0];
    expect(container.props.style[1]).toEqual({ paddingTop: 47 });
  });

  it('renderiza o subtítulo e usa a linha com subtítulo quando informado', () => {
    const renderer = render(
      <ProfileScreenHeader title="Meu perfil" subtitle="Cliente desde 2024" />
    );

    expect(strings(renderer)).toEqual(['Meu perfil', 'Cliente desde 2024']);
    const row = renderer.root.findAllByType(View)[1];
    expect(row.props.style[1]).toMatchObject({ minHeight: 70 });
  });

  it('oculta o subtítulo e mantém a linha simples quando não informado', () => {
    const renderer = render(<ProfileScreenHeader title="Meu perfil" />);

    expect(strings(renderer)).toEqual(['Meu perfil']);
    const row = renderer.root.findAllByType(View)[1];
    expect(row.props.style[1]).toBeUndefined();
  });

  it('aplica os estilos do cabeçalho', () => {
    const renderer = render(<ProfileScreenHeader title="Meu perfil" />);

    const container = renderer.root.findAllByType(View)[0];
    expect(container.props.style[0]).toMatchObject({
      backgroundColor: Colors.primary,
    });
    const title = renderer.root
      .findAllByType(Text)
      .find((t) => t.props.children === 'Meu perfil');
    expect(title?.props.style).toMatchObject({
      color: Colors.white,
      fontSize: 20,
    });
  });
});
