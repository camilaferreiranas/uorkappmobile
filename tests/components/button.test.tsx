import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { Button } from '../../components/ui/button';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

/** O Pressable exportado é memo(), então localizamos pelo estilo função. */
function findButton(renderer: ReactTestRenderer) {
  return renderer.root.find(
    (node) =>
      typeof node.props.style === 'function' &&
      node.props.accessibilityRole === 'button'
  );
}

function flattenButtonStyle(
  renderer: ReactTestRenderer,
  pressed: boolean
): Record<string, unknown> {
  return StyleSheet.flatten(
    findButton(renderer).props.style({ pressed })
  ) as Record<string, unknown>;
}

function flattenTextStyle(renderer: ReactTestRenderer): Record<string, unknown> {
  const text = renderer.root.findByType(Text);
  return StyleSheet.flatten(text.props.style) as Record<string, unknown>;
}

describe('Button', () => {
  it('renderiza o título no variant primário por padrão', () => {
    const renderer = render(<Button title="Salvar" />);

    expect(renderer.root.findByType(Text).props.children).toBe('Salvar');
    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });
    expect(findButton(renderer).props.disabled).toBeFalsy();
    expect(
      findButton(renderer).props.accessibilityState
    ).toMatchObject({ disabled: false, busy: false });
  });

  it('aplica os estilos do variant secondary', () => {
    const renderer = render(<Button title="Voltar" variant="secondary" />);

    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.brandDark,
    });
    expect(flattenTextStyle(renderer)).toMatchObject({
      color: Colors.textOnBrand,
    });
  });

  it('aplica os estilos do variant outline', () => {
    const renderer = render(<Button title="Cancelar" variant="outline" />);

    const flat = flattenButtonStyle(renderer, false);
    expect(flat).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: Colors.brandPrimary,
    });
    expect(flattenTextStyle(renderer)).toMatchObject({
      color: Colors.brandPrimary,
    });
  });

  it('aplica os estilos do variant danger', () => {
    const renderer = render(<Button title="Excluir" variant="danger" />);

    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.error,
    });
  });

  it('mostra o ActivityIndicator quando está carregando', () => {
    const renderer = render(<Button title="Salvando" loading />);

    expect(renderer.root.findByType(ActivityIndicator)).toBeTruthy();
    expect(renderer.root.findAllByType(Text)).toHaveLength(0);
    expect(renderer.root.findByType(ActivityIndicator).props.color).toBe(
      Colors.textOnBrand
    );
    const pressable = findButton(renderer);
    expect(pressable.props.disabled).toBe(true);
    expect(pressable.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });

  it('usa a cor da marca no spinner quando o variant é outline', () => {
    const renderer = render(
      <Button title="Salvando" variant="outline" loading />
    );

    expect(renderer.root.findByType(ActivityIndicator).props.color).toBe(
      Colors.brandPrimary
    );
  });

  it('desabilita o botão quando disabled é verdadeiro', () => {
    const renderer = render(<Button title="Indisponível" disabled />);

    const pressable = findButton(renderer);
    expect(pressable.props.disabled).toBe(true);
    expect(pressable.props.accessibilityState).toMatchObject({
      disabled: true,
      busy: false,
    });
    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      backgroundColor: Colors.brandPrimaryMuted,
    });
    expect(flattenTextStyle(renderer)).toMatchObject({
      color: Colors.textOnBrand,
    });
  });

  it('aplica o estilo desabilitado do variant outline', () => {
    const renderer = render(<Button title="Indisponível" variant="outline" disabled />);

    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: Colors.border,
    });
    expect(flattenTextStyle(renderer)).toMatchObject({
      color: Colors.textMuted,
    });
  });

  it('aplica o estilo pressionado quando o botão está habilitado', () => {
    const renderer = render(<Button title="Pressionar" />);

    expect(flattenButtonStyle(renderer, true)).toMatchObject({
      opacity: 0.85,
      transform: [{ scale: 0.99 }],
    });
  });

  it('não aplica o estilo pressionado quando o botão está desabilitado', () => {
    const renderer = render(<Button title="Pressionar" disabled />);

    const flat = flattenButtonStyle(renderer, true);
    expect(flat.opacity).toBeUndefined();
    expect(flat.backgroundColor).toBe(Colors.brandPrimaryMuted);
  });

  it('não aplica o estilo pressionado no outline desabilitado', () => {
    const renderer = render(
      <Button title="Pressionar" variant="outline" disabled />
    );

    const flat = flattenButtonStyle(renderer, true);
    expect(flat.opacity).toBeUndefined();
    expect(flat.borderColor).toBe(Colors.border);
  });

  it('mostra o motivo da desabilitação quando desabilitado sem carregamento', () => {
    const renderer = render(
      <Button title="Agendar" disabled disabledReason="Você já tem um agendamento" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).toContain('Você já tem um agendamento');
  });

  it('oculta o motivo da desabilitação enquanto está carregando', () => {
    const renderer = render(
      <Button title="Agendar" loading disabledReason="Você já tem um agendamento" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).not.toContain('Você já tem um agendamento');
  });

  it('oculta o motivo da desabilitação quando o botão está habilitado', () => {
    const renderer = render(
      <Button title="Agendar" disabledReason="Você já tem um agendamento" />
    );

    const texts = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(texts).not.toContain('Você já tem um agendamento');
  });

  it('oculta a área do motivo quando disabled não informa disabledReason', () => {
    const renderer = render(<Button title="Agendar" disabled />);

    expect(renderer.root.findAllByType(Text)).toHaveLength(1);
  });

  it('aplica style e textStyle customizados', () => {
    const renderer = render(
      <Button
        title="Personalizado"
        style={{ marginTop: 12 }}
        textStyle={{ fontSize: 22 }}
      />
    );

    expect(flattenButtonStyle(renderer, false)).toMatchObject({
      marginTop: 12,
    });
    expect(flattenTextStyle(renderer)).toMatchObject({ fontSize: 22 });
  });

  it('repassa o onPress para o Pressable', () => {
    const onPress = jest.fn();
    const renderer = render(<Button title="Tocar" onPress={onPress} />);

    act(() => {
      findButton(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não aplica estilos de desabilitado quando está habilitado', () => {
    const renderer = render(<Button title="Liberado" variant="outline" />);

    const flat = flattenButtonStyle(renderer, true);
    expect(flat.borderColor).toBe(Colors.brandPrimary);
    expect(flattenTextStyle(renderer)).toMatchObject({
      color: Colors.brandPrimary,
    });
  });
});
