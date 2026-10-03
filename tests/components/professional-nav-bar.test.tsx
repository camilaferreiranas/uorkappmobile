import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ProfessionalNavBar } from '@/components/ui/professional-nav-bar';
import { ProfessionalColors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

jest.mock('expo-router', () => {
  const mockReplace = jest.fn();
  return {
    useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
    __mockReplace: mockReplace,
  };
});

let mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => mockInsets,
}));

const routerMock = jest.requireMock('expo-router') as { __mockReplace: jest.Mock };

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function iconColors(renderer: ReactTestRenderer): unknown[] {
  return renderer.root
    .findAllByType(MaterialIcons)
    .map((icon) => icon.props.color);
}

function iconNames(renderer: ReactTestRenderer): (string | undefined)[] {
  return renderer.root
    .findAllByType(MaterialIcons)
    .map((icon) => icon.props.name as string | undefined);
}

function labelStyle(renderer: ReactTestRenderer, label: string): unknown[] {
  const node = renderer.root
    .findAllByType(Text)
    .find((text) => text.props.children === label);
  return node?.props.style as unknown[];
}

describe('ProfessionalNavBar', () => {
  beforeEach(() => {
    mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  });

  it('renderiza os três itens com o início ativo', () => {
    const renderer = render(<ProfessionalNavBar active="inicio" />);

    expect(renderer.root.findAllByType(TouchableOpacity)).toHaveLength(3);
    expect(iconNames(renderer)).toEqual(['home', 'list-alt', 'person']);
    expect(iconColors(renderer)).toEqual([
      ProfessionalColors.brandPrimary,
      '#7A7A95',
      '#7A7A95',
    ]);

    const estiloInicio = labelStyle(renderer, 'Início');
    expect(estiloInicio[1]).toMatchObject({ fontWeight: '700', color: ProfessionalColors.brandPrimary });
    expect(labelStyle(renderer, 'Demandas')[1]).toBe(false);
    expect(labelStyle(renderer, 'Perfil')[1]).toBe(false);

    const wrappers = renderer.root
      .findAllByType(MaterialIcons)
      .map((icon) => icon.parent?.props.style as unknown[]);
    expect(wrappers[0][1]).toMatchObject({ backgroundColor: ProfessionalColors.brandTint });
    expect(wrappers[1][1]).toBe(false);
    expect(wrappers[2][1]).toBe(false);
  });

  it('destaca o item de demandas quando active é demandas', () => {
    const renderer = render(<ProfessionalNavBar active="demandas" />);

    expect(iconColors(renderer)).toEqual([
      '#7A7A95',
      ProfessionalColors.brandPrimary,
      '#7A7A95',
    ]);
    expect(labelStyle(renderer, 'Início')[1]).toBe(false);
    expect(labelStyle(renderer, 'Demandas')[1]).toMatchObject({
      fontWeight: '700',
    });
    expect(labelStyle(renderer, 'Perfil')[1]).toBe(false);
  });

  it('destaca o item de perfil quando active é perfil', () => {
    const renderer = render(<ProfessionalNavBar active="perfil" />);

    expect(iconColors(renderer)).toEqual([
      '#7A7A95',
      '#7A7A95',
      ProfessionalColors.brandPrimary,
    ]);
    expect(labelStyle(renderer, 'Início')[1]).toBe(false);
    expect(labelStyle(renderer, 'Demandas')[1]).toBe(false);
    expect(labelStyle(renderer, 'Perfil')[1]).toMatchObject({
      fontWeight: '700',
      color: ProfessionalColors.brandPrimary,
    });
  });

  it('navega para a rota correspondente ao tocar em cada item', () => {
    const renderer = render(<ProfessionalNavBar active="inicio" />);

    const itens = renderer.root.findAllByType(TouchableOpacity);
    itens.forEach((item) => {
      act(() => {
        item.props.onPress();
      });
    });

    expect(routerMock.__mockReplace).toHaveBeenCalledTimes(3);
    expect(routerMock.__mockReplace).toHaveBeenNthCalledWith(
      1,
      '/professional-home'
    );
    expect(routerMock.__mockReplace).toHaveBeenNthCalledWith(
      2,
      '/professional-demands'
    );
    expect(routerMock.__mockReplace).toHaveBeenNthCalledWith(
      3,
      '/professional-profile'
    );
  });

  it('respeita a área segura inferior maior que 16', () => {
    mockInsets = { top: 10, bottom: 34, left: 0, right: 0 };
    const renderer = render(<ProfessionalNavBar active="inicio" />);

    const [nav] = renderer.root.findAllByType(View);
    expect((nav.props.style as unknown[])[1]).toEqual({ paddingBottom: 34 });
  });

  it('usa 16 de espaçamento inferior quando a área segura é menor', () => {
    mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
    const renderer = render(<ProfessionalNavBar active="inicio" />);

    const [nav] = renderer.root.findAllByType(View);
    expect((nav.props.style as unknown[])[1]).toEqual({ paddingBottom: 16 });
  });
});
