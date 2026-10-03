import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function textValues(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((node) => node.props.children);
}

describe('GoogleSignInButton', () => {
  it('renderiza o rótulo padrão sem estados especiais', () => {
    const onPress = jest.fn();
    const renderer = render(<GoogleSignInButton onPress={onPress} />);

    const button = renderer.root.findByType(TouchableOpacity);
    expect(textValues(renderer)).toContain('Continuar com Google');
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(button.props.disabled).toBe(false);
    expect((button.props.style as unknown[])[1]).toBe(false);
    expect(button.props.activeOpacity).toBe(0.8);

    const icon = renderer.root.findByType(AntDesign);
    expect(icon.props.name).toBe('google');
    expect(icon.props.color).toBe('#EA4335');
    expect(icon.props.size).toBe(20);
  });

  it('renderiza o rótulo personalizado', () => {
    const renderer = render(
      <GoogleSignInButton label="Entrar com conta Google" onPress={jest.fn()} />
    );

    expect(textValues(renderer)).toContain('Entrar com conta Google');
    expect(textValues(renderer)).not.toContain('Continuar com Google');
  });

  it('exibe o indicador de carregamento quando loading é true', () => {
    const renderer = render(
      <GoogleSignInButton onPress={jest.fn()} loading />
    );

    const button = renderer.root.findByType(TouchableOpacity);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(textValues(renderer)).not.toContain('Continuar com Google');
    expect(button.props.disabled).toBe(true);
    expect((button.props.style as unknown[])[1]).toMatchObject({ opacity: 0.6 });
  });

  it('aplica o estilo desabilitado quando disabled é true', () => {
    const renderer = render(
      <GoogleSignInButton label="Continuar" onPress={jest.fn()} disabled />
    );

    const button = renderer.root.findByType(TouchableOpacity);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    expect(textValues(renderer)).toContain('Continuar');
    expect(button.props.disabled).toBe(true);
    expect((button.props.style as unknown[])[1]).toMatchObject({ opacity: 0.6 });
  });

  it('fica desabilitado e mostra o indicador quando disabled e loading são informados', () => {
    const renderer = render(
      <GoogleSignInButton onPress={jest.fn()} disabled loading />
    );

    const button = renderer.root.findByType(TouchableOpacity);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
    expect(button.props.disabled).toBe(true);
    expect((button.props.style as unknown[])[1]).toMatchObject({ opacity: 0.6 });
  });

  it('chama onPress ao tocar no botão', () => {
    const onPress = jest.fn();
    const renderer = render(<GoogleSignInButton onPress={onPress} />);

    const button = renderer.root.findByType(TouchableOpacity);
    act(() => {
      button.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
