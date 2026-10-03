import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '../../components/ui/section-header';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function texts(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((t) => String(t.props.children));
}

// React 19 + RN: o export Pressable é um React.memo, então o fiber usa o tipo interno.
const pressableType = (Pressable as unknown as { type: unknown }).type;

function findActions(renderer: ReactTestRenderer) {
  return renderer.root.findAll((node) => node.type === pressableType);
}

function findAction(renderer: ReactTestRenderer) {
  return findActions(renderer)[0];
}

describe('SectionHeader', () => {
  it('renderiza apenas o título quando não há subtítulo nem ação', () => {
    const renderer = render(<SectionHeader title="Profissionais" />);

    expect(texts(renderer)).toEqual(['Profissionais']);
    expect(findActions(renderer)).toHaveLength(0);
  });

  it('renderiza o subtítulo quando informado', () => {
    const renderer = render(
      <SectionHeader title="Profissionais" subtitle="12 encontrados" />
    );

    expect(texts(renderer)).toEqual(['Profissionais', '12 encontrados']);
  });

  it('renderiza a ação quando actionLabel é informado', () => {
    const renderer = render(
      <SectionHeader title="Categorias" actionLabel="Ver todos" />
    );

    const action = findAction(renderer);
    expect(action.props.accessibilityRole).toBe('button');
    expect(action.props.hitSlop).toBe(8);
    expect(texts(renderer)).toContain('Ver todos');
  });

  it('executa onAction ao pressionar a ação', () => {
    const onAction = jest.fn();
    const renderer = render(
      <SectionHeader title="Categorias" actionLabel="Ver todos" onAction={onAction} />
    );

    act(() => {
      findAction(renderer).props.onPress();
    });

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('aplica o estilo de pressionado apenas quando pressed é verdadeiro', () => {
    const renderer = render(
      <SectionHeader title="Categorias" actionLabel="Ver todos" />
    );

    const { style } = findAction(renderer).props;
    expect(StyleSheet.flatten(style({ pressed: true }))).toMatchObject({
      opacity: 0.6,
    });
    expect(style({ pressed: false })).toBe(false);
  });

  it('combina o style recebido no container', () => {
    const renderer = render(
      <SectionHeader title="Categorias" style={{ marginTop: 4 }} />
    );

    const container = renderer.root.findAllByType(View)[0];
    const flat = StyleSheet.flatten(container.props.style);
    expect(flat).toMatchObject({ marginTop: 4, marginBottom: 12 });
    expect(
      StyleSheet.flatten(renderer.root.findAllByType(Text)[0].props.style)
    ).toMatchObject({ color: Colors.textPrimary });
  });
});
