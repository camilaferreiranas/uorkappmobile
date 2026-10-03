import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { ProposalCard } from '@/components/ui/proposal-card';
import { Colors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

/** O Pressable do RN é memoizado; localizamos os botões pelos props de estilo. */
function pressablesOf(renderer: ReactTestRenderer) {
  return renderer.root.findAll(
    (node) =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.style === 'function'
  );
}

function textValues(renderer: ReactTestRenderer): string[] {
  return renderer.root.findAllByType(Text).map((node) => {
    const children = node.props.children;
    return Array.isArray(children) ? children.join('') : String(children);
  });
}

function iconNames(renderer: ReactTestRenderer): (string | undefined)[] {
  return renderer.root
    .findAllByType(MaterialIcons)
    .map((icon) => icon.props.name as string | undefined);
}

const baseProps = {
  name: 'Marina Castro',
  initials: 'MC',
  rating: 4.8,
  jobs: 12,
  message: 'Posso começar amanhã de manhã.',
  price: 'R$ 250,00',
  eta: '2 horas',
};

describe('ProposalCard', () => {
  it('renderiza a proposta sem destaque por padrão', () => {
    const renderer = render(<ProposalCard {...baseProps} />);

    const [card] = renderer.root.findAllByType(View);
    expect((card.props.style as unknown[])[1]).toBe(false);

    expect(textValues(renderer)).toContain('MC');
    expect(textValues(renderer)).toContain('Marina Castro');
    expect(textValues(renderer)).toContain('4.8 · 12 serviços');
    expect(textValues(renderer)).toContain('Posso começar amanhã de manhã.');
    expect(textValues(renderer)).toContain('R$ 250,00');
    expect(textValues(renderer)).toContain('2 horas');
    expect(textValues(renderer)).toContain('Aceitar proposta');
    expect(textValues(renderer)).toContain('Ver perfil');
    expect(textValues(renderer)).not.toContain('Melhor proposta');
    expect(iconNames(renderer)).not.toContain('bolt');
    expect(iconNames(renderer)).toContain('star');
  });

  it('renderiza o selo de melhor proposta quando destacada', () => {
    const renderer = render(<ProposalCard {...baseProps} highlighted />);

    const [card] = renderer.root.findAllByType(View);
    expect((card.props.style as unknown[])[1]).toMatchObject({ borderWidth: 1.5 });
    expect(textValues(renderer)).toContain('Melhor proposta');
    expect(iconNames(renderer)).toContain('bolt');
  });

  it('chama onAccept ao tocar em aceitar proposta', () => {
    const onAccept = jest.fn();
    const renderer = render(<ProposalCard {...baseProps} onAccept={onAccept} />);

    const pressables = pressablesOf(renderer);
    expect(renderer.root.findAllByType(Button)).toHaveLength(1);
    act(() => {
      pressables[0].props.onPress();
    });

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('chama onViewProfile e aplica o estilo pressionado em ver perfil', () => {
    const onViewProfile = jest.fn();
    const renderer = render(
      <ProposalCard {...baseProps} onViewProfile={onViewProfile} />
    );

    const pressables = pressablesOf(renderer);
    const perfil = pressables[1];
    act(() => {
      perfil.props.onPress();
    });
    expect(onViewProfile).toHaveBeenCalledTimes(1);

    const style = perfil.props.style as (state: { pressed: boolean }) => unknown[];
    expect(style({ pressed: false })[0]).toBeDefined();
    expect(style({ pressed: false })[1]).toBe(false);
    expect(style({ pressed: true })[1]).toEqual({
      backgroundColor: Colors.surfaceNeutral,
    });
  });

  it('renderiza sem os callbacks opcionais', () => {
    const renderer = render(<ProposalCard {...baseProps} />);

    const pressables = pressablesOf(renderer);
    expect(pressables[0].props.onPress).toBeUndefined();
    expect(pressables[1].props.onPress).toBeUndefined();
    expect(textValues(renderer)).toContain('Aceitar proposta');
    expect(textValues(renderer)).toContain('Ver perfil');
  });
});
