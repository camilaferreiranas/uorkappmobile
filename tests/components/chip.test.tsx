import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Chip, ChipRow } from '../../components/ui/chip';
import { Colors, ProfessionalColors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Evita o carregamento assíncrono de fontes do ícone (setState fora de act()).
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function findChip(renderer: ReactTestRenderer): ReactTestInstance {
  return renderer.root.find(
    (node) =>
      typeof node.props.style === 'function' &&
      node.props.accessibilityRole === 'button'
  );
}

function chipStyle(
  renderer: ReactTestRenderer,
  pressed: boolean
): Record<string, unknown> {
  return StyleSheet.flatten(findChip(renderer).props.style({ pressed })) as Record<
    string,
    unknown
  >;
}

function labelText(renderer: ReactTestRenderer, label: string): ReactTestInstance {
  return renderer.root.find(
    (node) => node.type === Text && node.props.children === label
  );
}

function icons(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      typeof node.props.name === 'string' && typeof node.props.size === 'number'
  );
}

describe('Chip', () => {
  it('renderiza inativo com o estilo do tone client por padrão', () => {
    const renderer = render(<Chip label="Limpeza" />);

    expect(labelText(renderer, 'Limpeza')).toBeTruthy();
    expect(findChip(renderer).props.accessibilityState).toEqual({
      selected: false,
    });
    expect(chipStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.surfaceNeutral,
    });
    expect(StyleSheet.flatten(labelText(renderer, 'Limpeza').props.style).color).toBe(
      Colors.textSecondary
    );
    expect(icons(renderer)).toHaveLength(0);
  });

  it('usa as cores do tone professional', () => {
    const renderer = render(
      <Chip label="Instalação" tone="professional" active />
    );

    expect(chipStyle(renderer, false)).toMatchObject({
      backgroundColor: ProfessionalColors.brandPrimary,
    });
    expect(
      StyleSheet.flatten(labelText(renderer, 'Instalação').props.style).color
    ).toBe(ProfessionalColors.textOnBrand);
  });

  it('aplica o estilo ativo no tone client', () => {
    const renderer = render(<Chip label="Montagem" active />);

    expect(chipStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });
    expect(findChip(renderer).props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(labelText(renderer, 'Montagem').props.style).color).toBe(
      Colors.textOnBrand
    );
  });

  it('aplica o estilo pressionado apenas quando inativo', () => {
    const inativo = render(<Chip label="Pintura" />);
    expect(chipStyle(inativo, true)).toMatchObject({
      backgroundColor: Colors.brandTint,
    });
    expect(chipStyle(inativo, false).backgroundColor).toBe(Colors.surfaceNeutral);

    const ativo = render(<Chip label="Pintura" active />);
    expect(chipStyle(ativo, true)).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });
    expect(chipStyle(ativo, true).backgroundColor).not.toBe(Colors.brandTint);
  });

  it('não aplica o estilo de pressionado do tone professional no cliente', () => {
    const renderer = render(<Chip label="Revisão" tone="professional" />);

    expect(chipStyle(renderer, true)).toMatchObject({
      backgroundColor: ProfessionalColors.brandTint,
    });
  });

  it('exibe o ícone com a cor secundária quando inativo', () => {
    const renderer = render(<Chip label="Urgente" icon="bolt" />);

    const icon = icons(renderer)[0];
    expect(icon.props.name).toBe('bolt');
    expect(icon.props.size).toBe(15);
    expect(icon.props.color).toBe(Colors.textSecondary);
  });

  it('exibe o ícone com a cor do texto quando ativo', () => {
    const renderer = render(<Chip label="Urgente" icon="bolt" active />);

    const icon = icons(renderer)[0];
    expect(icon.props.color).toBe(Colors.textOnBrand);
  });

  it('usa a cor do ícone do tone professional', () => {
    const renderer = render(
      <Chip label="Urgente" icon="bolt" tone="professional" active />
    );

    expect(icons(renderer)[0].props.color).toBe(ProfessionalColors.textOnBrand);
  });

  it('chama onPress ao tocar no chip', () => {
    const onPress = jest.fn();
    const renderer = render(<Chip label="Agendar" onPress={onPress} />);

    act(() => {
      findChip(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('funciona sem a prop onPress', () => {
    const renderer = render(<Chip label="Sem ação" />);

    expect(findChip(renderer).props.onPress).toBeUndefined();
    expect(() => chipStyle(renderer, true)).not.toThrow();
  });
});

describe('ChipRow', () => {
  it('renderiza uma linha rolável horizontal com os filhos', () => {
    const renderer = render(
      <ChipRow>
        <Chip label="A" />
        <Chip label="B" />
      </ChipRow>
    );

    const scroll = renderer.root.findByType(ScrollView);
    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.showsHorizontalScrollIndicator).toBe(false);
    expect(scroll.props.contentContainerStyle).toMatchObject({ paddingHorizontal: 16 });
    expect(labelText(renderer, 'A')).toBeTruthy();
    expect(labelText(renderer, 'B')).toBeTruthy();
  });
});
