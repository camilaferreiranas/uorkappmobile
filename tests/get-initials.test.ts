import { getInitials } from '../utils/get-initials';

describe('getInitials', () => {
  it('combina primeira letra do nome e do sobrenome', () => {
    expect(getInitials('João', 'Silva')).toBe('JS');
  });

  it('converte para maiúsculas', () => {
    expect(getInitials('ana', 'maria')).toBe('AM');
  });

  it('ignora espaços nas pontas', () => {
    expect(getInitials('  Carlos', '  Souza ')).toBe('CS');
  });

  it('usa apenas o nome quando o sobrenome falta', () => {
    expect(getInitials('Fernanda')).toBe('F');
  });

  it('retorna ? quando ambos são vazios', () => {
    expect(getInitials()).toBe('?');
    expect(getInitials('', '')).toBe('?');
    expect(getInitials('   ', '  ')).toBe('?');
  });

  it('trata sobrenome vazio', () => {
    expect(getInitials('Marcos', '')).toBe('M');
  });

  it('funciona com caracteres acentuados', () => {
    expect(getInitials('él', 'yza')).toBe('ÉY');
  });
});
