const FUSO_EXPLICITO = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Converte datas da API para o horário local do dispositivo.
 * Respostas antigas não possuem o sufixo UTC, embora tenham sido gravadas em UTC.
 */
export function formatarDataNotificacao(valor: string): string {
  const valorComFuso = FUSO_EXPLICITO.test(valor) ? valor : `${valor}Z`;
  const data = new Date(valorComFuso);

  if (Number.isNaN(data.getTime())) return "Data indisponível";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
