import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/ui/button';
import { Colors } from '../../constants/theme';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Uork</Text>
      <Text style={styles.body}>
        Simples. Confiável. Feito para você.
      </Text>
      <Button title="Fechar" variant="outline" onPress={() => router.back()} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: Colors.surfaceNeutral,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.brandPrimary,
    letterSpacing: 1,
  },
  body: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
    width: 'auto',
    paddingHorizontal: 32,
  },
});
