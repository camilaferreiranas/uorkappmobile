import { useRef, useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import type { GoogleAuthPayload } from '../services/api';

export function useGoogleLogin(authorize: () => Promise<GoogleAuthPayload | null>, onSuccess: () => void) {
  const { loginWithGoogle } = useAuth();
  const pending = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function promptAsync() {
    if (pending.current) return;
    pending.current = true;
    setLoading(true);
    setError('');
    try {
      const credentials = await authorize();
      if (!credentials) return;
      await loginWithGoogle(credentials);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao autenticar com Google. Tente novamente.');
    } finally {
      pending.current = false;
      setLoading(false);
    }
  }

  return { promptAsync, loading, error };
}
