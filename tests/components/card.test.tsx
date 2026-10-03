import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../components/ui/card';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function cardStyle(renderer: ReactTestRenderer): Record<string, unknown> {
  return StyleSheet.flatten(
    renderer.root.findByType(View).props.style
  ) as Record<string, unknown>;
}

describe('Card', () => {
  it('renderiza o card com sombra por padrão', () => {
    const renderer = render(
      <Card>
        <Text>Conteúdo</Text>
      </Card>
    );

    expect(cardStyle(renderer)).toMatchObject({
      elevation: 3,
      borderWidth: 1,
      borderRadius: 24,
      padding: 20,
    });
    expect(renderer.root.findByType(Text).props.children).toBe('Conteúdo');
  });

  it('renderiza o card flat sem sombra quando flat é verdadeiro', () => {
    const renderer = render(
      <Card flat>
        <Text>Flat</Text>
      </Card>
    );

    const flat = cardStyle(renderer);
    expect(flat.elevation).toBeUndefined();
    expect(flat.boxShadow).toBeUndefined();
    expect(flat).toMatchObject({ borderWidth: 1, borderRadius: 24 });
  });

  it('combina o style recebido com os estilos do card', () => {
    const renderer = render(<Card style={{ marginTop: 8 }} />);

    expect(cardStyle(renderer)).toMatchObject({ marginTop: 8, elevation: 3 });
  });

  it('repassa as demais props para a View', () => {
    const renderer = render(<Card testID="card-1" accessibilityLabel="Painel" />);

    const view = renderer.root.findByType(View);
    expect(view.props.testID).toBe('card-1');
    expect(view.props.accessibilityLabel).toBe('Painel');
  });
});
