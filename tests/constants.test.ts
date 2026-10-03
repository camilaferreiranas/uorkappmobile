import {
  Colors,
  Fonts,
  ProfessionalColors,
  Radii,
  Radius,
  Shadow,
  Spacing,
  Typography,
  getStatusColor,
} from '../constants/theme';
import { GOOGLE_CLIENT_IDS } from '../constants/env';

describe('Colors / ProfessionalColors', () => {
  it('expõe os tokens principais da marca', () => {
    expect(Colors.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(Colors.text).toBe(Colors.textPrimary);
    expect(Colors.background).toBeDefined();
    expect(Colors.success).toBeDefined();
    expect(Colors.error).toBeDefined();
    expect(Colors.warning).toBeDefined();
  });

  it('ProfessionalColors sobrepõe o primary para o prestador', () => {
    expect(ProfessionalColors.primary).not.toBe(Colors.primary);
    expect(ProfessionalColors.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(ProfessionalColors.white).toBe(Colors.white);
  });
});

describe('escalas de layout', () => {
  it('Spacing tem ritmo crescente e gutters', () => {
    expect(Spacing.space1).toBeLessThan(Spacing.space2);
    expect(Spacing.gutter).toBe(16);
    expect(Spacing.section).toBeGreaterThanOrEqual(Spacing.sectionTight);
  });

  it('Radii e Radius cobrem do sm ao pill', () => {
    expect(Radii.sm).toBeLessThan(Radii.md);
    expect(Radii.md).toBeLessThan(Radii.lg);
    expect(Radii.pill).toBe(999);
    expect(Radius.pill).toBe(999);
    expect(Radius.md).toBeGreaterThan(Radius.sm);
  });

  it('Shadow define elevação para card e floating', () => {
    expect(Shadow.card.boxShadow).toContain('rgba');
    expect(Shadow.floating.elevation).toBeGreaterThan(Shadow.card.elevation);
  });

  it('Typography cobre os estilos de texto', () => {
    expect(Typography.display.fontSize).toBeGreaterThan(Typography.h1.fontSize);
    expect(Typography.body.lineHeight).toBeGreaterThanOrEqual(Typography.body.fontSize);
    expect(Typography.button.fontWeight).toBe('600');
  });

  it('Fonts resolve família por plataforma', () => {
    expect(Fonts.sans).toBeDefined();
    expect(Fonts.serif).toBeDefined();
    expect(Fonts.mono).toBeDefined();
  });
});

describe('getStatusColor', () => {
  it('mapeia estados de sucesso', () => {
    expect(getStatusColor('Concluído').color).toBe(Colors.success);
    expect(getStatusColor('ACEITA').color).toBe(Colors.success);
    expect(getStatusColor('  confirmado  ').color).toBe(Colors.success);
  });

  it('mapeia estados de erro', () => {
    expect(getStatusColor('Cancelada').color).toBe(Colors.error);
    expect(getStatusColor('recusada').color).toBe(Colors.error);
    expect(getStatusColor('expirada').color).toBe(Colors.error);
  });

  it('mapeia estados de atenção', () => {
    expect(getStatusColor('Pendente').color).toBe(Colors.warning);
    expect(getStatusColor('em análise').color).toBe(Colors.warning);
    expect(getStatusColor('aguardando resposta').color).toBe(Colors.warning);
  });

  it('usa cor neutra para status desconhecido', () => {
    const resultado = getStatusColor('qualquer coisa');
    expect(resultado.color).toBe(Colors.textSecondary);
    expect(resultado.background).toBe(Colors.background);
  });

  it('sempre retorna par color/background', () => {
    for (const status of ['concluída', 'falha', 'pendente', 'outro']) {
      const { color, background } = getStatusColor(status);
      expect(typeof color).toBe('string');
      expect(typeof background).toBe('string');
    }
  });
});

describe('GOOGLE_CLIENT_IDS', () => {
  it('possui web e ios como strings', () => {
    expect(typeof GOOGLE_CLIENT_IDS.web).toBe('string');
    expect(typeof GOOGLE_CLIENT_IDS.ios).toBe('string');
  });

  it('usa fallback público quando a variável de ambiente não está definida', () => {
    expect(GOOGLE_CLIENT_IDS.web.length).toBeGreaterThan(0);
  });
});
