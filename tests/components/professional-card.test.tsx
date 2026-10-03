import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { type ReactElement } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ProfessionalCard } from '../../components/ui/professional-card';
import { Colors } from '../../constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

/** Textos simples renderizados (ignora os glifos dos ícones, que são arrays). */
function strings(renderer: ReactTestRenderer): string[] {
  return renderer.root
    .findAllByType(Text)
    .map((t) => t.props.children)
    .filter((c): c is string => typeof c === 'string');
}

function findButton(renderer: ReactTestRenderer) {
  return renderer.root.findByType(TouchableOpacity);
}

const base = {
  rating: 4,
  distance: '1 km',
  initials: 'M',
} as const;

describe('ProfessionalCard', () => {
  it('renderiza o nome, a especialidade e as métricas', () => {
    const renderer = render(
      <ProfessionalCard
        name="Maria Souza"
        specialty="Eletricista"
        rating={4.732}
        distance="2,4 km"
        initials="MS"
      />
    );

    expect(strings(renderer)).toEqual([
      'MS',
      'Maria Souza',
      'Eletricista',
      '4.7',
      '2,4 km',
      'Ver perfil',
    ]);
  });

  it('usa o role quando specialty não é informado', () => {
    const renderer = render(
      <ProfessionalCard
        name="João Lima"
        role="Encanador"
        rating={5}
        distance="1 km"
        initials="JL"
      />
    );

    expect(strings(renderer)).toEqual([
      'JL',
      'João Lima',
      'Encanador',
      '5.0',
      '1 km',
      'Ver perfil',
    ]);
  });

  it('não renderiza o cargo quando specialty e role não são informados', () => {
    const renderer = render(<ProfessionalCard name="Ana" {...base} />);

    expect(strings(renderer)).toEqual([
      'M',
      'Ana',
      '4.0',
      '1 km',
      'Ver perfil',
    ]);
  });

  it('usa o handler de onButtonPress quando informado', () => {
    const onButtonPress = jest.fn();
    const onPress = jest.fn();
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        onPress={onPress}
        onButtonPress={onButtonPress}
      />
    );

    act(() => {
      findButton(renderer).props.onPress();
    });

    expect(onButtonPress).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('usa o onPress quando onButtonPress não é informado', () => {
    const onPress = jest.fn();
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        onPress={onPress}
      />
    );

    act(() => {
      findButton(renderer).props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mantém onPress undefined quando nenhum handler é informado', () => {
    const renderer = render(
      <ProfessionalCard name="Maria" specialty="Eletricista" {...base} />
    );

    expect(findButton(renderer).props.onPress).toBeUndefined();
  });

  it('usa o título padrão do botão', () => {
    const renderer = render(
      <ProfessionalCard name="Maria" specialty="Eletricista" {...base} />
    );

    expect(strings(renderer)).toContain('Ver perfil');
  });

  it('usa o título personalizado do botão quando informado', () => {
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        buttonTitle="Contratar"
      />
    );

    expect(strings(renderer)).toContain('Contratar');
    expect(strings(renderer)).not.toContain('Ver perfil');
  });

  it('renderiza as iniciais quando não há imagem', () => {
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        initials="MS"
        imageUrl={null}
      />
    );

    expect(strings(renderer)).toContain('MS');
  });

  it('renderiza a imagem quando imageUrl é informado', () => {
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        initials="MS"
        imageUrl="https://example.com/foto.png?v=1"
      />
    );

    expect(
      renderer.root.findByProps({
        recyclingKey: 'https://example.com/foto.png',
      })
    ).toBeDefined();
    expect(strings(renderer)).not.toContain('MS');
  });

  it('combina o style recebido com o estilo do cartão', () => {
    const renderer = render(
      <ProfessionalCard
        name="Maria"
        specialty="Eletricista"
        {...base}
        style={{ marginTop: 6 }}
      />
    );

    const flat = StyleSheet.flatten(
      renderer.root.findAllByType(View)[0].props.style
    ) as Record<string, unknown>;
    expect(flat).toMatchObject({ marginTop: 6, backgroundColor: Colors.white });
  });
});
