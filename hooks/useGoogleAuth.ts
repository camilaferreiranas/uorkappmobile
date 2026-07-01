import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { GOOGLE_CLIENT_IDS } from '../constants/env';
import { loginWithGoogle } from '../services/api';

WebBrowser.maybeCompleteAuthSession();

interface GoogleUser {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

interface UseGoogleAuthResult {
  promptAsync: () => void;
  loading: boolean;
  error: string;
}

export function useGoogleAuth(onSuccess: () => void): UseGoogleAuthResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_IDS.web,
    iosClientId: GOOGLE_CLIENT_IDS.ios,
    androidClientId: GOOGLE_CLIENT_IDS.android,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.authentication?.accessToken;
      if (accessToken) {
        handleGoogleResponse(accessToken);
      }
    } else if (response?.type === 'error') {
      setError('Erro ao autenticar com Google. Tente novamente.');
      setLoading(false);
    }
  }, [response]);

  async function handleGoogleResponse(accessToken: string) {
    setLoading(true);
    setError('');

    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Não foi possível obter os dados do Google.');
      }

      const user: GoogleUser = await userInfoResponse.json();

      await loginWithGoogle({
        googleId: user.id,
        email: user.email,
        nome: user.given_name,
        sobrenome: user.family_name ?? '',
        avatarUrl: user.picture,
      });

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar com Google.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    promptAsync: () => {
      setError('');
      promptAsync();
    },
    loading,
    error,
  };
}
