import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { CategoryCard } from '../../components/ui/category-card';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// React 19 + RN: o export Pressable é um React.memo, então o fiber usa o tipo interno.
const pressableType = (Pressable as unknown as { type: unknown }).type;

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function findCard(renderer: ReactTestRenderer) {
  return renderer.root.findAll((node) => node.type === pressableType)[0];
}

function textByContent(renderer: ReactTestRenderer, content: string) {
  return renderer.root
    .findAllByType(Text)
    .find((t) => t.props.children === content);
}

describe('CategoryCard', () => {
  it('renderiza o título e o ícone da família material por padrão', () => {
    const renderer = render(<CategoryCard title="Elétrica" icon="bolt" />);

    const card = findCard(renderer);
    expect(card.props.accessibilityLabel).toBe('Elétrica');
    expect(card.props.accessibilityRole).toBe('button');
    expect(renderer.root.findByType(MaterialIcons).props).toMatchObject({
      name: 'bolt',
      size: 22,
      color: Colors.brandPrimary,
    });
    expect(renderer.root.findAllByType(MaterialCommunityIcons)).toHaveLength(0);
    const label = textByContent(renderer, 'Elétrica');
    expect(label).toBeDefined();
    expect(label?.props.numberOfLines).toBe(2);
  });

  it('renderiza o ícone da família community quando iconFamily é community', () => {
    const renderer = render(
      <CategoryCard title="Hidráulica" icon="water-pump" iconFamily="community" />
    );

    expect(
      renderer.root.findByType(MaterialCommunityIcons).props
    ).toMatchObject({
      name: 'water-pump',
      size: 22,
      color: Colors.brandPrimary,
    });
    expect(renderer.root.findAllByType(MaterialIcons)).toHaveLength(0);
  });

  it('executa onPress ao pressionar o cartão', () => {
    const onPress = jest.fn();
    const renderer = render(
      <CategoryCard title="Pintura" icon="format-paint" onPress={onPress} />
    );

    act(() => {
      findCard(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mantém onPress undefined quando não informado', () => {
    const renderer = render(<CategoryCard title="Pintura" icon="format-paint" />);

    expect(findCard(renderer).props.onPress).toBeUndefined();
  });

  it('aplica o estilo pressionado apenas quando pressed é verdadeiro', () => {
    const renderer = render(<CategoryCard title="Pintura" icon="format-paint" />);

    const { style } = findCard(renderer).props;
    const pressed = StyleSheet.flatten(style({ pressed: true }));
    expect(pressed).toMatchObject({ opacity: 0.6 });
    expect(StyleSheet.flatten(style({ pressed: false })).opacity).toBeUndefined();
  });
});
