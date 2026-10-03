import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { GOOGLE_CLIENT_IDS } from '../constants/env';
import { useGoogleLogin } from './useGoogleLogin';

// Loaded only after checking Expo Go, which does not contain the native module.
export function useGoogleAuth(onSuccess: () => void) {
  return useGoogleLogin(async () => {
    if (Constants.appOwnership === 'expo') {
      throw new Error('O login com Google exige uma build própria do app. Não está disponível no Expo Go.');
    }
    if (!GOOGLE_CLIENT_IDS.web || (Platform.OS === 'ios' && !GOOGLE_CLIENT_IDS.ios)) {
      throw new Error('Configure as credenciais do Google para esta plataforma.');
    }
    const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = await import('@react-native-google-signin/google-signin');
    GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_IDS.web, iosClientId: GOOGLE_CLIENT_IDS.ios || undefined });
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!isSuccessResponse(result)) return null;
      const { idToken, user } = result.data;
      if (!idToken) throw new Error('O Google não retornou um token de identidade. Verifique o client ID Web.');
      return { idToken, googleId: user.id, email: user.email, nome: user.givenName ?? '', sobrenome: user.familyName ?? '', avatarUrl: user.photo ?? undefined };
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Atualize ou ative o Google Play Services para continuar.');
        }
      }
      throw error;
    }
  }, onSuccess);
}
