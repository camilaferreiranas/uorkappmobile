const caracteresPermitidos = /^\+?[0-9() .-]+$/;
const celularBrasileiro = /^(?:1[1-9]|2[12478]|3[1-578]|4[1-9]|5[1345]|6[1-9]|7[134579]|8[1-9]|9[1-9])9\d{8}$/;
const blocoRepetido = /^(\d{1,4})\1+$/;

function sequencial(digitos: string) {
  let crescente = true;
  let decrescente = true;
  for (let i = 1; i < digitos.length; i++) {
    const anterior = Number(digitos[i - 1]);
    const atual = Number(digitos[i]);
    crescente &&= atual === (anterior + 1) % 10;
    decrescente &&= atual === (anterior + 9) % 10;
  }
  return crescente || decrescente;
}

export function erroTelefoneBrasileiro(telefone: string): string {
  if (!telefone.trim()) return "";

  const entrada = telefone.trim();
  if (!caracteresPermitidos.test(entrada)) {
    return "Informe um celular brasileiro válido com DDD.";
  }

  let digitos = entrada.replace(/\D/g, "");
  if (digitos.length === 13 && digitos.startsWith("55")) {
    digitos = digitos.slice(2);
  }
  if (!celularBrasileiro.test(digitos)) {
    return "Informe um celular brasileiro válido com DDD.";
  }

  const assinante = digitos.slice(3);
  if (blocoRepetido.test(assinante) || sequencial(assinante)) {
    return "Telefone com sequência repetitiva ou numérica não é permitido.";
  }

  return "";
}
