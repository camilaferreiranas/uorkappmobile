import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type { ReactElement } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  DemandasDisponiveisLista,
  DemandasDisponiveisPreview,
} from '../../components/ui/demandas-disponiveis';
import {
  buscarCategorias,
  type Categoria,
} from '../../services/categoriaService';
import type {
  DemandaDisponivel,
  OrdenacaoDemanda,
} from '../../services/demandaService';
import { flushAsync } from '../helpers/render-hook';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

jest.mock('@expo/vector-icons', () => {
  const react = jest.requireActual('react') as typeof import('react');
  return {
    MaterialIcons: (props: Record<string, unknown>) =>
      react.createElement('MaterialIcons', props),
  };
});

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

interface ListaMock {
  demandas: DemandaDisponivel[];
  total: number;
  temMais: boolean;
  carregando: boolean;
  atualizando: boolean;
  carregandoMais: boolean;
  erro: string;
  erroMais: string;
  recarregar: jest.Mock;
  atualizar: jest.Mock;
  carregarMais: jest.Mock;
}

let mockLista: ListaMock;

jest.mock('../../hooks/use-demandas-disponiveis', () => ({
  useDemandasDisponiveis: jest.fn(() => mockLista),
}));

jest.mock('../../services/categoriaService', () => ({
  buscarCategorias: jest.fn(),
}));

const buscarCategoriasMock = buscarCategorias as jest.Mock;

const categoriasFixture: Categoria[] = [
  { id: 1, nome: 'Limpeza' },
  { id: 7, nome: 'Jardinagem' },
];

const LARGURA_RETRATO = 390;
const LARGURA_PAISAGEM = 800;

let dimensoes = {
  width: LARGURA_RETRATO,
  height: 844,
  scale: 2,
  fontScale: 1,
};

jest.spyOn(Dimensions, 'get').mockImplementation(() => dimensoes);

function definirLargura(width: number) {
  dimensoes = { ...dimensoes, width };
}

function novaDemanda(overrides: Record<string, unknown> = {}): DemandaDisponivel {
  return {
    id: 1,
    clienteId: 10,
    categoriaId: 2,
    categoria: 'Limpeza',
    titulo: 'Limpeza pesada de apartamento',
    descricao: 'Apartamento com três quartos e dois banheiros.',
    localizacao: 'São Paulo, SP',
    latitude: -23.55,
    longitude: -46.63,
    urgencia: 'NORMAL',
    orcamento: 250,
    status: 'ABERTA',
    criadoEm: '2026-09-20T12:00:00.000Z',
    fotos: [],
    nomeCliente: 'Maria Souza',
    candidaturaId: null,
    statusCandidatura: null,
    mediaAvaliacoesCliente: null,
    totalAvaliacoesCliente: null,
    ...overrides,
  } as DemandaDisponivel;
}

function novaLista(overrides: Partial<ListaMock> = {}): ListaMock {
  return {
    demandas: [],
    total: 0,
    temMais: false,
    carregando: false,
    atualizando: false,
    carregandoMais: false,
    erro: '',
    erroMais: '',
    recarregar: jest.fn(),
    atualizar: jest.fn(),
    carregarMais: jest.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  mockLista = novaLista();
  definirLargura(LARGURA_RETRATO);
  buscarCategoriasMock.mockResolvedValue(categoriasFixture);
});

function render(node: ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(node);
  });
  return renderer;
}

type PropsLista = {
  categoriaSelecionada: Categoria | null;
  onSelecionarCategoria: (categoria: Categoria | null) => void;
  ordenacaoSelecionada: OrdenacaoDemanda;
  onSelecionarOrdenacao: (ordenacao: OrdenacaoDemanda) => void;
};

function renderLista(props: Partial<PropsLista> = {}) {
  return render(
    <DemandasDisponiveisLista
      categoriaSelecionada={null}
      onSelecionarCategoria={jest.fn()}
      ordenacaoSelecionada="RECENTES"
      onSelecionarOrdenacao={jest.fn()}
      {...props}
    />
  );
}

