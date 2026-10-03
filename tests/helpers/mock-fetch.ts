export interface FetchCall {
  url: string;
  init?: RequestInit;
}

export interface FetchRoute {
  /** Substring (string) ou padrão (RegExp) da URL; rota sem match atende qualquer URL. */
  match?: string | RegExp;
  status?: number;
  body?: unknown;
  /** Quando true, response.json() rejeita (resposta malformada). */
  invalidJson?: boolean;
}

export interface FetchMock {
  mock: jest.Mock;
  calls: FetchCall[];
  restore: () => void;
}

/** Response-like usado quando o teste precisa de um objeto de resposta avulso. */
export function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body ?? ''),
    blob: async () => ({ type: 'application/octet-stream', size: 0 }),
  };
}

function buildResponse(route: FetchRoute) {
  const status = route.status ?? 200;
  const body = route.body;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (route.invalidJson) {
        throw new SyntaxError('Unexpected token < in JSON');
      }
      return body;
    },
    text: async () => JSON.stringify(body ?? ''),
    blob: async () => ({ type: 'application/octet-stream', size: 0 }),
  };
}

function routeMatches(route: FetchRoute, url: string): boolean {
  if (!route.match) return true;
  if (typeof route.match === 'string') return url.includes(route.match);
  return route.match.test(url);
}

/**
 * Instala um mock de `global.fetch` roteado por URL (ou por ordem, para rotas
 * sem `match`). Falha se uma URL não tiver rota correspondente.
 */
export function installFetchMock(routes: FetchRoute[] = []): FetchMock {
  const calls: FetchCall[] = [];
  const pending = [...routes];
  const previousFetch = globalThis.fetch;

  const mock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });

    const index = pending.findIndex((route) => routeMatches(route, url));
    if (index === -1) {
      throw new Error(`fetch não roteado: ${url}`);
    }
    return buildResponse(pending.splice(index, 1)[0]);
  });

  Object.assign(globalThis, { fetch: mock });

  return {
    mock,
    calls,
    restore: () => Object.assign(globalThis, { fetch: previousFetch }),
  };
}
