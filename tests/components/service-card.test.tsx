import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ServiceCard } from '../../components/ui/service-card';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

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

function findCard(renderer: ReactTestRenderer) {
  return renderer.root.findByType(TouchableOpacity);
}

const base = {
  title: 'Reparo de torneira',
  price: 'R$ 120',
  subtitle: 'Insumos inclusos',
  rating: 4.56,
} as const;

describe('ServiceCard', () => {
  it('renderiza título, subtítulo, preço e avaliação', () => {
    const renderer = render(<ServiceCard {...base} />);

    expect(strings(renderer)).toEqual([
      'Reparo de torneira',
      'Insumos inclusos',
      'R$ 120',
      '4.6',
    ]);
  });

  it('usa activeOpacity 0.7 quando onPress é informado', () => {
    const onPress = jest.fn();
    const renderer = render(<ServiceCard {...base} onPress={onPress} />);

    expect(findCard(renderer).props.activeOpacity).toBe(0.7);

    act(() => {
      findCard(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('usa activeOpacity 1 quando onPress não é informado', () => {
    const renderer = render(<ServiceCard {...base} />);

    const card = findCard(renderer);
    expect(card.props.activeOpacity).toBe(1);
    expect(card.props.onPress).toBeUndefined();
  });

  it('renderiza o conteúdo dentro de um cartão', () => {
    const renderer = render(<ServiceCard {...base} />);

    const view = renderer.root.findAllByType(View)[0];
    expect(view).toBeDefined();
    expect(strings(renderer)).toContain('Reparo de torneira');
  });
});
