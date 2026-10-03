import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { Pressable, Text } from 'react-native';

import { DemandCard } from '../../components/ui/demand-card';

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

function strings(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((t) => t.props.children)
    .filter((c): c is string => typeof c === 'string');
}

function findProposalButton(
  renderer: ReactTestRenderer,
  onPressAction?: () => void
) {
  return renderer.root.findAll(
    (node) =>
      node.type === pressableType &&
      (onPressAction === undefined || node.props.onPress === onPressAction)
  )[0];
}

const base = {
  title: 'Trocar tomada',
  subtitle: 'Preciso urgente',
  budget: 'R$ 90',
  urgency: 'Urgente',
  distance: '3,1 km',
} as const;

describe('DemandCard', () => {
  it('renderiza título, descrição, urgência, distância e orçamento', () => {
    const renderer = render(<DemandCard {...base} />);

    expect(strings(renderer)).toEqual([
      'Trocar tomada',
      'Preciso urgente',
      'Urgente',
      '3,1 km',
      'R$ 90',
      'Proposta',
    ]);
  });

  it('executa onPressAction ao pressionar o botão de proposta', () => {
    const onPressAction = jest.fn();
    const renderer = render(
      <DemandCard {...base} onPressAction={onPressAction} />
    );

    act(() => {
      findProposalButton(renderer, onPressAction).props.onPress();
    });

    expect(onPressAction).toHaveBeenCalledTimes(1);
  });

  it('mantém onPress undefined no botão quando onPressAction não é informado', () => {
    const renderer = render(<DemandCard {...base} />);

    expect(findProposalButton(renderer).props.onPress).toBeUndefined();
  });
});
