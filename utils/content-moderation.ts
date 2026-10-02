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

export function contemConteudoOfensivo(valor?: string | null): boolean {
  if (!valor?.trim()) return false;

  const texto = ` ${normalizar(valor)} `;
  return TERMOS_NORMALIZADOS.some((termo) =>
    texto.includes(` ${termo} `)
  );
}

export function validarConteudoPublico(campos: CampoModerado[]): void {
  const campoInvalido = campos.find(({ valor }) => contemConteudoOfensivo(valor));
  if (campoInvalido) {
    throw new Error(
      `O campo ${campoInvalido.nome} contém termos não permitidos.`
    );
  }
}
