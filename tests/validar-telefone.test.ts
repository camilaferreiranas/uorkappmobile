import { erroTelefoneBrasileiro } from '../utils/validar-telefone';

const MENSAGEM_INVALIDO = 'Informe um celular brasileiro válido com DDD.';
const MENSAGEM_SEQUENCIA =
  'Telefone com sequência repetitiva ou numérica não é permitido.';

describe('erroTelefoneBrasileiro', () => {
  it('aceita celular formatado com DDD válido', () => {
    expect(erroTelefoneBrasileiro('(11) 98877-6655')).toBe('');
  });

  it('aceita celular apenas com dígitos', () => {
    expect(erroTelefoneBrasileiro('11988776655')).toBe('');
  });

  it('aceita código do país 55', () => {
    expect(erroTelefoneBrasileiro('+55 11 98877-6655')).toBe('');
    expect(erroTelefoneBrasileiro('5511988776655')).toBe('');
  });

  it('aceita qualquer DDD válido', () => {
    expect(erroTelefoneBrasileiro('21988776655')).toBe('');
    expect(erroTelefoneBrasileiro('85988776655')).toBe('');
    expect(erroTelefoneBrasileiro('91988776655')).toBe('');
  });

  it('aceita espaços ao redor', () => {
    expect(erroTelefoneBrasileiro('  11988776655  ')).toBe('');
  });

  it('rejeita vazio ou só espaços (opcional)', () => {
    expect(erroTelefoneBrasileiro('')).toBe('');
    expect(erroTelefoneBrasileiro('   ')).toBe('');
  });

  it('rejeita caracteres não permitidos', () => {
    expect(erroTelefoneBrasileiro('abc')).toBe(MENSAGEM_INVALIDO);
    expect(erroTelefoneBrasileiro('11x988776655')).toBe(MENSAGEM_INVALIDO);
  });

  it('rejeita DDD inexistente', () => {
    expect(erroTelefoneBrasileiro('01912345678')).toBe(MENSAGEM_INVALIDO);
    expect(erroTelefoneBrasileiro('10912345678')).toBe(MENSAGEM_INVALIDO);
  });

  it('rejeita telefone sem o nono dígito (fixo)', () => {
    expect(erroTelefoneBrasileiro('1133334444')).toBe(MENSAGEM_INVALIDO);
  });

  it('rejeita número com dígitos a mais', () => {
    expect(erroTelefoneBrasileiro('119887766550')).toBe(MENSAGEM_INVALIDO);
  });

  it('rejeita assinante com bloco repetido', () => {
    expect(erroTelefoneBrasileiro('11911111111')).toBe(MENSAGEM_SEQUENCIA);
    expect(erroTelefoneBrasileiro('11912121212')).toBe(MENSAGEM_SEQUENCIA);
  });

  it('rejeita assinante com sequência crescente', () => {
    expect(erroTelefoneBrasileiro('11912345678')).toBe(MENSAGEM_SEQUENCIA);
  });

  it('rejeita assinante com sequência decrescente', () => {
    expect(erroTelefoneBrasileiro('11987654321')).toBe(MENSAGEM_SEQUENCIA);
  });
});
