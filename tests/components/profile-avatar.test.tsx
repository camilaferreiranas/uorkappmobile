import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { Image } from 'expo-image';

import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { Colors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

describe('ProfileAvatar', () => {
  it('renderiza as iniciais com os valores padrão quando não há imagem', () => {
    const renderer = render(<ProfileAvatar initials="MC" />);

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);

    const text = renderer.root.findByType(Text);
    expect(text.props.children).toBe('MC');
    expect(text.props.style[1]).toEqual({
      color: Colors.white,
      fontSize: 80 * 0.34,
    });

    const container = text.parent;
    expect(container?.props.style[1]).toEqual({
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors.primary,
      borderColor: 'transparent',
      borderWidth: 0,
    });
    expect(container?.props.style[2]).toBeUndefined();
  });

  it('renderiza a imagem quando imageUrl é informada', () => {
    const uri = 'https://cdn.exemplo.com/foto.png';
    const renderer = render(<ProfileAvatar initials="MC" imageUrl={uri} />);

    expect(renderer.root.findAllByType(Text)).toHaveLength(0);

    const image = renderer.root.findByType(Image);
    expect(image.props.source).toEqual({ uri, cacheKey: uri });
    expect(image.props.recyclingKey).toBe(uri);
    expect(image.props.contentFit).toBe('cover');
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.transition).toBe(180);
    expect(image.props.style).toBeDefined();
  });

  it('remove a query string e o fragmento da chave de cache da imagem', () => {
    const renderer = render(
      <ProfileAvatar
        initials="MC"
        imageUrl="https://cdn.exemplo.com/foto.png?w=200#principal"
      />
    );

    const image = renderer.root.findByType(Image);
    expect(image.props.source).toEqual({
      uri: 'https://cdn.exemplo.com/foto.png?w=200#principal',
      cacheKey: 'https://cdn.exemplo.com/foto.png',
    });
    expect(image.props.recyclingKey).toBe('https://cdn.exemplo.com/foto.png');
  });

  it('renderiza as iniciais quando imageUrl é null', () => {
    const renderer = render(<ProfileAvatar initials="AB" imageUrl={null} />);

    expect(renderer.root.findAllByType(Image)).toHaveLength(0);
    expect(renderer.root.findByType(Text).props.children).toBe('AB');
  });

  it('aplica tamanho, cores e estilo personalizados', () => {
    const customStyle = { margin: 6 };
    const renderer = render(
      <ProfileAvatar
        initials="AB"
        imageUrl={null}
        size={48}
        backgroundColor="#123456"
        initialsColor="#654321"
        borderColor="#000000"
        borderWidth={2}
        style={customStyle}
      />
    );

    const text = renderer.root.findByType(Text);
    expect(text.props.style[1]).toEqual({
      color: '#654321',
      fontSize: 48 * 0.34,
    });

    const container = text.parent;
    expect(container?.props.style[1]).toEqual({
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#123456',
      borderColor: '#000000',
      borderWidth: 2,
    });
    expect(container?.props.style[2]).toBe(customStyle);
  });
});
