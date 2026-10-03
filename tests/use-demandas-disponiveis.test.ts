import { act } from 'react-test-renderer';
import { renderHook, flushAsync } from './helpers/render-hook';
import { useDemandasDisponiveis } from '../hooks/use-demandas-disponiveis';
import {
  buscarDemandasDisponiveis,
  type DemandaDisponivel,
  type PaginaDemandasDisponiveis,
} from '../services/demandaService';

jest.mock('@react-navigation/native', () => {
  const { useEffect } = jest.requireActual('react') as typeof import('react');
  return {
    useFocusEffect: (callback: () => void | (() => void)) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock('../services/demandaService', () => ({
  buscarDemandasDisponiveis: jest.fn(),
}));

const buscarMock = jest.mocked(buscarDemandasDisponiveis);

function criarDemanda(id: number): DemandaDisponivel {
  return {
    id,
    clienteId: 100,
    categoriaId: 1,
    categoria: 'Serviços',
    titulo: `Demanda ${id}`,
    descricao: 'Descrição da demanda',
    localizacao: 'Rua X, 123',
    latitude: -23.5,
    longitude: -46.6,
    urgencia: 'NORMAL',
    orcamento: 150,
    status: 'ABERTA',
    criadoEm: '2026-01-01T12:00:00.000Z',
    fotos: [],
    nomeCliente: 'Cliente',
    candidaturaId: null,
    statusCandidatura: null,
    mediaAvaliacoesCliente: null,
    totalAvaliacoesCliente: null,
  };
}

function criarPagina(
  content: DemandaDisponivel[],
  overrides: Partial<PaginaDemandasDisponiveis> = {}
): PaginaDemandasDisponiveis {
  return {
    content,
    number: 0,
    totalPages: 1,
    totalElements: content.length,
    last: true,
    ...overrides,
  };
}

async function disparar(acao: () => void): Promise<void> {
  await act(async () => {
    acao();
    await new Promise<void>((resolve) => setImmediate(() => resolve()));
  });
}

describe('useDemandasDisponiveis', () => {
  beforeEach(() => {
    buscarMock.mockReset();
  });

  it('carrega a lista inicial com sucesso', async () => {
    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(1), criarDemanda(2)], {
        number: 0,
        totalPages: 3,
        totalElements: 5,
        last: false,
      })
    );

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();

    expect(result.current.demandas.map((d) => d.id)).toEqual([1, 2]);
    expect(result.current.total).toBe(5);
    expect(result.current.temMais).toBe(true);
    expect(result.current.carregando).toBe(false);
    expect(result.current.erro).toBe('');
    expect(buscarMock).toHaveBeenCalledWith(
      0,
      20,
      expect.any(AbortSignal),
      null,
      'RECENTES'
    );
  });

  it('usa parâmetros customizados de página, categoria e ordenação', async () => {
    buscarMock.mockResolvedValueOnce(criarPagina([criarDemanda(1)]));

    const { result } = renderHook(() =>
      useDemandasDisponiveis(10, 7, 'MAIOR_ORCAMENTO')
    );
    await flushAsync();

    expect(buscarMock).toHaveBeenCalledTimes(1);
    expect(buscarMock).toHaveBeenCalledWith(
      0,
      10,
      expect.any(AbortSignal),
      7,
      'MAIOR_ORCAMENTO'
    );
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);
    expect(result.current.carregando).toBe(false);
  });

  it('exibe erro quando o carregamento inicial falha', async () => {
    buscarMock.mockRejectedValueOnce(new Error('Falhou'));

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();

    expect(result.current.erro).toBe('Falhou');
    expect(result.current.demandas).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.temMais).toBe(false);
    expect(result.current.carregando).toBe(false);
  });

  it('exibe mensagem padrão quando a rejeição não é uma Error', async () => {
    buscarMock.mockRejectedValueOnce('resposta inválida');

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();

    expect(result.current.erro).toBe('Não foi possível carregar as demandas.');
    expect(result.current.demandas).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.temMais).toBe(false);
    expect(result.current.carregando).toBe(false);
  });

  it('carregarMais acrescenta itens sem duplicar e avança para a próxima página', async () => {
    const demandaA = criarDemanda(1);
    const demandaB = criarDemanda(2);
    buscarMock.mockResolvedValueOnce(
      criarPagina([demandaA], {
        number: 0,
        totalPages: 2,
        totalElements: 2,
        last: false,
      })
    );
    buscarMock.mockResolvedValueOnce(
      criarPagina([demandaA, demandaB], {
        number: 1,
        totalPages: 2,
        totalElements: 2,
        last: true,
      })
    );

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);
    expect(result.current.temMais).toBe(true);

    await disparar(() => {
      result.current.carregarMais();
    });
    await flushAsync();

    expect(buscarMock).toHaveBeenCalledTimes(2);
    expect(buscarMock.mock.calls[1][0]).toBe(1);
    expect(result.current.demandas.map((d) => d.id)).toEqual([1, 2]);
    expect(result.current.total).toBe(2);
    expect(result.current.temMais).toBe(false);
    expect(result.current.carregandoMais).toBe(false);
    expect(result.current.erroMais).toBe('');
  });

  it('carregarMais não chama o serviço quando não há mais páginas', async () => {
    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(1)], { number: 0, last: true })
    );

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();
    expect(result.current.temMais).toBe(false);

    await disparar(() => {
      result.current.carregarMais();
    });
    await flushAsync();

    expect(buscarMock).toHaveBeenCalledTimes(1);
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);
  });

  it('preenche erroMais sem apagar a lista quando carregarMais falha', async () => {
    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(1)], {
        number: 0,
        totalPages: 2,
        totalElements: 2,
        last: false,
      })
    );
    buscarMock.mockRejectedValueOnce(new Error('Falhou ao carregar mais'));

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();

    await disparar(() => {
      result.current.carregarMais();
    });
    await flushAsync();

    expect(result.current.erroMais).toBe('Falhou ao carregar mais');
    expect(result.current.erro).toBe('');
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);
    expect(result.current.carregandoMais).toBe(false);
    expect(buscarMock).toHaveBeenCalledTimes(2);
  });

  it('atualizar recarrega a página 0 e substitui a lista', async () => {
    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(1)], {
        number: 0,
        totalPages: 2,
        totalElements: 2,
        last: false,
      })
    );
    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(9)], {
        number: 0,
        totalPages: 2,
        totalElements: 2,
        last: false,
      })
    );

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);

    await disparar(() => {
      result.current.atualizar();
    });
    await flushAsync();

    expect(buscarMock).toHaveBeenCalledTimes(2);
    expect(buscarMock.mock.calls[1][0]).toBe(0);
    expect(result.current.demandas.map((d) => d.id)).toEqual([9]);
    expect(result.current.total).toBe(2);
    expect(result.current.atualizando).toBe(false);
    expect(result.current.erro).toBe('');
  });

  it('recarregar recarrega a página 0 e limpa o erro anterior', async () => {
    buscarMock.mockRejectedValueOnce(new Error('Falhou'));

    const { result } = renderHook(() => useDemandasDisponiveis());
    await flushAsync();
    expect(result.current.erro).toBe('Falhou');

    buscarMock.mockResolvedValueOnce(
      criarPagina([criarDemanda(3)], { number: 0, last: true })
    );
    await disparar(() => {
      result.current.recarregar();
    });
    await flushAsync();

    expect(buscarMock).toHaveBeenCalledTimes(2);
    expect(buscarMock.mock.calls[1][0]).toBe(0);
    expect(result.current.erro).toBe('');
    expect(result.current.demandas.map((d) => d.id)).toEqual([3]);
    expect(result.current.carregando).toBe(false);
  });

  it('mantém carregando true enquanto a carga inicial está pendente', async () => {
    let resolver!: (pagina: PaginaDemandasDisponiveis) => void;
    const pendente = new Promise<PaginaDemandasDisponiveis>((resolve) => {
      resolver = resolve;
    });
    buscarMock.mockReturnValue(pendente);

    const { result } = renderHook(() => useDemandasDisponiveis());

    expect(result.current.carregando).toBe(true);
    expect(result.current.demandas).toEqual([]);

    await disparar(() =>
      resolver(criarPagina([criarDemanda(1)], { number: 0, last: true }))
    );
    await flushAsync();

    expect(result.current.carregando).toBe(false);
    expect(result.current.demandas.map((d) => d.id)).toEqual([1]);
    expect(result.current.erro).toBe('');
  });
});
