/**
 * Configuração de runtime do app.
 *
 * A URL base da API pode ser definida via variável de ambiente do Expo
 * (`EXPO_PUBLIC_API_URL`); caso contrário usa o default de desenvolvimento.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') ?? 'http://localhost:8080';
