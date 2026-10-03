import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { SuccessMessage } from '../../components/ui/success-message';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

// O ícone MaterialIcons também renderiza um Text com o glifo (children é array).
function texts(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((t) => t.props.children)
    .filter((c): c is string => typeof c === 'string');
}

function iconName(renderer: ReactTestRenderer): string {
  return renderer.root.findByType(MaterialIcons).props.name as string;
}

function iconColor(renderer: ReactTestRenderer): unknown {
  return renderer.root.findByType(MaterialIcons).props.color;
}

function textColor(renderer: ReactTestRenderer, content: string): unknown {
  const node = renderer.root
    .findAllByType(Text)
    .find((t) => t.props.children === content);
  if (!node) {
    return undefined;
  }
  return (StyleSheet.flatten(node.props.style) as Record<string, unknown>)
    .color;
}

function containerStyle(renderer: ReactTestRenderer): Record<string, unknown> {
  return StyleSheet.flatten(
    renderer.root.findByType(View).props.style
  ) as Record<string, unknown>;
}

describe('SuccessMessage', () => {
  it('usa o tom de sucesso por padrão', () => {
    const renderer = render(<SuccessMessage message="Tudo certo!" />);

    expect(iconName(renderer)).toBe('check-circle');
    expect(containerStyle(renderer)).toMatchObject({
      backgroundColor: Colors.successSurface,
    });
    expect(texts(renderer)).toEqual(['Tudo certo!']);
    expect(renderer.root.findByType(View).props.accessibilityRole).toBe('alert');
  });

  it('usa o tom e o ícone de aviso no variant warning', () => {
    const renderer = render(
      <SuccessMessage message="Atenção" variant="warning" />
    );

    expect(iconName(renderer)).toBe('error-outline');
    expect(containerStyle(renderer)).toMatchObject({
      backgroundColor: Colors.warningSurface,
    });
    expect(iconColor(renderer)).toBe(Colors.warningText);
    expect(textColor(renderer, 'Atenção')).toBe(Colors.warningText);
  });

  it('usa o tom de erro no variant error', () => {
    const renderer = render(<SuccessMessage message="Falhou" variant="error" />);

    expect(iconName(renderer)).toBe('error-outline');
    expect(containerStyle(renderer)).toMatchObject({
      backgroundColor: Colors.errorSurface,
    });
    expect(iconColor(renderer)).toBe(Colors.errorText);
    expect(textColor(renderer, 'Falhou')).toBe(Colors.errorText);
  });

  it('usa o tom informativo no variant info', () => {
    const renderer = render(
      <SuccessMessage message="Somente info" variant="info" />
    );

    expect(iconName(renderer)).toBe('info-outline');
    expect(containerStyle(renderer)).toMatchObject({
      backgroundColor: Colors.brandTint,
    });
    expect(iconColor(renderer)).toBe(Colors.brandDark);
    expect(textColor(renderer, 'Somente info')).toBe(Colors.brandDark);
  });

  it('renderiza o título quando informado', () => {
    const renderer = render(
      <SuccessMessage title="Sucesso" message="Cadastro salvo" />
    );

    const title = renderer.root
      .findAllByType(Text)
      .find((t) => t.props.children === 'Sucesso');
    expect(title).toBeDefined();
    expect(
      StyleSheet.flatten(title?.props.style)
    ).toMatchObject({ color: Colors.successText, fontWeight: '800' });
    expect(texts(renderer)).toEqual(['Sucesso', 'Cadastro salvo']);
  });

  it('oculta o título quando não é informado', () => {
    const renderer = render(<SuccessMessage message="Sem título" />);

    expect(texts(renderer)).toEqual(['Sem título']);
  });

  it('combina o style recebido e repassa as demais props', () => {
    const renderer = render(
      <SuccessMessage
        message="Mensagem"
        style={{ marginTop: 4 }}
        testID="alerta-1"
      />
    );

    expect(containerStyle(renderer)).toMatchObject({ marginTop: 4 });
    expect(renderer.root.findByType(View).props.testID).toBe('alerta-1');
  });
});
