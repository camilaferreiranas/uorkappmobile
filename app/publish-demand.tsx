import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const categories = [
  'Eletrônica',
  'Limpeza',
  'Construção',
  'Beleza',
  'Pintura',
  'Jardinagem',
];
const urgencies = ['Normal', 'Urgente', 'Hoje'];

export default function PublishDemandScreen() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState('Selecione a categoria');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [budget, setBudget] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const addPhoto = () => {
    if (photos.length >= 4) return;
    setPhotos((current) => [...current, `Foto ${current.length + 1}`]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Publicar demanda</Text>
          <Text style={styles.pageDescription}>Descreva o serviço que você precisa e encontre o profissional ideal.</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setCategoryOpen((value) => !value)}>
              <Text style={category === 'Selecione a categoria' ? styles.dropdownPlaceholder : styles.dropdownText}>
                {category}
              </Text>
              <Text style={styles.dropdownArrow}>{categoryOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {categoryOpen ? (
              <View style={styles.dropdownList}>
                {categories.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCategory(item);
                      setCategoryOpen(false);
                    }}>
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Troca de lâmpadas e reparos elétricos"
              placeholderTextColor="#A5A5A5"
              style={styles.input}
              maxLength={60}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva com detalhes o serviço que você precisa"
              placeholderTextColor="#A5A5A5"
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Localização</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="CEP ou ponto de referência"
              placeholderTextColor="#A5A5A5"
              style={styles.input}
            />
            <TouchableOpacity style={styles.gpsButton}>
              <Text style={styles.gpsButtonText}>Usar localização atual</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Urgência</Text>
            <View style={styles.pillRow}>
              {urgencies.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.pill, urgency === item && styles.pillActive]}
                  onPress={() => setUrgency(item)}>
                  <Text style={[styles.pillText, urgency === item && styles.pillTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Orçamento estimado (opcional)</Text>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="R$ 0,00"
              placeholderTextColor="#A5A5A5"
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Fotos (opcional)</Text>
            <View style={styles.photosRow}>
              {photos.length > 0 ? (
                photos.map((photo) => (
                  <View key={photo} style={styles.photoThumb}>
                    <Text style={styles.photoText}>{photo}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.photoHint}>Adicione até 4 fotos para explicar melhor sua demanda.</Text>
              )}
            </View>
            <TouchableOpacity style={styles.photoButton} onPress={addPhoto}>
              <Text style={styles.photoButtonText}>Adicionar foto</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.publishButton}>
            <Text style={styles.publishButtonText}>Publicar demanda</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  pageDescription: {
    color: '#6B6B6B',
    fontSize: 15,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#111',
    fontWeight: '700',
    marginBottom: 10,
  },
  dropdownInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dropdownText: {
    color: '#111',
  },
  dropdownPlaceholder: {
    color: '#A5A5A5',
  },
  dropdownArrow: {
    color: '#A5A5A5',
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    color: '#111',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  gpsButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#E75A2B',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  gpsButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  pillActive: {
    backgroundColor: '#E75A2B',
    borderColor: '#E75A2B',
  },
  pillText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#fff',
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoThumb: {
    width: 74,
    height: 74,
    borderRadius: 16,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  photoText: {
    color: '#8A8A8A',
    textAlign: 'center',
    fontSize: 12,
  },
  photoHint: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  photoButton: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingVertical: 14,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#E75A2B',
    fontWeight: '700',
  },
  publishButton: {
    marginTop: 20,
    backgroundColor: '#E75A2B',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
