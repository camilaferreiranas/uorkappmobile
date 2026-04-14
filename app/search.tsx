import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const filters = [
  { key: 'categoria', label: 'Categoria' },
  { key: 'localizacao', label: 'Localização' },
  { key: 'avaliacao', label: 'Avaliação' },
];

const professionals = [
  {
    name: 'Rafael Oliveira',
    specialty: 'Técnico em Eletrônica',
    rating: 4.9,
    distance: '1.2 km',
    initials: 'RO',
    category: 'Eletrônica',
    location: 'Centro',
  },
  {
    name: 'Patrícia Silva',
    specialty: 'Limpeza residencial',
    rating: 4.8,
    distance: '2.0 km',
    initials: 'PS',
    category: 'Limpeza',
    location: 'Zona Sul',
  },
  {
    name: 'Carlos Mendes',
    specialty: 'Instalação elétrica',
    rating: 4.7,
    distance: '3.4 km',
    initials: 'CM',
    category: 'Eletrônica',
    location: 'Bairro Alto',
  },
  {
    name: 'Ana Paula',
    specialty: 'Pintura e reformas',
    rating: 4.6,
    distance: '4.8 km',
    initials: 'AP',
    category: 'Pintura',
    location: 'Centro',
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const text = `${professional.name} ${professional.specialty} ${professional.category} ${professional.location}`.toLowerCase();
      const matchesQuery = query.trim() ? text.includes(query.toLowerCase()) : true;
      let matchesFilter = true;

      if (activeFilter === 'categoria') {
        matchesFilter = professional.category.toLowerCase().includes('eletrônica');
      }
      if (activeFilter === 'localizacao') {
        matchesFilter = professional.location.toLowerCase().includes('centro');
      }
      if (activeFilter === 'avaliacao') {
        matchesFilter = professional.rating >= 4.8;
      }

      return matchesQuery && matchesFilter;
    });
  }, [query, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Buscar profissionais</Text>
        <Text style={styles.description}>Pesquise por serviço, especialista ou localidade e encontre o profissional ideal.</Text>

        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#B0B0B0" />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque por eletricista, pintor, limpeza..."
            placeholderTextColor="#B0B0B0"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>

        <View style={styles.filtersRow}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterPill, activeFilter === filter.key && styles.filterPillActive]}
              onPress={() => setActiveFilter(activeFilter === filter.key ? null : filter.key)}>
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.resultCount}>{filteredProfessionals.length} profissionais encontrados</Text>

        {filteredProfessionals.map((professional) => (
          <View key={professional.name} style={styles.card}>
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{professional.initials}</Text>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.profileName}>{professional.name}</Text>
                <Text style={styles.profileSpecialty}>{professional.specialty}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={14} color="#FFB800" />
                    <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={styles.distanceText}>{professional.distance}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
              <Text style={styles.profileButtonText}>Ver perfil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#6B6B6B',
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    marginBottom: 18,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: '#E75A2B',
    borderColor: '#E75A2B',
  },
  filterText: {
    color: '#6B6B6B',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  resultCount: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#E75A2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 4,
  },
  profileSpecialty: {
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF4E8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
  },
  ratingText: {
    color: '#BF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
  distanceText: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  profileButton: {
    marginTop: 18,
    backgroundColor: '#E75A2B',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  profileButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
