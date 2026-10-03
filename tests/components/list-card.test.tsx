import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ListCard } from '@/components/ui/list-card';
import { Colors, ProfessionalColors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

jest.mock('@expo/vector-icons', () => {
  const react = jest.requireActual('react') as typeof import('react');
  return {
    MaterialIcons: (props: Record<string, unknown>) =>
      react.createElement('MaterialIcons', props),
  };
});

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function iconNames(renderer: ReactTestRenderer): (string | undefined)[] {
  return renderer.root
    .findAllByType(MaterialIcons)
    .map((icon) => icon.props.name as string);
}

function textValues(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((node) => node.props.children);
}

/** Nó Pressable principal do cartão (único com style em função). */
function cardPressable(renderer: ReactTestRenderer) {
  const [node] = renderer.root.findAll(
    (candidate) => typeof candidate.props.style === 'function'
  );
  if (!node) throw new Error('Pressable do cartão não encontrado');
  return node;
}

/** Botão interno de favorito (único com hitSlop). */
function favoritePressable(renderer: ReactTestRenderer) {
  return renderer.root.findAll((candidate) => candidate.props.hitSlop === 10)[0];
}

function flatten(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('ListCard', () => {
  it('renderiza o cartão com as cores do cliente por padrão', () => {
    const renderer = render(<ListCard title="Faxina residencial" />);

    const media = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'work');

    expect(media).toBeDefined();
    expect(media?.props.color).toBe(Colors.brandPrimary);
    expect(textValues(renderer)).toContain('Faxina residencial');
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Faxina residencial' })
        .length
    ).toBeGreaterThan(0);
  });

  it('renderiza o cartão com as cores do profissional quando tone é professional', () => {
    const renderer = render(
      <ListCard tone="professional" title="Reforma de cozinha" initials="RC" />
    );

    const initials = renderer.root
      .findAllByType(Text)
      .find((node) => node.props.children === 'RC');

    expect(initials).toBeDefined();
    const style = flatten(initials?.props.style);
    expect(style.color).toBe(ProfessionalColors.brandPrimary);
    expect(style.color).not.toBe(Colors.brandPrimary);
  });

  it('aplica o estilo de pressionado somente quando o cartão está pressionado', () => {
    const renderer = render(
      <ListCard title="Corte de grama" onPress={jest.fn()} />
    );

    const style = cardPressable(renderer).props.style as (state: {
      pressed: boolean;
    }) => unknown[];

    const released = style({ pressed: false });
    const pressed = style({ pressed: true });

    expect(flatten(released[0])).toEqual(flatten(pressed[0]));
    expect(released[1]).toBe(false);
    expect(pressed[1]).toEqual({ opacity: 0.7 });
  });

  it('exibe as iniciais quando informadas', () => {
    const renderer = render(<ListCard title="Aulas de inglês" initials="MF" />);

    expect(textValues(renderer)).toContain('MF');
    expect(iconNames(renderer)).not.toContain('work');
  });

  it('exibe o ícone padrão quando não há iniciais nem ícone', () => {
    const renderer = render(<ListCard title="Montagem de móveis" />);

    expect(iconNames(renderer)).toContain('work');
  });

  it('exibe o ícone personalizado quando informado sem iniciais', () => {
    const renderer = render(<ListCard title="Pintura interna" icon="format-paint" />);

    expect(iconNames(renderer)).toContain('format-paint');
    expect(iconNames(renderer)).not.toContain('work');
  });

  it('exibe a nota formatada quando rating é informado', () => {
    const renderer = render(<ListCard title="Dedução de impostos" rating={5} />);

    expect(textValues(renderer)).toContain('5.0');
    expect(iconNames(renderer)).toContain('star');
  });

  it('oculta a nota quando rating não é informado', () => {
    const renderer = render(<ListCard title="Consultoria contábil" />);

    expect(iconNames(renderer)).not.toContain('star');
  });

  it('exibe o subtítulo com o ícone padrão de localização', () => {
    const renderer = render(<ListCard title="Limpeza pesada" subtitle="São Paulo" />);

    const subtitleIcon = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'place' && icon.props.size === 13);

    expect(subtitleIcon).toBeDefined();
    expect(textValues(renderer)).toContain('São Paulo');
  });

  it('exibe o subtítulo com o ícone personalizado quando informado', () => {
    const renderer = render(
      <ListCard title="Troca de torneira" subtitle="Hidráulica" subtitleIcon="plumbing" />
    );

    expect(iconNames(renderer)).toContain('plumbing');
  });

  it('oculta o subtítulo quando não informado', () => {
    const renderer = render(<ListCard title="Reparo elétrico" />);

    expect(iconNames(renderer)).not.toContain('place');
    expect(textValues(renderer)).not.toContain('São Paulo');
  });

  it('exibe o preço com a unidade quando informada', () => {
    const renderer = render(
      <ListCard title="Diária completa" price="R$ 150" priceUnit="/ dia" />
    );

    const unit = renderer.root
      .findAllByType(Text)
      .find(
        (node) =>
          Array.isArray(node.props.children) &&
          node.props.children.includes('/ dia')
      );

    expect(unit).toBeDefined();
    expect(
      renderer.root
        .findAllByType(Text)
        .some(
          (node) =>
            Array.isArray(node.props.children) &&
            node.props.children.includes('R$ 150')
        )
    ).toBe(true);
  });

  it('exibe o preço sem unidade quando priceUnit ausente', () => {
    const renderer = render(<ListCard title="Hora técnica" price="R$ 90" />);

    expect(
      renderer.root
        .findAllByType(Text)
        .some(
          (node) =>
            Array.isArray(node.props.children) &&
            node.props.children.includes('R$ 90')
        )
    ).toBe(true);
    expect(
      renderer.root
        .findAllByType(Text)
        .some(
          (node) =>
            Array.isArray(node.props.children) &&
            node.props.children.includes('/ dia')
        )
    ).toBe(false);
  });

  it('oculta o preço quando não informado', () => {
    const renderer = render(<ListCard title="Visita técnica" />);

    expect(textValues(renderer)).not.toContain('R$ 90');
    expect(
      renderer.root
        .findAllByType(Text)
        .some(
          (node) =>
            Array.isArray(node.props.children) &&
            node.props.children.includes('R$ 90')
        )
    ).toBe(false);
  });

  it('exibe o chevron quando trailing é chevron', () => {
    const renderer = render(<ListCard title="Jardinagem" />);

    const chevron = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'chevron-right');

    expect(chevron).toBeDefined();
    expect(chevron?.props.color).toBe(Colors.textMuted);
    expect(favoritePressable(renderer)).toBeUndefined();
  });

  it('oculta o controle final quando trailing é none', () => {
    const renderer = render(<ListCard title="Mudança de mobiliário" trailing="none" />);

    expect(iconNames(renderer)).not.toContain('chevron-right');
    expect(iconNames(renderer)).not.toContain('favorite');
    expect(iconNames(renderer)).not.toContain('favorite-border');
    expect(favoritePressable(renderer)).toBeUndefined();
  });

  it('exibe o favorito preenchido quando favorited é true', () => {
    const renderer = render(
      <ListCard
        title="Faxina geral"
        trailing="favorite"
        favorited
        onToggleFavorite={jest.fn()}
      />
    );

    expect(favoritePressable(renderer)).toBeDefined();
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Remover dos salvos' })
        .length
    ).toBeGreaterThan(0);

    const favorite = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'favorite');

    expect(favorite).toBeDefined();
    expect(favorite?.props.color).toBe(Colors.error);
  });

  it('exibe o favorito vazio quando favorited é false', () => {
    const renderer = render(
      <ListCard title="Montagem de estante" trailing="favorite" />
    );

    expect(favoritePressable(renderer)).toBeDefined();
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Salvar' }).length
    ).toBeGreaterThan(0);

    const favorite = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'favorite-border');

    expect(favorite).toBeDefined();
    expect(favorite?.props.color).toBe(Colors.textMuted);
  });

  it('aciona o callback de favoritar ao tocar no botão de favorito', () => {
    const onToggleFavorite = jest.fn();
    const renderer = render(
      <ListCard
        title="Revisão de auto"
        trailing="favorite"
        onToggleFavorite={onToggleFavorite}
      />
    );

    const favorite = favoritePressable(renderer);

    act(() => {
      favorite.props.onPress();
    });

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('navega ao tocar no cartão', () => {
    const onPress = jest.fn();
    const renderer = render(<ListCard title="Desk setup" onPress={onPress} />);

    const card = cardPressable(renderer);

    act(() => {
      card.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
