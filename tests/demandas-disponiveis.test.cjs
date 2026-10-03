// Executar com: node --test tests/demandas-disponiveis.test.cjs
// Sem dependências novas nem acesso à API real.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const compilado = ts.transpileModule(
  fs.readFileSync(path.join(__dirname, "../services/demandaService.ts"), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;

function preparar({ token, resposta, status = 200, falhaJson = false } = {}) {
  const chamadas = [];
  const exports = {};
  vm.runInNewContext(compilado, {
    exports,
    require: (nome) => {
      if (nome === "./api_url") return { API_URL: "https://api.example.test" };
      if (nome === "./token-storage") return { getToken: async () => token === undefined
        ? { accessToken: "token-de-teste", expiresAt: Date.now() + 60_000 } : token };
      throw new Error(`Import inesperado: ${nome}`);
    },
    fetch: async (url, options) => {
      chamadas.push({ url, options });
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => {
          if (falhaJson) throw new Error("JSON inválido");
          return resposta;
        },
      };
    },
  });
  return { service: exports, chamadas };
}

const pagina = {
  content: [{ id: 23, titulo: "Trocar lâmpada", fotos: [], nomeCliente: "Cliente" }],
  number: 1, totalPages: 3, totalElements: 42, last: false,
};

test("lista usa endpoint paginado, JWT e sinal de cancelamento", async () => {
  const { service, chamadas } = preparar({ resposta: { success: true, data: pagina } });
  const controller = new AbortController();
  assert.equal(await service.buscarDemandasDisponiveis(1, 20, controller.signal), pagina);
  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].url, "https://api.example.test/demandas/disponiveis?page=1&size=20");
  assert.equal(chamadas[0].options.method, "GET");
  assert.equal(chamadas[0].options.headers.Authorization, "Bearer token-de-teste");
  assert.equal(chamadas[0].options.signal, controller.signal);
});

test("lista vazia é um resultado válido", async () => {
  const vazia = { content: [], number: 0, totalPages: 0, totalElements: 0, last: true };
  const { service } = preparar({ resposta: { success: true, data: vazia } });
  assert.equal(await service.buscarDemandasDisponiveis(), vazia);
});

test("bloqueia sessão ausente ou expirada antes da requisição", async () => {
  for (const token of [null, { accessToken: "expirado", expiresAt: 1 }]) {
    const { service, chamadas } = preparar({ token });
    await assert.rejects(service.buscarDemandasDisponiveis(), /Sessão expirada/);
    await assert.rejects(service.buscarDemandaDisponivel(1), /Sessão expirada/);
    assert.equal(chamadas.length, 0);
  }
});

test("valida paginação localmente", async () => {
  const { service, chamadas } = preparar();
  for (const [page, size] of [[-1, 20], [0.5, 20], [0, 0], [0, 51], [0, 2.5]]) {
    await assert.rejects(service.buscarDemandasDisponiveis(page, size), /Paginação inválida/);
  }
  assert.equal(chamadas.length, 0);
});

test("erro da API prioriza erros de validação e respeita acesso negado", async () => {
  const { service } = preparar({ status: 403, resposta: { erros: ["Cadastro precisa estar ativo"], message: "Genérico" } });
  await assert.rejects(service.buscarDemandasDisponiveis(), /Cadastro precisa estar ativo/);
});

test("propaga demanda indisponível sem tentar endpoint de propostas", async () => {
  const { service, chamadas } = preparar({ status: 404, resposta: { message: "Demanda não disponível" } });
  await assert.rejects(service.buscarDemandaDisponivel(23), /Demanda não disponível/);
  assert.equal(chamadas[0].url, "https://api.example.test/demandas/disponiveis/23");
});

test("detalhe aceita demanda sem fotos e sem orçamento", async () => {
  const demanda = { ...pagina.content[0], orcamento: null };
  const { service, chamadas } = preparar({ resposta: { success: true, data: demanda } });
  assert.equal(await service.buscarDemandaDisponivel(23), demanda);
  assert.equal(chamadas[0].options.headers.Authorization, "Bearer token-de-teste");
});

test("ID inválido não faz requisição", async () => {
  const { service, chamadas } = preparar();
  for (const id of [0, -1, NaN, 1.2, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(service.buscarDemandaDisponivel(id), /Demanda inválida/);
  }
  assert.equal(chamadas.length, 0);
});

test("resposta não JSON tem erro compreensível", async () => {
  const { service } = preparar({ status: 500, falhaJson: true });
  await assert.rejects(service.buscarDemandasDisponiveis(), /Não foi possível carregar/);
});

test("rejeita success false e formato incompatível", async () => {
  const falha = preparar({ resposta: { success: false, message: "Indisponível", data: pagina } });
  await assert.rejects(falha.service.buscarDemandasDisponiveis(), /Indisponível/);
  const invalido = preparar({ resposta: { success: true, data: [] } });
  await assert.rejects(invalido.service.buscarDemandasDisponiveis(), /Resposta inválida/);
});

test("prestador envia candidatura com valor, mensagem e JWT", async () => {
  const candidatura = { id: 81, demandaId: 23, valor: 350, mensagem: "Posso fazer amanhã", status: "PENDENTE" };
  const { service, chamadas } = preparar({ resposta: { success: true, data: candidatura }, status: 201 });

  assert.equal(await service.enviarCandidatura(23, 350, " Posso fazer amanhã "), candidatura);
  assert.equal(chamadas[0].url, "https://api.example.test/demandas/23/candidaturas");
  assert.equal(chamadas[0].options.method, "POST");
  assert.equal(chamadas[0].options.headers.Authorization, "Bearer token-de-teste");
  assert.deepEqual(JSON.parse(chamadas[0].options.body), {
    valor: 350,
    mensagem: "Posso fazer amanhã",
  });
});

test("cliente carrega candidaturas da própria demanda", async () => {
  const dados = { demandaId: 23, titulo: "Trocar lâmpada", status: "ABERTA", candidaturas: [] };
  const { service, chamadas } = preparar({ resposta: { success: true, data: dados } });
  const controller = new AbortController();

  assert.equal(await service.buscarCandidaturasDaDemanda(23, controller.signal), dados);
  assert.equal(chamadas[0].url, "https://api.example.test/demandas/23/candidaturas");
  assert.equal(chamadas[0].options.signal, controller.signal);
  assert.equal(chamadas[0].options.headers.Authorization, "Bearer token-de-teste");
});

test("cliente seleciona uma candidatura pelo endpoint da demanda", async () => {
  const candidatura = { id: 81, demandaId: 23, status: "ACEITA" };
  const { service, chamadas } = preparar({ resposta: { success: true, data: candidatura } });

  assert.equal(await service.selecionarCandidatura(23, 81), candidatura);
  assert.equal(chamadas[0].url, "https://api.example.test/demandas/23/candidaturas/81/selecionar");
  assert.equal(chamadas[0].options.method, "PATCH");
  assert.equal(chamadas[0].options.headers.Authorization, "Bearer token-de-teste");
});

test("valida candidatura localmente antes de consultar a API", async () => {
  const { service, chamadas } = preparar();
  await assert.rejects(service.enviarCandidatura(0, 100, ""), /Demanda inválida/);
  await assert.rejects(service.enviarCandidatura(23, 0, ""), /valor válido/);
  await assert.rejects(service.enviarCandidatura(23, 100, "x".repeat(501)), /500 caracteres/);
  await assert.rejects(service.selecionarCandidatura(23, 0), /Candidatura inválida/);
  assert.equal(chamadas.length, 0);
});
