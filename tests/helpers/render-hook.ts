import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { createElement, type ReactElement, type ReactNode } from 'react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

/** Renderiza um hook e expõe o último valor retornado. */
export function renderHook<T>(useHook: () => T) {
  const result = { current: undefined as unknown as T };

  function Probe() {
    result.current = useHook();
    return null;
  }

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(createElement(Probe));
  });

  return {
    result,
    unmount: () =>
      act(() => {
        renderer.unmount();
      }),
  };
}

/** Renderiza `children` dentro de um provider arbitrário. */
export function renderWithProvider<T>(
  Provider: (props: { children: ReactNode }) => ReactElement,
  useHook: () => T
) {
  const result = { current: undefined as unknown as T };

  function Probe() {
    result.current = useHook();
    return null;
  }

  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(createElement(Provider, null, createElement(Probe)));
  });

  return {
    result,
    unmount: () =>
      act(() => {
        renderer.unmount();
      }),
  };
}

/** Libera microtasks/timers pendentes dentro de act(). */
export async function flushAsync(): Promise<void> {
  await act(async () => {
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
  });
}
