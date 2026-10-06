import {
  act,
  create as createRenderer,
  type ReactTestRenderer,
} from 'react-test-renderer';

export { act, type ReactTestRenderer, type ReactTestInstance } from 'react-test-renderer';

const renderers = new Set<ReactTestRenderer>();

/** Track mounted trees so effects and native list timers cannot outlive a test. */
export const create: typeof createRenderer = (...args) => {
  const renderer = createRenderer(...args);
  renderers.add(renderer);
  return renderer;
};

afterEach(async () => {
  await act(async () => {
    for (const renderer of renderers) renderer.unmount();
    renderers.clear();
    await new Promise<void>((resolve) => setImmediate(resolve));
  });
});
