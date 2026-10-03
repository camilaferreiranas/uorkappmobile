import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ReviewCard } from '@/components/ui/review-card';
import { Colors, ProfessionalColors } from '@/constants/theme';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

function textValues(renderer: ReactTestRenderer): unknown[] {
  return renderer.root.findAllByType(Text).map((node) => node.props.children);
}

function findByText(renderer: ReactTestRenderer, value: string) {
  return renderer.root
    .findAllByType(Text)
    .find((node) => node.props.children === value);
}

describe('ReviewCard', () => {
  it('renderiza a avaliação no tema do cliente por padrão com data', () => {
    const renderer = render(
      <ReviewCard
        name="João Silva"
        comment="Ótimo serviço"
        rating={4.5}
        date="12/01/2026"
        distance="2,3 km"
      />
    );

    expect(textValues(renderer)).toContain('JO');
    expect(textValues(renderer)).toContain('João Silva');
    expect(textValues(renderer)).toContain('12/01/2026');
    expect(textValues(renderer)).not.toContain('2,3 km');
    expect(textValues(renderer)).toContain('4.5');
    expect(textValues(renderer)).toContain('Ótimo serviço');

    const badge = renderer.root.findAllByProps({
      accessibilityLabel: 'Avaliação 4.5 de 5',
    });
    expect(badge.length).toBeGreaterThan(0);

    const iniciais = findByText(renderer, 'JO');
    expect(iniciais?.parent?.props.style).toMatchObject({
      backgroundColor: Colors.brandPrimary,
    });

    const estrela = renderer.root
      .findAllByType(MaterialIcons)
      .find((icon) => icon.props.name === 'star');
    expect(estrela?.props.color).toBe(Colors.rating);

    const nome = findByText(renderer, 'João Silva');
    expect(nome?.parent?.children).toHaveLength(2);
  });

  it('renderiza com as cores do profissional quando tone é professional', () => {
    const renderer = render(
      <ReviewCard
        tone="professional"
        name="Maria Souza"
        comment="Trabalho impecável"
        rating={5}
        date="01/02/2026"
      />
    );

    const iniciais = findByText(renderer, 'MA');
    expect(iniciais?.parent?.props.style).toMatchObject({
      backgroundColor: ProfessionalColors.brandPrimary,
    });
    expect(ProfessionalColors.brandPrimary).not.toBe(Colors.brandPrimary);
    expect(textValues(renderer)).toContain('Trabalho impecável');
  });

  it('usa a distância quando a data não é informada', () => {
    const renderer = render(
      <ReviewCard
        name="Ana Lima"
        comment="Chegou no horário"
        rating={4}
        distance="5,1 km"
      />
    );

    expect(textValues(renderer)).toContain('5,1 km');
    expect(textValues(renderer)).not.toContain('12/01/2026');

    const nome = findByText(renderer, 'Ana Lima');
    expect(nome?.parent?.children).toHaveLength(2);
  });

  it('oculta os metadados quando não há data nem distância', () => {
    const renderer = render(
      <ReviewCard name="Ana Lima" comment="Recomendo" rating={4} />
    );

    const nome = findByText(renderer, 'Ana Lima');
    expect(nome).toBeDefined();
    expect(nome?.parent?.children).toHaveLength(1);
    expect(textValues(renderer)).not.toContain('5,1 km');
    expect(textValues(renderer)).toContain('Recomendo');
  });

  it('formata a nota com uma casa decimal', () => {
    const renderer = render(
      <ReviewCard name="Caio Reis" comment="Bom atendimento" rating={5} />
    );

    expect(textValues(renderer)).toContain('5.0');
    const badge = renderer.root.findAllByProps({
      accessibilityLabel: 'Avaliação 5.0 de 5',
    });
    expect(badge.length).toBeGreaterThan(0);
  });

  it('usa as duas primeiras letras do nome como iniciais', () => {
    const renderer = render(
      <ReviewCard name="roberto campos" comment="Cordial" rating={3.5} />
    );

    expect(textValues(renderer)).toContain('RO');
    expect(textValues(renderer)).toContain('roberto campos');
  });
});
