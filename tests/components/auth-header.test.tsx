import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthHeader } from '../../components/ui/auth-header';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

describe('AuthHeader', () => {
  it('renderiza o título sem subtítulo quando subtitle não é informado', () => {
    const renderer = render(<AuthHeader title="Entrar" />);

    const texts = renderer.root.findAllByType(Text);
    expect(texts).toHaveLength(1);
    expect(texts[0].props.children).toBe('Entrar');
    expect(StyleSheet.flatten(texts[0].props.style)).toMatchObject({
      fontSize: 34,
      fontWeight: '700',
    });
  });

  it('renderiza o subtítulo quando informado', () => {
    const renderer = render(
      <AuthHeader title="Entrar" subtitle="Acesse sua conta para continuar" />
    );

    const texts = renderer.root.findAllByType(Text);
    expect(texts).toHaveLength(2);
    expect(texts[1].props.children).toBe('Acesse sua conta para continuar');
    expect(StyleSheet.flatten(texts[1].props.style)).toMatchObject({
      fontSize: 16,
    });
  });

  it('mantém a margem inferior do cabeçalho', () => {
    const renderer = render(<AuthHeader title="Entrar" />);

    const header = renderer.root.findAllByType(View)[0];
    expect(StyleSheet.flatten(header.props.style)).toMatchObject({
      marginBottom: 24,
    });
  });
});
