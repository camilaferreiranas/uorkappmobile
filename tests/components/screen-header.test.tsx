import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ScreenHeader } from '@/components/ui/screen-header';

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

function iconNames(renderer: ReactTestRenderer): (string | undefined)[] {
  return renderer.root
    .findAllByType(MaterialIcons)
    .map((icon) => icon.props.name as string | undefined);
}

function textValues(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((node) => node.props.children);
}

describe('ScreenHeader', () => {
  it('renderiza sem botões nem título quando nenhuma prop é informada', () => {
    const renderer = render(<ScreenHeader />);

    expect(pressablesOf(renderer)).toHaveLength(0);
    expect(renderer.root.findAllByType(MaterialIcons)).toHaveLength(0);
    expect(renderer.root.findAllByType(Text)).toHaveLength(0);
  });

  it('renderiza título, botão de voltar e ação quando todos são informados', () => {
    const onBack = jest.fn();
    const onAction = jest.fn();
    const renderer = render(
      <ScreenHeader
        title="Perfil"
        onBack={onBack}
        actionIcon="edit"
        onAction={onAction}
        actionLabel="Editar perfil"
      />
    );

    const pressables = pressablesOf(renderer);
    expect(pressables).toHaveLength(2);
    expect(textValues(renderer)).toContain('Perfil');
    expect(iconNames(renderer)).toEqual(['arrow-back', 'edit']);
    expect(pressables[0].props.accessibilityLabel).toBe('Voltar');
    expect(pressables[0].props.accessibilityRole).toBe('button');
    expect(pressables[1].props.accessibilityLabel).toBe('Editar perfil');

    const title = renderer.root
      .findAllByType(Text)
      .find((node) => node.props.children === 'Perfil');
    expect(title?.props.numberOfLines).toBe(1);
  });

  it('renderiza a ação mesmo sem título nem botão de voltar', () => {
    const renderer = render(<ScreenHeader actionIcon="close" />);

    expect(pressablesOf(renderer)).toHaveLength(1);
    expect(iconNames(renderer)).toEqual(['close']);
    expect(
      renderer.root.findAll((node) => node.props.numberOfLines === 1)
    ).toHaveLength(0);
  });

  it('chama onBack ao tocar no botão de voltar', () => {
    const onBack = jest.fn();
    const renderer = render(<ScreenHeader title="Início" onBack={onBack} />);

    const [botaoVoltar] = pressablesOf(renderer);
    act(() => {
      botaoVoltar.props.onPress();
    });

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('chama onAction ao tocar no botão de ação', () => {
    const onAction = jest.fn();
    const renderer = render(
      <ScreenHeader title="Notificações" actionIcon="more-horiz" onAction={onAction} />
    );

    const [botaoAcao] = pressablesOf(renderer);
    act(() => {
      botaoAcao.props.onPress();
    });

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('aplica o estilo de pressionado nos dois botões', () => {
    const renderer = render(
      <ScreenHeader
        title="Perfil"
        onBack={jest.fn()}
        actionIcon="edit"
        onAction={jest.fn()}
      />
    );

    const [botaoVoltar, botaoAcao] = pressablesOf(renderer);

    const voltarStyle = botaoVoltar.props.style as (state: {
      pressed: boolean;
    }) => unknown[];
    expect(voltarStyle({ pressed: false })[0]).toBeDefined();
    expect(voltarStyle({ pressed: false })[1]).toBe(false);
    expect(voltarStyle({ pressed: true })[1]).toEqual({ opacity: 0.6 });

    const acaoStyle = botaoAcao.props.style as (state: {
      pressed: boolean;
    }) => unknown[];
    expect(acaoStyle({ pressed: false })[0]).toBeDefined();
    expect(acaoStyle({ pressed: false })[1]).toBe(false);
    expect(acaoStyle({ pressed: true })[1]).toEqual({ opacity: 0.6 });
  });
});
