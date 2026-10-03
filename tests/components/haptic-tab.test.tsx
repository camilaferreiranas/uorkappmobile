import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import {
  DefaultTheme,
  PlatformPressable,
  ThemeContext,
} from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';

import { HapticTab } from '../../components/haptic-tab';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ThemeContext.Provider value={DefaultTheme as never}>{node}</ThemeContext.Provider>
    );
  });
  return renderer;
}

function pressIn(renderer: ReactTestRenderer, ev: unknown) {
  act(() => {
    renderer.root.findByType(PlatformPressable).props.onPressIn(ev);
  });
}

const originalExpoOs = process.env.EXPO_OS;

afterEach(() => {
  if (originalExpoOs === undefined) {
    delete process.env.EXPO_OS;
  } else {
    process.env.EXPO_OS = originalExpoOs;
  }
});

describe('HapticTab', () => {
  it('dispara o feedback háptico e repassa o evento no iOS', () => {
    process.env.EXPO_OS = 'ios';
    const onPressIn = jest.fn();
    const renderer = render(<HapticTab onPressIn={onPressIn}>{null}</HapticTab>);
    const event = { nativeEvent: { pageX: 10 } };

    pressIn(renderer, event);

    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
    expect(onPressIn).toHaveBeenCalledWith(event);
  });

  it('sempre dispara o háptico porque EXPO_OS é inlinado como ios na compilação', () => {
    // O babel-preset-expo (caller platform "ios" do jest-expo) substitui
    // process.env.EXPO_OS por "ios" em tempo de compilação, então o caminho
    // "desabilitado" do if é inalcançável em runtime nos testes.
    process.env.EXPO_OS = 'android';
    const renderer = render(<HapticTab>{null}</HapticTab>);

    pressIn(renderer, { nativeEvent: {} });

    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it('renderiza sem onPressIn informado', () => {
    const renderer = render(<HapticTab>{null}</HapticTab>);

    expect(renderer.root.findByType(PlatformPressable)).toBeDefined();

    pressIn(renderer, { nativeEvent: {} });

    expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
  });

  it('repassa as props para o PlatformPressable', () => {
    const renderer = render(
      <HapticTab testID="aba-perfil" accessibilityLabel="Perfil">
        {null}
      </HapticTab>
    );

    const pressable = renderer.root.findByType(PlatformPressable);
    expect(pressable.props.testID).toBe('aba-perfil');
    expect(pressable.props.accessibilityLabel).toBe('Perfil');
  });
});