function textos(renderer: ReactTestRenderer): string[] {
  const resultado: string[] = [];
  for (const node of renderer.root.findAllByType(Text)) {
    const children = node.props.children as unknown;
    if (Array.isArray(children)) {
      resultado.push(children.map((child) => String(child)).join(''));
    } else {
      resultado.push(String(children));
    }
  }
  return resultado;
}

function botaoPorTexto(renderer: ReactTestRenderer, label: string) {
  const encontrado = renderer.root
    .findAllByType(TouchableOpacity)
    .find((botao) =>
      botao
        .findAllByType(Text)
        .some((node) => String(node.props.children) === label)
    );
  if (!encontrado) {
    throw new Error(`Botão "${label}" não encontrado`);
  }
  return encontrado;
}

function temBotao(renderer: ReactTestRenderer, label: string): boolean {
  return renderer.root
    .findAllByType(TouchableOpacity)
    .some((botao) =>
      botao
        .findAllByType(Text)
        .some((node) => String(node.props.children) === label)
    );
}

function flatList(renderer: ReactTestRenderer) {
  return renderer.root.findByType(FlatList);
}

function modal(renderer: ReactTestRenderer) {
  return renderer.root.findByType(Modal);
}

function botaoFiltro(renderer: ReactTestRenderer) {
  const [botao] = renderer.root.findAllByProps({
    accessibilityLabel:
      'Filtrar atividades e ordenar demandas por orçamento',
  });
  if (!botao) throw new Error('botão de filtro não encontrado');
  return botao;
}

function icone(renderer: ReactTestRenderer, name: string) {
  return renderer.root
    .findAllByType(MaterialIcons)
    .find((node) => node.props.name === name);
}

