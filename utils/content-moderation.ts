import termosBloqueados from "../config/moderacao/termos-bloqueados.json";

interface CampoModerado {
  nome: string;
  valor?: string | null;
}

const MARCAS_DIACRITICAS = /[\u0300-\u036f]/g;
const CARACTERES_ESPECIAIS = /[^a-z0-9\s]+/g;
const ESPACOS = /\s+/g;
const LETRAS_REPETIDAS = /([a-z])\1+/g;

function normalizar(valor: string): string {
  return valor
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .replaceAll("@", "a")
    .replaceAll("4", "a")
    .replaceAll("3", "e")
    .replaceAll("&", "e")
    .replaceAll("€", "e")
    .replaceAll("1", "i")
    .replaceAll("|", "i")
    .replaceAll("0", "o")
    .replaceAll("5", "s")
    .replaceAll("$", "s")
    .replaceAll("7", "t")
    .replaceAll("+", "t")
    .replace(LETRAS_REPETIDAS, "$1")
    .replace(CARACTERES_ESPECIAIS, "")
    .replace(ESPACOS, " ")
    .trim();
}

const TERMOS_NORMALIZADOS = [
  ...termosBloqueados.termos,
  ...termosBloqueados.expressoes,
]
  .map(normalizar)
  .filter(Boolean);

const TERMOS_SIMPLES = TERMOS_NORMALIZADOS.filter(
  (termo) => !termo.includes(" ") && !termo.endsWith("s")
);
const DIMINUTIVOS_LEGITIMOS = new Set(["rolinha", "rolinhas"]);
const SUFIXOS_DIMINUTIVOS = ["inho", "inha", "inhos", "inhas"];
const SUFIXOS_DIMINUTIVOS_COM_Z = ["zinho", "zinha", "zinhos", "zinhas"];

function ehDiminutivoBloqueado(palavra: string): boolean {
  if (DIMINUTIVOS_LEGITIMOS.has(palavra)) return false;

  return TERMOS_SIMPLES.some((termo) => {
    const terminaComVogal = /[aoe]$/.test(termo);
    const radical = terminaComVogal ? termo.slice(0, -1) : termo;

    return SUFIXOS_DIMINUTIVOS.some(
      (sufixo) => palavra === `${radical}${sufixo}`
    ) || SUFIXOS_DIMINUTIVOS_COM_Z.some(
      (sufixo) => palavra === `${termo}${sufixo}`
    );
  });
}

export function contemConteudoOfensivo(valor?: string | null): boolean {
  if (!valor?.trim()) return false;

  const normalizado = normalizar(valor);
  const texto = ` ${normalizado} `;
  const possuiTermoDireto = TERMOS_NORMALIZADOS.some((termo) =>
    texto.includes(` ${termo} `)
  );

  if (possuiTermoDireto) return true;
  return normalizado.split(" ").some(ehDiminutivoBloqueado);
}

export function validarConteudoPublico(campos: CampoModerado[]): void {
  const campoInvalido = campos.find(({ valor }) => contemConteudoOfensivo(valor));
  if (campoInvalido) {
    throw new Error(
      `O campo ${campoInvalido.nome} contém termos não permitidos.`
    );
  }
}
