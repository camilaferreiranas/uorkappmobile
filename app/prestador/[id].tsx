import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { PortfolioGallery } from '@/components/portfolio-gallery';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import {
  ApiError,
  deletePortfolioPhoto,
  getProviderProfile,
  uploadPortfolioPhoto,
  type PerfilPrestador,
  type PortfolioFoto,
} from '@/services/api';

export default function PrestadorPerfilScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const prestadorId = Number(id);
  const { isOwnerOf } = useAuth();
  const isOwner = Number.isFinite(prestadorId) && isOwnerOf(prestadorId);

  const [perfil, setPerfil] = useState<PerfilPrestador | null>(null);
  const [photos, setPhotos] = useState<PortfolioFoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await getProviderProfile(prestadorId);
      setPerfil(data);
      setPhotos(data.portfolio ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar o perfil');
    } finally {
      setLoading(false);
    }
  }, [prestadorId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permissão de acesso às fotos negada.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) {
      return;
    }

    try {
      setUploading(true);
      const nova = await uploadPortfolioPhoto(prestadorId, result.assets[0]);
      setPhotos((prev) => [...prev, nova].sort((a, b) => a.ordem - b.ordem));
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : 'Não foi possível enviar a foto.',
      );
    } finally {
      setUploading(false);
    }
  }, [prestadorId]);

  const handleDelete = useCallback(
    async (foto: PortfolioFoto) => {
      setError(null);
      try {
        await deletePortfolioPhoto(prestadorId, foto.id);
        setPhotos((prev) => prev.filter((p) => p.id !== foto.id));
      } catch (e) {
        setError(
          e instanceof ApiError ? e.message : 'Não foi possível remover a foto.',
        );
      }
    },
    [prestadorId],
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      <Stack.Screen options={{ title: perfil?.nome ?? 'Prestador' }} />

      {perfil ? (
        <ThemedView style={styles.header}>
          <ThemedText type="title">{perfil.nome}</ThemedText>
          <ThemedText>
            {perfil.cidade}
            {perfil.estado ? ` - ${perfil.estado}` : ''}
          </ThemedText>
          {perfil.descricao ? <ThemedText>{perfil.descricao}</ThemedText> : null}
        </ThemedView>
      ) : null}

      <PortfolioGallery
        photos={photos}
        isOwner={isOwner}
        uploading={uploading}
        onAdd={handleAdd}
        onDelete={handleDelete}
        error={error}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { gap: 6 },
});
