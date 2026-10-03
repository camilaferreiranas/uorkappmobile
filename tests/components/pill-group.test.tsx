import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';
import type { ReactElement } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PillGroup } from '../../components/ui/pill-group';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const OPTIONS = ['Presencial', 'Remoto', 'Híbrido'];

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function findPills(renderer: ReactTestRenderer): ReactTestInstance[] {
  return renderer.root.findAll(
    (node) =>
      typeof node.props.style === 'function' &&
      node.props.accessibilityRole === 'button'
  );
}

function pillStyle(
  pill: ReactTestInstance,
  pressed: boolean
): Record<string, unknown> {
  return StyleSheet.flatten(pill.props.style({ pressed })) as Record<string, unknown>;
}

function textOf(pill: ReactTestInstance): ReactTestInstance {
  return pill.findAll(
    (node) => node.type === Text && typeof node.props.children === 'string'
  )[0];
}

describe('PillGroup', () => {
  it('renderiza o rótulo quando informado', () => {
    const renderer = render(
      <PillGroup label="Formato" options={OPTIONS} value="" onSelect={jest.fn()} />
    );

    const labels = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(labels).toContain('Formato');
    expect(labels).toEqual(
      expect.arrayContaining(['Presencial', 'Remoto', 'Híbrido'])
    );
  });

  it('omite o rótulo quando não é informado', () => {
    const renderer = render(
      <PillGroup options={OPTIONS} value="" onSelect={jest.fn()} />
    );

    const labels = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(labels).not.toContain('Formato');
  });

  it('marca apenas a opção igual ao valor como selecionada', () => {
    const renderer = render(
      <PillGroup options={OPTIONS} value="Remoto" onSelect={jest.fn()} />
    );

    const pills = findPills(renderer);
    expect(pills).toHaveLength(OPTIONS.length);
    expect(pills.map((p) => p.props.accessibilityState.selected)).toEqual([
      false,
      true,
      false,
    ]);
    expect(
      pills.map(
        (p) => StyleSheet.flatten(textOf(p).props.style).color === Colors.textOnBrand
      )
    ).toEqual([false, true, false]);
  });

  it('mantém todas as opções inativas quando o valor não corresponde', () => {
    const renderer = render(
      <PillGroup options={OPTIONS} value="Escrório" onSelect={jest.fn()} />
    );

    expect(
      findPills(renderer).map((p) => p.props.accessibilityState.selected)
    ).toEqual([false, false, false]);
  });

  it('aplica o estilo pressionado apenas nas opções inativas', () => {
    const renderer = render(
      <PillGroup options={OPTIONS} value="Remoto" onSelect={jest.fn()} />
    );

    const [inativo, ativo] = findPills(renderer);

    expect(pillStyle(inativo, true)).toMatchObject({
      backgroundColor: Colors.brandTint,
    });
    expect(pillStyle(inativo, false)).toMatchObject({
      backgroundColor: Colors.surfaceNeutral,
    });
    expect(pillStyle(ativo, true)).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });
    expect(pillStyle(ativo, true).backgroundColor).not.toBe(Colors.brandTint);
    expect(pillStyle(ativo, false)).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });
  });

  it('chama onSelect com a opção escolhida', () => {
    const onSelect = jest.fn();
    const renderer = render(
      <PillGroup label="Formato" options={OPTIONS} value="" onSelect={onSelect} />
    );

    const pills = findPills(renderer);
    act(() => {
      pills[2].props.onPress();
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('Híbrido');
  });

  it('renderiza sem opções quando a lista está vazia', () => {
    const renderer = render(
      <PillGroup label="Formato" options={[]} value="" onSelect={jest.fn()} />
    );

    expect(findPills(renderer)).toHaveLength(0);
    const labels = renderer.root
      .findAllByType(Text)
      .map((t) => t.props.children);
    expect(labels).toEqual(['Formato']);
  });
});