describe('DemandasDisponiveisLista', () => {
  it('renderiza o estado de carregando com o indicador de atividade', () => {
    mockLista = novaLista({ carregando: true });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('Buscando publicações');
    expect(textos(renderer)).toContain('Carregando demandas...');
    expect(renderer.root.findAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    expect(icone(renderer, 'assignment')).toBeUndefined();
    expect(icone(renderer, 'error-outline')).toBeUndefined();
    expect(temBotao(renderer, 'Atualizar')).toBe(false);
    expect(temBotao(renderer, 'Tentar novamente')).toBe(false);
    expect(modal(renderer).props.visible).toBe(false);
    expect(flatList(renderer).props.numColumns).toBe(1);
    expect(flatList(renderer).props.columnWrapperStyle).toBeUndefined();
  });

  it('renderiza o estado de erro com botão de tentar novamente', () => {
    mockLista = novaLista({ erro: 'Falha na rede' });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('Publicações disponíveis');
    expect(textos(renderer)).toContain('Não foi possível carregar');
    expect(textos(renderer)).toContain('Falha na rede');
    expect(icone(renderer, 'error-outline')).toBeDefined();
    expect(temBotao(renderer, 'Tentar novamente')).toBe(true);
    expect(temBotao(renderer, 'Ver todas as atividades')).toBe(false);

    const tentar = botaoPorTexto(renderer, 'Tentar novamente');
    act(() => {
      tentar.props.onPress();
    });

    expect(mockLista.recarregar).toHaveBeenCalledTimes(1);
  });

  it('renderiza o estado vazio sem atividade selecionada', () => {
    const renderer = renderLista();

    expect(textos(renderer)).toContain('0 demandas disponíveis');
    expect(textos(renderer)).toContain('Nenhuma demanda disponível');
    expect(textos(renderer)).toContain(
      'As demandas abertas de outros clientes aparecerão aqui. Suas próprias publicações não são exibidas.'
    );
    expect(textos(renderer)).toContain(
      'Todas as atividades. Mais recentes primeiro.'
    );
    expect(temBotao(renderer, 'Atualizar')).toBe(true);
    expect(temBotao(renderer, 'Ver todas as atividades')).toBe(false);
    expect(icone(renderer, 'assignment')).toBeDefined();

    const atualizar = botaoPorTexto(renderer, 'Atualizar');
    act(() => {
      atualizar.props.onPress();
    });
    expect(mockLista.recarregar).toHaveBeenCalledTimes(1);

    const filtro = botaoFiltro(renderer);
    expect(filtro.props.style[1]).toBe(false);
    expect(icone(renderer, 'tune')?.props.color).toBe('#0D3D8B');
    expect(flatList(renderer).props.numColumns).toBe(1);
    expect(flatList(renderer).props.columnWrapperStyle).toBeUndefined();
  });

  it('renderiza o estado vazio com atividade selecionada e permite limpar o filtro', () => {
    const onSelecionarCategoria = jest.fn();
    const renderer = renderLista({
      categoriaSelecionada: { id: 1, nome: 'Limpeza' },
      onSelecionarCategoria,
    });

    expect(textos(renderer)).toContain('Nenhuma demanda nesta atividade');
    expect(textos(renderer)).toContain(
      'Não há demandas abertas em Limpeza no momento. Tente outra atividade ou veja todas.'
    );
    expect(textos(renderer)).toContain('Atividade: Limpeza. Mais recentes primeiro.');

    const limpar = botaoPorTexto(renderer, 'Ver todas as atividades');
    act(() => {
      limpar.props.onPress();
    });
    expect(onSelecionarCategoria).toHaveBeenCalledWith(null);

    const filtro = botaoFiltro(renderer);
    expect(filtro.props.style[1]).toBeTruthy();
    expect(icone(renderer, 'tune')?.props.color).toBe('#fff');
  });

  it('renderiza a demanda com orçamento e candidatura enviada', () => {
    const demanda = novaDemanda({ urgencia: 'URGENTE', candidaturaId: 9 });
    mockLista = novaLista({ demandas: [demanda], total: 1 });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('1 demanda disponível');
    expect(textos(renderer)).toContain('Candidatura enviada');
    expect(textos(renderer)).toContain('Urgente');
    expect(textos(renderer)).toContain(
      Number(250).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    );
    expect(textos(renderer)).toContain('1 de 1 demandas');
    expect(temBotao(renderer, 'Carregar mais')).toBe(false);

    const lista = flatList(renderer);
    expect(lista.props.keyExtractor(demanda)).toBe('1');

    const card = botaoPorTexto(renderer, demanda.titulo);
    act(() => {
      card.props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith('/available-demand-details?id=1');
  });

  it('renderiza a demanda sem orçamento e sem candidatura', () => {
    mockLista = novaLista({
      demandas: [
        novaDemanda({ id: 4, urgencia: 'HOJE', orcamento: null, candidaturaId: null }),
        novaDemanda({ id: 5, titulo: 'Segunda demanda' }),
      ],
      total: 2,
    });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('2 demandas disponíveis');
    expect(textos(renderer)).toContain('Orçamento a combinar');
    expect(textos(renderer)).toContain('Hoje');
    expect(textos(renderer)).not.toContain('Candidatura enviada');
    expect(textos(renderer)).toContain('2 de 2 demandas');
  });

  it('usa a urgência normal quando a urgência da demanda é desconhecida', () => {
    mockLista = novaLista({
      demandas: [novaDemanda({ urgencia: 'CRITICA' })],
      total: 1,
    });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('Normal');
    expect(textos(renderer)).not.toContain('Urgente');
    expect(icone(renderer, 'assignment')).toBeUndefined();
  });

  it('renderiza duas colunas em telas largas', () => {
    definirLargura(LARGURA_PAISAGEM);
    mockLista = novaLista({ demandas: [novaDemanda()], total: 1 });

    const renderer = renderLista();

    expect(flatList(renderer).props.numColumns).toBe(2);
    expect(flatList(renderer).props.columnWrapperStyle).toBeTruthy();
  });

  it('exibe o alerta de erro quando há demandas na lista', () => {
    mockLista = novaLista({
      demandas: [novaDemanda()],
      total: 3,
      erro: 'Erro na atualização',
    });

    const renderer = renderLista();

    const alerta = renderer.root.findAllByProps({ accessibilityRole: 'alert' });
    expect(alerta.length).toBeGreaterThan(0);
    expect(
      textos(renderer).some((texto) =>
        texto.includes('Erro na atualização Puxe para atualizar.')
      )
    ).toBe(true);
    expect(textos(renderer)).toContain('Publicações disponíveis');
  });

  it('exibe o botão de carregar mais quando há mais páginas', () => {
    mockLista = novaLista({
      demandas: [novaDemanda({ id: 1 }), novaDemanda({ id: 2 })],
      total: 5,
      temMais: true,
    });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('2 de 5 demandas');
    expect(temBotao(renderer, 'Carregar mais')).toBe(true);

    const carregarMais = botaoPorTexto(renderer, 'Carregar mais');
    expect(carregarMais.props.disabled).toBe(false);

    act(() => {
      carregarMais.props.onPress();
    });
    expect(mockLista.carregarMais).toHaveBeenCalledTimes(1);
  });

  it('exibe o indicador de atividade ao carregar mais páginas', () => {
    mockLista = novaLista({
      demandas: [novaDemanda()],
      total: 3,
      temMais: true,
      carregandoMais: true,
    });

    const renderer = renderLista();

    expect(temBotao(renderer, 'Carregar mais')).toBe(false);
    expect(renderer.root.findAllByType(ActivityIndicator).length).toBeGreaterThan(0);
  });

  it('desabilita o carregar mais enquanto a lista é atualizada', () => {
    mockLista = novaLista({
      demandas: [novaDemanda()],
      total: 3,
      temMais: true,
      atualizando: true,
    });

    const renderer = renderLista();

    const carregarMais = botaoPorTexto(renderer, 'Carregar mais');
    expect(carregarMais.props.disabled).toBe(true);

    const lista = flatList(renderer);
    expect(lista.props.refreshControl.props.refreshing).toBe(true);

    act(() => {
      lista.props.refreshControl.props.onRefresh();
    });
    expect(mockLista.atualizar).toHaveBeenCalledTimes(1);
  });

  it('exibe tentar carregar mais quando a página seguinte falha', () => {
    mockLista = novaLista({
      demandas: [novaDemanda()],
      total: 3,
      temMais: true,
      erroMais: 'Falha ao carregar mais',
    });

    const renderer = renderLista();

    expect(textos(renderer)).toContain('Falha ao carregar mais');
    expect(temBotao(renderer, 'Tentar carregar mais')).toBe(true);

    const tentar = botaoPorTexto(renderer, 'Tentar carregar mais');
    act(() => {
      tentar.props.onPress();
    });
    expect(mockLista.carregarMais).toHaveBeenCalledTimes(1);
  });

  it('renderiza duas colunas com demandas quando a tela é larga', () => {
    definirLargura(LARGURA_PAISAGEM);
    mockLista = novaLista({
      demandas: [novaDemanda(), novaDemanda({ id: 2, titulo: 'Outra demanda' })],
      total: 2,
    });

    const renderer = renderLista();

    expect(flatList(renderer).props.numColumns).toBe(2);
    expect(renderer.root.findAllByType(TouchableOpacity).length).toBeGreaterThan(0);
  });

  it('destaca o filtro quando a ordenação é por maior orçamento', () => {
    const renderer = renderLista({ ordenacaoSelecionada: 'MAIOR_ORCAMENTO' });

    expect(textos(renderer)).toContain(
      'Todas as atividades. Maior orçamento primeiro.'
    );
    expect(botaoFiltro(renderer).props.style[1]).toBeTruthy();
    expect(icone(renderer, 'tune')?.props.color).toBe('#fff');
  });

  it('exibe a ordenação por menor orçamento no cabeçalho', () => {
    const renderer = renderLista({ ordenacaoSelecionada: 'MENOR_ORCAMENTO' });

    expect(textos(renderer)).toContain(
      'Todas as atividades. Menor orçamento primeiro.'
    );
    expect(botaoFiltro(renderer).props.style[1]).toBeTruthy();
  });

  it('exercita o renderItem e o refreshControl da lista', () => {
    mockLista = novaLista({
      demandas: [novaDemanda()],
      total: 1,
    });

    const renderer = renderLista();
    const lista = flatList(renderer);

    expect(lista.props.renderItem({ item: novaDemanda(), index: 0 })).toBeTruthy();
    expect(typeof lista.props.ListHeaderComponent).toBe('object');
    expect(typeof lista.props.ListFooterComponent).toBe('object');
    expect(typeof lista.props.ListEmptyComponent).toBe('object');
  });
});

describe('DemandasDisponiveisLista — modal de filtro', () => {
  it('abre o filtro e carrega as categorias', async () => {
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });

    expect(modal(renderer).props.visible).toBe(true);
    expect(buscarCategoriasMock).toHaveBeenCalledTimes(1);

    await flushAsync();

    const conteudo = textos(renderer);
    expect(conteudo).toContain('Filtrar demandas');
    expect(conteudo).toContain(
      'Escolha a atividade e a ordem dos orçamentos anunciados.'
    );
    expect(conteudo).toContain('Atividade');
    expect(conteudo).toContain('Todas as atividades');
    expect(conteudo).toContain('Limpeza');
    expect(conteudo).toContain('Jardinagem');
    expect(conteudo).toContain('Ordenar por orçamento');
    expect(conteudo).toContain('Mais recentes');
    expect(conteudo).toContain('Maior orçamento primeiro');
    expect(conteudo).toContain('Menor orçamento primeiro');
    expect(conteudo).toContain(
      'Demandas com orçamento a combinar aparecem por último.'
    );
    expect(conteudo).toContain('Aplicar filtros');
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(0);
  });

  it('não recarrega as categorias quando já foram carregadas', async () => {
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();
    act(() => {
      modal(renderer).props.onRequestClose();
    });
    expect(modal(renderer).props.visible).toBe(false);

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    expect(buscarCategoriasMock).toHaveBeenCalledTimes(1);
    expect(modal(renderer).props.visible).toBe(true);
  });

  it('não inicia nova carga enquanto as categorias estão carregando', () => {
    buscarCategoriasMock.mockImplementation(() => new Promise(() => undefined));
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    expect(buscarCategoriasMock).toHaveBeenCalledTimes(1);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);

    act(() => {
      modal(renderer).props.onRequestClose();
    });
    act(() => {
      botaoFiltro(renderer).props.onPress();
    });

    expect(buscarCategoriasMock).toHaveBeenCalledTimes(1);
    expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('exibe o erro das categorias e permite tentar novamente', async () => {
    buscarCategoriasMock.mockRejectedValueOnce(
      new Error('Sessão expirada. Entre novamente.')
    );
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    expect(textos(renderer)).toContain('Sessão expirada. Entre novamente.');
    expect(temBotao(renderer, 'Tentar novamente')).toBe(true);
    expect(textos(renderer)).not.toContain('Limpeza');

    buscarCategoriasMock.mockResolvedValue(categoriasFixture);
    act(() => {
      botaoPorTexto(renderer, 'Tentar novamente').props.onPress();
    });
    await flushAsync();

    expect(buscarCategoriasMock).toHaveBeenCalledTimes(2);
    expect(textos(renderer)).toContain('Limpeza');
    expect(temBotao(renderer, 'Tentar novamente')).toBe(false);
  });

  it('exibe mensagem genérica quando o erro das categorias não é Error', async () => {
    buscarCategoriasMock.mockRejectedValueOnce('falha inesperada');
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    expect(textos(renderer)).toContain(
      'Não foi possível carregar as atividades.'
    );
  });

  it('seleciona a atividade e aplica o filtro', async () => {
    const onSelecionarCategoria = jest.fn();
    const onSelecionarOrdenacao = jest.fn();
    const renderer = renderLista({
      onSelecionarCategoria,
      onSelecionarOrdenacao,
    });

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    act(() => {
      botaoPorTexto(renderer, 'Limpeza').props.onPress();
    });
    act(() => {
      botaoPorTexto(renderer, 'Aplicar filtros').props.onPress();
    });

    expect(onSelecionarCategoria).toHaveBeenCalledWith({ id: 1, nome: 'Limpeza' });
    expect(onSelecionarOrdenacao).toHaveBeenCalledWith('RECENTES');
    expect(modal(renderer).props.visible).toBe(false);
  });

  it('volta a todas as atividades depois de escolher uma categoria', async () => {
    const onSelecionarCategoria = jest.fn();
    const renderer = renderLista({ onSelecionarCategoria });

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    act(() => {
      botaoPorTexto(renderer, 'Jardinagem').props.onPress();
    });
    act(() => {
      botaoPorTexto(renderer, 'Todas as atividades').props.onPress();
    });
    act(() => {
      botaoPorTexto(renderer, 'Aplicar filtros').props.onPress();
    });

    expect(onSelecionarCategoria).toHaveBeenCalledWith(null);
    expect(modal(renderer).props.visible).toBe(false);
  });

  it('seleciona a ordenação e aplica o filtro', async () => {
    const onSelecionarOrdenacao = jest.fn();
    const renderer = renderLista({ onSelecionarOrdenacao });

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    act(() => {
      botaoPorTexto(renderer, 'Maior orçamento primeiro').props.onPress();
    });
    act(() => {
      botaoPorTexto(renderer, 'Aplicar filtros').props.onPress();
    });

    expect(onSelecionarOrdenacao).toHaveBeenCalledWith('MAIOR_ORCAMENTO');
    expect(modal(renderer).props.visible).toBe(false);
  });

  it('fecha o modal pelo botão de fechar', async () => {
    const renderer = renderLista();

    act(() => {
      botaoFiltro(renderer).props.onPress();
    });
    await flushAsync();

    const fechar = renderer.root.findAllByProps({
      accessibilityLabel: 'Fechar filtros',
    })[0];
    act(() => {
      fechar.props.onPress();
    });

    expect(modal(renderer).props.visible).toBe(false);
  });
});

describe('DemandasDisponiveisPreview', () => {
  it('renderiza as demandas e navega para a lista completa', () => {
    mockLista = novaLista({
      demandas: [
        novaDemanda(),
        novaDemanda({ id: 2, orcamento: null, titulo: 'Segunda demanda' }),
      ],
      total: 2,
    });

    const renderer = render(<DemandasDisponiveisPreview />);

    expect(textos(renderer)).toContain('Demandas disponíveis');
    expect(textos(renderer)).toContain(
      'Publicadas por clientes e abertas para prestadores'
    );
    expect(textos(renderer)).toContain('Limpeza pesada de apartamento');
    expect(textos(renderer)).toContain('Orçamento a combinar');

    const verTodas = botaoPorTexto(renderer, 'Ver todas');
    act(() => {
      verTodas.props.onPress();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/professional-demands',
      params: { aba: 'disponiveis' },
    });
  });

  it('renderiza o estado de carregando no preview', () => {
    mockLista = novaLista({ carregando: true });

    const renderer = render(<DemandasDisponiveisPreview />);

    expect(textos(renderer)).toContain('Carregando demandas...');
    expect(renderer.root.findAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    expect(temBotao(renderer, 'Atualizar')).toBe(false);
  });

  it('renderiza o estado de erro no preview', () => {
    mockLista = novaLista({ erro: 'Falha na rede' });

    const renderer = render(<DemandasDisponiveisPreview />);

    expect(textos(renderer)).toContain('Não foi possível carregar');
    expect(icone(renderer, 'error-outline')).toBeDefined();
    expect(temBotao(renderer, 'Tentar novamente')).toBe(true);

    act(() => {
      botaoPorTexto(renderer, 'Tentar novamente').props.onPress();
    });
    expect(mockLista.recarregar).toHaveBeenCalledTimes(1);
  });

  it('renderiza o estado vazio no preview', () => {
    const renderer = render(<DemandasDisponiveisPreview />);

    expect(textos(renderer)).toContain('Nenhuma demanda disponível');
    expect(textos(renderer)).toContain(
      'As demandas abertas de outros clientes aparecerão aqui. Suas próprias publicações não são exibidas.'
    );
    expect(icone(renderer, 'assignment')).toBeDefined();
    expect(temBotao(renderer, 'Ver todas as atividades')).toBe(false);

    act(() => {
      botaoPorTexto(renderer, 'Atualizar').props.onPress();
    });
    expect(mockLista.recarregar).toHaveBeenCalledTimes(1);
  });
});
