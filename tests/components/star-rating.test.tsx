import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text } from 'react-native';

import { StarRating } from '../../components/ui/star-rating';
import { Colors } from '../../constants/theme';

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

function findStars(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function'
  );
}

function starIcon(star: ReactTestInstance): ReactTestInstance {
  return star.findAll(
    (node) =>
      typeof node.props.name === 'string' && typeof node.props.size === 'number'
  )[0];
}

function label(renderer: ReactTestRenderer): unknown {
  const all = renderer.root.findAllByType(Text);
  return all[all.length - 1].props.children;
}

describe('StarRating', () => {
  it('renderiza as cinco estrelas vazias quando a nota é zero', () => {
    const renderer = render(
      <StarRating rating={0} onRatingChange={jest.fn()} />
    );

    const stars = findStars(renderer);
    expect(stars).toHaveLength(5);
    expect(stars.map((star) => starIcon(star).props.name)).toEqual([
      'star-border',
      'star-border',
      'star-border',
      'star-border',
      'star-border',
    ]);
    expect(stars.map((star) => starIcon(star).props.color)).toEqual([
      Colors.textMuted,
      Colors.textMuted,
      Colors.textMuted,
      Colors.textMuted,
      Colors.textMuted,
    ]);
    expect(stars.map((star) => star.props.accessibilityState.selected)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(label(renderer)).toBe('Selecione uma nota');
  });

  it('preenche as estrelas até a nota informada', () => {
    const renderer = render(
      <StarRating rating={3} onRatingChange={jest.fn()} />
    );

    const stars = findStars(renderer);
    expect(stars.map((star) => starIcon(star).props.name)).toEqual([
      'star',
      'star',
      'star',
      'star-border',
      'star-border',
    ]);
    expect(stars.map((star) => starIcon(star).props.color)).toEqual([
      Colors.rating,
      Colors.rating,
      Colors.rating,
      Colors.textMuted,
      Colors.textMuted,
    ]);
    expect(stars.map((star) => star.props.accessibilityState.selected)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
    expect(label(renderer)).toBe('Regular');
  });

  it('exibe o rótulo correspondente a nota máxima', () => {
    const renderer = render(
      <StarRating rating={5} onRatingChange={jest.fn()} />
    );

    expect(label(renderer)).toBe('Excelente!');
    expect(findStars(renderer).map((star) => starIcon(star).props.name)).toEqual([
      'star',
      'star',
      'star',
      'star',
      'star',
    ]);
  });

  it('exibe o rótulo da menor nota positiva', () => {
    const renderer = render(
      <StarRating rating={1} onRatingChange={jest.fn()} />
    );

    expect(label(renderer)).toBe('Péssimo');
    expect(findStars(renderer).map((star) => star.props.accessibilityState.selected)).toEqual(
      [true, false, false, false, false]
    );
  });

  it('usa singular na primeira estrela e nas demais o plural', () => {
    const renderer = render(
      <StarRating rating={2} onRatingChange={jest.fn()} />
    );

    const labels = findStars(renderer).map((star) => star.props.accessibilityLabel);
    expect(labels).toEqual([
      '1 estrela',
      '2 estrelas',
      '3 estrelas',
      '4 estrelas',
      '5 estrelas',
    ]);
    expect(label(renderer)).toBe('Ruim');
  });

  it('chama onRatingChange com o valor da estrela pressionada', () => {
    const onRatingChange = jest.fn();
    const renderer = render(
      <StarRating rating={0} onRatingChange={onRatingChange} />
    );

    const stars = findStars(renderer);
    act(() => {
      stars[3].props.onPress();
    });

    expect(onRatingChange).toHaveBeenCalledTimes(1);
    expect(onRatingChange).toHaveBeenCalledWith(4);
  });

  it('usa o tamanho padrão de 40 para os ícones', () => {
    const renderer = render(
      <StarRating rating={2} onRatingChange={jest.fn()} />
    );

    expect(findStars(renderer).map((star) => starIcon(star).props.size)).toEqual([
      40, 40, 40, 40, 40,
    ]);
  });

  it('usa o tamanho informado na prop size', () => {
    const renderer = render(
      <StarRating rating={2} onRatingChange={jest.fn()} size={24} />
    );

    expect(findStars(renderer).map((star) => starIcon(star).props.size)).toEqual([
      24, 24, 24, 24, 24,
    ]);
  });
});
