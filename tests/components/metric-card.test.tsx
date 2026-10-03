import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MetricCard } from '../../components/ui/metric-card';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

describe('MetricCard', () => {
  it('renderiza valor, rótulo e nota', () => {
    const renderer = render(
      <MetricCard label="Avaliações" value="4,8" note="32 avaliações" />
    );

    const texts = renderer.root.findAllByType(Text);
    expect(texts).toHaveLength(3);
    expect(texts[0].props.children).toBe('4,8');
    expect(texts[1].props.children).toBe('Avaliações');
    expect(texts[2].props.children).toBe('32 avaliações');
  });

  it('limita o valor a uma linha e ajusta a fonte', () => {
    const renderer = render(
      <MetricCard label="Receita" value="R$ 1.240,00" note="no mês" />
    );

    const [value] = renderer.root.findAllByType(Text);
    expect(value.props.numberOfLines).toBe(1);
    expect(value.props.adjustsFontSizeToFit).toBe(true);
  });

  it('limita o rótulo a duas linhas', () => {
    const renderer = render(
      <MetricCard label="Profissionais ativos" value="12" note="hoje" />
    );

    const [, label] = renderer.root.findAllByType(Text);
    expect(label.props.numberOfLines).toBe(2);
  });

  it('aplica o estilo de cartão com borda e fundo branco', () => {
    const renderer = render(
      <MetricCard label="Pedidos" value="7" note="abertos" />
    );

    const style = StyleSheet.flatten(
      renderer.root.findByType(View).props.style
    ) as Record<string, unknown>;
    expect(style).toMatchObject({
      backgroundColor: Colors.white,
      borderWidth: 1,
      minWidth: 80,
    });
  });
});
