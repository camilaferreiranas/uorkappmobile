import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { IconSymbol } from '../../components/ui/icon-symbol.tsx';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

describe('IconSymbol', () => {
  it('renderiza o MaterialIcons com o nome mapeado', () => {
    const renderer = render(<IconSymbol name="magnifyingglass" color="#000" />);

    const icon = renderer.root.findByType(MaterialIcons);
    expect(icon.props).toMatchObject({
      name: 'search',
      color: '#000',
      size: 24,
    });
  });

  it('usa o tamanho padrão de 24 quando size não é informado', () => {
    const renderer = render(<IconSymbol name="chevron.right" color="#111" />);

    expect(renderer.root.findByType(MaterialIcons).props.size).toBe(24);
    expect(renderer.root.findByType(MaterialIcons).props.name).toBe(
      'chevron-right'
    );
  });

  it('usa o size e o style informados', () => {
    const renderer = render(
      <IconSymbol
        name="plus.circle.fill"
        color="#F00"
        size={32}
        style={{ margin: 4 }}
      />
    );

    const icon = renderer.root.findByType(MaterialIcons);
    expect(icon.props.size).toBe(32);
    expect(icon.props.style).toEqual({ margin: 4 });
    expect(icon.props.name).toBe('add-circle');
  });

  it('resolve todos os nomes suportados pelo mapeamento', () => {
    const names: [string, string][] = [
      ['magnifyingglass', 'search'],
      ['plus.circle.fill', 'add-circle'],
      ['person.fill', 'person'],
      ['doc.text.fill', 'description'],
      ['house.fill', 'home'],
      ['paperplane.fill', 'send'],
      ['square.grid.2x2.fill', 'grid-view'],
      ['chevron.left.forwardslash.chevron.right', 'code'],
      ['chevron.right', 'chevron-right'],
    ];

    for (const [name, mapped] of names) {
      const renderer = render(
        <IconSymbol name={name as 'chevron.right'} color="#000" />
      );
      expect(renderer.root.findByType(MaterialIcons).props.name).toBe(mapped);
    }
  });
});
