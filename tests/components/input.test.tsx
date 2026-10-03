import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

import { Input } from '../../components/ui/input';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function input(renderer: ReactTestRenderer) {
  return renderer.root.findByType(TextInput);
}

function inputStyle(renderer: ReactTestRenderer): Record<string, unknown> {
  return StyleSheet.flatten(input(renderer).props.style) as Record<string, unknown>;
}

function texts(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((t) => t.props.children);
}

describe('Input', () => {
  it('renderiza o rótulo quando informado', () => {
    const renderer = render(<Input label="Nome completo" />);

    expect(texts(renderer)).toContain('Nome completo');
    expect(input(renderer).props.accessibilityLabel).toBe('Nome completo');
  });

  it('omite o rótulo quando não é informado', () => {
    const renderer = render(<Input placeholder="Nome" />);

    expect(texts(renderer)).not.toContain('Nome completo');
    expect(input(renderer).props.accessibilityLabel).toBeUndefined();
  });

  it('exibe o hint quando não há erro', () => {
    const renderer = render(<Input hint="Mínimo de 3 letras" />);

    expect(texts(renderer)).toContain('Mínimo de 3 letras');
    expect(inputStyle(renderer).borderColor).toBe('transparent');
  });

  it('prefere a mensagem de erro sobre o hint', () => {
    const renderer = render(
      <Input error="Campo obrigatório" hint="Mínimo de 3 letras" />
    );

    expect(texts(renderer)).toContain('Campo obrigatório');
    expect(texts(renderer)).not.toContain('Mínimo de 3 letras');
    expect(inputStyle(renderer)).toMatchObject({
      borderColor: Colors.error,
      backgroundColor: Colors.errorSurface,
    });
  });

  it('não exibe mensagens quando não há erro nem hint', () => {
    const renderer = render(<Input placeholder="Nome" />);

    expect(texts(renderer)).toHaveLength(0);
    expect(inputStyle(renderer).backgroundColor).toBe(Colors.surfaceNeutral);
  });

  it('aplica o estilo de foco e repassa onFocus', () => {
    const onFocus = jest.fn();
    const renderer = render(<Input label="E-mail" onFocus={onFocus} />);
    const evento = { target: 'input' } as unknown as Parameters<
      NonNullable<typeof onFocus>
    >[0];

    expect(inputStyle(renderer).borderColor).toBe('transparent');
    act(() => {
      input(renderer).props.onFocus(evento);
    });

    expect(onFocus).toHaveBeenCalledWith(evento);
    expect(inputStyle(renderer)).toMatchObject({
      borderColor: Colors.brandPrimary,
      backgroundColor: Colors.surfaceWhite,
    });
  });

  it('remove o estilo de foco ao sair e repassa onBlur', () => {
    const onBlur = jest.fn();
    const renderer = render(<Input label="E-mail" onBlur={onBlur} />);
    const evento = { target: 'input' } as unknown as Parameters<
      NonNullable<typeof onBlur>
    >[0];

    act(() => {
      input(renderer).props.onFocus(evento);
    });
    act(() => {
      input(renderer).props.onBlur(evento);
    });

    expect(onBlur).toHaveBeenCalledWith(evento);
    expect(inputStyle(renderer).borderColor).toBe('transparent');
    expect(inputStyle(renderer).backgroundColor).toBe(Colors.surfaceNeutral);
  });

  it('funciona sem onFocus e sem onBlur informados', () => {
    const renderer = render(<Input placeholder="Sem callbacks" />);

    expect(() => {
      act(() => {
        input(renderer).props.onFocus({ target: 'input' });
      });
      act(() => {
        input(renderer).props.onBlur({ target: 'input' });
      });
    }).not.toThrow();
    expect(inputStyle(renderer).borderColor).toBe('transparent');
  });

  it('aplica o estilo de erro mantendo o foco', () => {
    const renderer = render(<Input label="Senha" error="Inválida" />);

    act(() => {
      input(renderer).props.onFocus({ target: 'input' });
    });

    expect(inputStyle(renderer)).toMatchObject({
      borderColor: Colors.error,
      backgroundColor: Colors.errorSurface,
    });
  });

  it('aplica o style customizado por cima dos estilos internos', () => {
    const renderer = render(<Input style={{ minHeight: 80 }} />);

    expect(inputStyle(renderer)).toMatchObject({ minHeight: 80 });
  });

  it('repassa as props do TextInput como placeholder, valor e handlers', () => {
    const onChangeText = jest.fn();
    const renderer = render(
      <Input
        placeholder="Digite aqui"
        value="abc"
        multiline
        editable={false}
        onChangeText={onChangeText}
      />
    );

    const field = input(renderer);
    expect(field.props.placeholder).toBe('Digite aqui');
    expect(field.props.value).toBe('abc');
    expect(field.props.multiline).toBe(true);
    expect(field.props.editable).toBe(false);
    expect(field.props.placeholderTextColor).toBe(Colors.textMuted);

    act(() => {
      field.props.onChangeText('abcd');
    });
    expect(onChangeText).toHaveBeenCalledWith('abcd');
  });
});
