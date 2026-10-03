import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { ScreenContainer } from '../../components/ui/screen-container';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

describe('ScreenContainer', () => {
  it('usa comportamento de padding no iOS com fundo padrão', () => {
    const spy = jest.replaceProperty(Platform, 'OS', 'ios');
    try {
      const renderer = render(
        <ScreenContainer>
          <Text>Olá</Text>
        </ScreenContainer>
      );

      const kav = renderer.root.findByType(KeyboardAvoidingView);
      expect(kav.props.behavior).toBe('padding');
      expect(
        StyleSheet.flatten(kav.props.style).backgroundColor
      ).toBe(Colors.surfaceWhite);
      expect(renderer.root.findByType(Text).props.children).toBe('Olá');
    } finally {
      spy.restore();
    }
  });

  it('usa comportamento de height fora do iOS', () => {
    const spy = jest.replaceProperty(Platform, 'OS', 'android');
    try {
      const renderer = render(<ScreenContainer>conteúdo</ScreenContainer>);

      expect(renderer.root.findByType(KeyboardAvoidingView).props.behavior).toBe(
        'height'
      );
    } finally {
      spy.restore();
    }
  });

  it('aplica o backgroundColor personalizado', () => {
    const renderer = render(
      <ScreenContainer backgroundColor="#FF0000">x</ScreenContainer>
    );

    const kav = renderer.root.findByType(KeyboardAvoidingView);
    expect(StyleSheet.flatten(kav.props.style)).toMatchObject({
      backgroundColor: '#FF0000',
      flex: 1,
    });
  });

  it('combina o contentContainerStyle com o estilo padrão do scroll', () => {
    const renderer = render(
      <ScreenContainer contentContainerStyle={{ paddingBottom: 10 }}>
        <Text>filho</Text>
      </ScreenContainer>
    );

    const scroll = renderer.root.findByType(ScrollView);
    const flat = StyleSheet.flatten(
      scroll.props.contentContainerStyle
    ) as Record<string, unknown>;
    expect(flat).toMatchObject({ flexGrow: 1, paddingBottom: 10 });
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('mantém o estilo padrão do scroll quando contentContainerStyle não é informado', () => {
    const renderer = render(<ScreenContainer>filho</ScreenContainer>);

    const scroll = renderer.root.findByType(ScrollView);
    expect(scroll.props.contentContainerStyle[1]).toBeUndefined();
    expect(
      StyleSheet.flatten(scroll.props.contentContainerStyle)
    ).toMatchObject({ flexGrow: 1 });
  });
});
