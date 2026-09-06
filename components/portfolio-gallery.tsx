import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { PortfolioFoto } from '@/services/api';

export const MAX_FOTOS = 4;

type Props = {
  photos: PortfolioFoto[];
  isOwner: boolean;
  uploading?: boolean;
  onAdd: () => void;
  onDelete: (foto: PortfolioFoto) => void;
  error?: string | null;
};

export function PortfolioGallery({
  photos,
  isOwner,
  uploading = false,
  onAdd,
  onDelete,
  error,
}: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const canAdd = isOwner && photos.length < MAX_FOTOS;

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Portfólio</ThemedText>

      {photos.length === 0 && !canAdd ? (
        <ThemedText style={styles.empty}>Nenhuma foto no portfólio ainda.</ThemedText>
      ) : null}

      <View style={styles.grid}>
        {photos.map((foto) => (
          <Pressable
            key={foto.id}
            style={styles.tile}
            onLongPress={isOwner ? () => setConfirmId(foto.id) : undefined}>
            <Image source={{ uri: foto.url }} style={styles.image} contentFit="cover" />

            {confirmId === foto.id ? (
              <View style={styles.confirmOverlay}>
                <ThemedText style={styles.confirmText}>Remover?</ThemedText>
                <View style={styles.confirmActions}>
                  <Pressable
                    onPress={() => {
                      setConfirmId(null);
                      onDelete(foto);
                    }}>
                    <ThemedText style={styles.confirmYes}>Sim</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => setConfirmId(null)}>
                    <ThemedText style={styles.confirmNo}>Não</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </Pressable>
        ))}

        {canAdd ? (
          <Pressable
            style={[styles.tile, styles.addTile]}
            onPress={onAdd}
            disabled={uploading}
            accessibilityRole="button"
            accessibilityLabel="adicionar foto">
            {uploading ? (
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.addLabel}>＋{'\n'}adicionar foto</ThemedText>
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { opacity: 0.7 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(127,127,127,0.15)',
  },
  image: { width: '100%', height: '100%' },
  addTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(127,127,127,0.5)',
  },
  addLabel: { textAlign: 'center', opacity: 0.8 },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmText: { color: '#fff' },
  confirmActions: { flexDirection: 'row', gap: 20 },
  confirmYes: { color: '#ff6b6b', fontWeight: '700' },
  confirmNo: { color: '#fff' },
  error: { color: '#ff6b6b' },
});
