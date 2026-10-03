import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_CLIENT_IDS } from '../constants/env';
import { useGoogleLogin } from './useGoogleLogin';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth(onSuccess: () => void) {
  const [request, , prompt] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web,
    selectAccount: true,
  });

  return useGoogleLogin(async () => {
    if (!request) throw new Error('O login com Google está sendo preparado. Tente novamente.');
    const result = await prompt();
    if (result.type === 'cancel' || result.type === 'dismiss') return null;
    if (result.type !== 'success') throw new Error('Não foi possível entrar com Google. Tente novamente.');
    const idToken = result.params.id_token;
    if (!idToken) throw new Error('O Google não retornou um token de identidade.');
    // These claims are only profile hints. The API must verify the signed token.
    const encoded = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')), char => char.charCodeAt(0));
    const claims = JSON.parse(new TextDecoder().decode(bytes));
    if (claims.nonce !== request.nonce) throw new Error('Resposta do Google inválida. Tente novamente.');
    if (!claims.sub || !claims.email) throw new Error('O Google não retornou os dados da conta.');
    return { idToken, googleId: claims.sub, email: claims.email, nome: claims.given_name ?? '', sobrenome: claims.family_name ?? '', avatarUrl: claims.picture };
  }, onSuccess);
}
