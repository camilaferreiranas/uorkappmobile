import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';
import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Select } from '../../components/ui/select';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

// Evita o carregamento assíncrono de fontes do ícone (setState fora de act()).
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

const OPTIONS = ['Manhã', 'Tarde', 'Noite'];

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function findPressables(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function'
  );
}

function findIcons(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      typeof node.props.name === 'string' && typeof node.props.size === 'number'
  );
}

function texts(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((t) => t.props.children);
}

function pressInput(renderer: ReactTestRenderer) {
  act(() => {
    findPressables(renderer)[0].props.onPress();
  });
}

function inputStyle(renderer: ReactTestRenderer): Record<string, unknown> {
  return StyleSheet.flatten(findPressables(renderer)[0].props.style) as Record<
    string,
    unknown
  >;
}

describe('Select', () => {
  it('renderiza fechado com placeholder e seta para baixo', () => {
    const onSelect = jest.fn();
    const renderer = render(
      <Select value="" options={OPTIONS} placeholder="Selecione" onSelect={onSelect} />
    );

    const pressables = findPressables(renderer);
    expect(pressables).toHaveLength(1);
    expect(pressables[0].props.accessibilityState).toEqual({ expanded: false });
    expect(texts(renderer)).toContain('Selecione');
    expect(findIcons(renderer)[0].props.name).toBe('keyboard-arrow-down');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('aplica o estilo de placeholder quando o valor está vazio', () => {
    const renderer = render(
      <Select value="" options={OPTIONS} placeholder="Selecione" onSelect={jest.fn()} />
    );

    const valueText = renderer.root.find(
      (node) => node.type === Text && node.props.children === 'Selecione'
    );
    expect(StyleSheet.flatten(valueText.props.style).color).toBe(Colors.textMuted);
  });

  it('exibe o valor selecionado sem o estilo de placeholder', () => {
    const renderer = render(
      <Select value="Tarde" options={OPTIONS} onSelect={jest.fn()} />
    );

    const valueText = renderer.root.find(
      (node) => node.type === Text && node.props.children === 'Tarde'
    );
    expect(StyleSheet.flatten(valueText.props.style).color).toBe(Colors.textPrimary);
    expect(texts(renderer)).not.toContain('Selecione');
  });

  it('exibe o rótulo quando informado e o omite quando ausente', () => {
    const comLabel = render(
      <Select
        label="Período"
        value=""
        options={OPTIONS}
        onSelect={jest.fn()}
      />
    );
    expect(texts(comLabel)).toContain('Período');

    const semLabel = render(
      <Select value="" options={OPTIONS} onSelect={jest.fn()} />
    );
    expect(texts(semLabel)).not.toContain('Período');
  });

  it('abre o dropdown ao tocar no campo', () => {
    const renderer = render(
      <Select value="" options={OPTIONS} placeholder="Selecione" onSelect={jest.fn()} />
    );

    pressInput(renderer);

    const pressables = findPressables(renderer);
    expect(pressables).toHaveLength(1 + OPTIONS.length);
    expect(pressables[0].props.accessibilityState).toEqual({ expanded: true });
    expect(findIcons(renderer)[0].props.name).toBe('keyboard-arrow-up');
    expect(texts(renderer)).toEqual(expect.arrayContaining(OPTIONS));
  });

  it('fecha o dropdown ao tocar novamente no campo', () => {
    const renderer = render(
      <Select value="" options={OPTIONS} onSelect={jest.fn()} />
    );

    pressInput(renderer);
    pressInput(renderer);

    expect(findPressables(renderer)).toHaveLength(1);
    expect(findPressables(renderer)[0].props.accessibilityState).toEqual({
      expanded: false,
    });
    expect(findIcons(renderer)[0].props.name).toBe('keyboard-arrow-down');
  });

  it('chama onSelect com a opção escolhida e fecha o dropdown', () => {
    const onSelect = jest.fn();
    const renderer = render(
      <Select value="" options={OPTIONS} onSelect={onSelect} />
    );

    pressInput(renderer);
    const options = findPressables(renderer).slice(1);
    act(() => {
      options[1].props.onPress();
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Tarde');
    expect(findPressables(renderer)).toHaveLength(1);
    expect(findPressables(renderer)[0].props.accessibilityState).toEqual({
      expanded: false,
    });
  });

  it('aplica o estilo aberto quando o dropdown está expandido', () => {
    const renderer = render(
      <Select value="" options={OPTIONS} onSelect={jest.fn()} />
    );

    expect(inputStyle(renderer).borderColor).toBe('transparent');
    pressInput(renderer);

    const flat = inputStyle(renderer);
    expect(flat.borderColor).toBe(Colors.brandPrimary);
    expect(flat.backgroundColor).toBe(Colors.surfaceWhite);
  });

  it('exibe a mensagem de erro com o estilo de erro', () => {
    const renderer = render(
      <Select
        value=""
        options={OPTIONS}
        error="Campo obrigatório"
        onSelect={jest.fn()}
      />
    );

    expect(texts(renderer)).toContain('Campo obrigatório');
    const flat = inputStyle(renderer);
    expect(flat.borderColor).toBe(Colors.error);
    expect(flat.backgroundColor).toBe(Colors.errorSurface);
  });

  it('mantém o estilo de erro com o dropdown aberto', () => {
    const renderer = render(
      <Select
        value=""
        options={OPTIONS}
        error="Campo obrigatório"
        onSelect={jest.fn()}
      />
    );

    pressInput(renderer);

    expect(renderer.root.find((n) => n.type === Text && n.props.children === 'Campo obrigatório')).toBeTruthy();
    const style = findPressables(renderer)[0].props.style as unknown[];
    expect(style[1]).toBeTruthy();
    expect(inputStyle(renderer).borderColor).toBe(Colors.error);
    expect(findPressables(renderer)).toHaveLength(1 + OPTIONS.length);
  });

  it('renderiza a marca de seleção apenas na opção escolhida', () => {
    const renderer = render(
      <Select value="Tarde" options={OPTIONS} onSelect={jest.fn()} />
    );

    pressInput(renderer);

    const options = findPressables(renderer).slice(1);
    const optionsComCheck = options.filter(
      (option) => option.findAll((node) => node.props?.name === 'check').length > 0
    );

    expect(optionsComCheck).toHaveLength(1);
    const textsDaOpcao = optionsComCheck[0]
      .findAll((node) => node.type === Text)
      .map((node) => node.props.children);
    expect(textsDaOpcao).toContain('Tarde');
  });

  it('aplica o estilo pressionado nas opções', () => {
    const renderer = render(
      <Select value="" options={OPTIONS} onSelect={jest.fn()} />
    );

    pressInput(renderer);
    const option = findPressables(renderer)[1];

    const pressed = StyleSheet.flatten(option.props.style({ pressed: true }));
    const released = StyleSheet.flatten(option.props.style({ pressed: false }));

    expect(pressed.backgroundColor).toBe(Colors.brandTint);
    expect(released.backgroundColor).toBeUndefined();
  });

  it('renderiza o dropdown vazio quando não há opções', () => {
    const renderer = render(<Select value="" options={[]} onSelect={jest.fn()} />);

    pressInput(renderer);

    expect(findPressables(renderer)).toHaveLength(1);
    expect(findPressables(renderer)[0].props.accessibilityState).toEqual({
      expanded: true,
    });
  });
});
