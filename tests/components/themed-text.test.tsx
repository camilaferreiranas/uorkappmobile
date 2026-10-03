import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let mockScheme: string | null = 'light';
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockScheme,
}));

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function styleOf(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findByType(Text).props.style as unknown[];
}

describe('ThemedText', () => {
  beforeEach(() => {
    mockScheme = 'light';
  });

  it('aplica o estilo padrão quando type não é informado', () => {
    const renderer = render(<ThemedText>Olá</ThemedText>);
    const style = styleOf(renderer);

    expect(style).toHaveLength(7);
    expect(style[0]).toEqual({ color: Colors.light.text });
    expect(style[1]).toMatchObject({ fontSize: 16, lineHeight: 24 });
    expect(style[2]).toBeUndefined();
    expect(style[3]).toBeUndefined();
    expect(style[4]).toBeUndefined();
    expect(style[5]).toBeUndefined();
    expect(style[6]).toBeUndefined();
    expect(renderer.root.findByType(Text).props.children).toBe('Olá');
  });

  it('aplica somente o estilo de título quando type é title', () => {
    const renderer = render(<ThemedText type="title">Título</ThemedText>);
    const style = styleOf(renderer);

    expect(style[1]).toBeUndefined();
    expect(style[2]).toMatchObject({ fontSize: 32, fontWeight: 'bold', lineHeight: 32 });
    expect(style[3]).toBeUndefined();
    expect(style[4]).toBeUndefined();
    expect(style[5]).toBeUndefined();
  });

  it('aplica somente o estilo semibold quando type é defaultSemiBold', () => {
    const renderer = render(
      <ThemedText type="defaultSemiBold">Destaque</ThemedText>
    );
    const style = styleOf(renderer);

    expect(style[1]).toBeUndefined();
    expect(style[2]).toBeUndefined();
    expect(style[3]).toMatchObject({ fontSize: 16, lineHeight: 24, fontWeight: '600' });
    expect(style[4]).toBeUndefined();
    expect(style[5]).toBeUndefined();
  });

  it('aplica somente o estilo de subtítulo quando type é subtitle', () => {
    const renderer = render(<ThemedText type="subtitle">Subtítulo</ThemedText>);
    const style = styleOf(renderer);

    expect(style[1]).toBeUndefined();
    expect(style[2]).toBeUndefined();
    expect(style[3]).toBeUndefined();
    expect(style[4]).toMatchObject({ fontSize: 20, fontWeight: 'bold' });
    expect(style[5]).toBeUndefined();
  });

  it('aplica somente o estilo de link quando type é link', () => {
    const renderer = render(
      <ThemedText type="link">Esqueci a senha</ThemedText>
    );
    const style = styleOf(renderer);

    expect(style[1]).toBeUndefined();
    expect(style[2]).toBeUndefined();
    expect(style[3]).toBeUndefined();
    expect(style[4]).toBeUndefined();
    expect(style[5]).toMatchObject({ fontSize: 16, lineHeight: 30, color: Colors.primary });
  });

  it('combina o style personalizado ao final e repassa numberOfLines e testID', () => {
    const customStyle = { marginTop: 12 };
    const renderer = render(
      <ThemedText type="title" style={customStyle} numberOfLines={3} testID="texto-tema">
        Uma linha
      </ThemedText>
    );
    const text = renderer.root.findByType(Text);
    const style = text.props.style as unknown[];

    expect(style[2]).toMatchObject({ fontSize: 32 });
    expect(style[1]).toBeUndefined();
    expect(style[6]).toBe(customStyle);
    expect(text.props.numberOfLines).toBe(3);
    expect(text.props.testID).toBe('texto-tema');
  });

  it('usa lightColor quando o esquema atual é claro', () => {
    mockScheme = 'light';
    const renderer = render(<ThemedText lightColor="#123456">Oi</ThemedText>);

    expect(styleOf(renderer)[0]).toEqual({ color: '#123456' });
  });

  it('usa darkColor quando o esquema atual é escuro', () => {
    mockScheme = 'dark';
    const renderer = render(<ThemedText darkColor="#654321">Oi</ThemedText>);

    expect(styleOf(renderer)[0]).toEqual({ color: '#654321' });
  });

  it('cai para a cor do tema escuro quando nenhuma cor é informada', () => {
    mockScheme = 'dark';
    const renderer = render(<ThemedText>Sem cor</ThemedText>);

    expect(styleOf(renderer)[0]).toEqual({ color: Colors.dark.text });
  });

  it('ignora lightColor quando o esquema atual é escuro', () => {
    mockScheme = 'dark';
    const renderer = render(<ThemedText lightColor="#123456">Oi</ThemedText>);

    expect(styleOf(renderer)[0]).toEqual({ color: Colors.dark.text });
  });

  it('assume o esquema claro quando o sistema não informa o esquema', () => {
    mockScheme = null;
    const renderer = render(<ThemedText lightColor="#123456">Oi</ThemedText>);

    expect(styleOf(renderer)[0]).toEqual({ color: '#123456' });
  });
});
