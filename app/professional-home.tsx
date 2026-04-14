import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const metrics = [
  { label: 'Novos pedidos', value: '12', note: 'Hoje' },
  { label: 'Em andamento', value: '8', note: 'Ativos' },
  { label: 'Faturamento', value: 'R$ 2.4k', note: 'Últimos 30 dias' },
];

const nearbyDemands = [
  {
    title: 'Instalação elétrica',
    subtitle: 'Apartamento, 3 pontos',
    budget: 'R$ 340',
    urgency: 'Urgente',
    distance: '1,8 km',
  },
  {
    title: 'Troca de torneira',
    subtitle: 'Cozinha residencial',
    budget: 'R$ 120',
    urgency: 'Normal',
    distance: '2,3 km',
  },
  {
    title: 'Limpeza pós-obra',
    subtitle: 'Casa térrea',
    budget: 'R$ 420',
    urgency: 'Hoje',
    distance: '3,1 km',
  },
];

const lastReview = {
  name: 'Mariana Costa',
  comment: 'Serviço impecável, pontual e muito atencioso.',
  rating: 5.0,
  date: '2 dias atrás',
};

export default function ProfessionalHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Olá, Rafael</Text>
            <Text style={styles.headerSubtitle}>Disponível</Text>
          </View>
          <View style={styles.headerBadge}>
            <MaterialIcons name="circle" size={12} color="#4CD964" />
            <Text style={styles.headerBadgeText}>Online</Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.switchLabel}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.switchButton, styles.switchButtonActive]}>
            <Text style={[styles.switchLabel, styles.switchLabelActive]}>Profissional</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricNote}>{metric.note}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Demandas próximas</Text>
          <Text style={styles.sectionSubtitle}>{nearbyDemands.length} encontradas</Text>
        </View>

        {nearbyDemands.map((demand) => (
          <View key={demand.title} style={styles.demandCard}>
            <View style={styles.demandInfo}>
              <Text style={styles.demandTitle}>{demand.title}</Text>
              <Text style={styles.demandSubtitle}>{demand.subtitle}</Text>
              <View style={styles.demandMetaRow}>
                <View style={styles.demandTag}>
                  <Text style={styles.demandTagText}>{demand.urgency}</Text>
                </View>
                <Text style={styles.demandDistance}>{demand.distance}</Text>
              </View>
            </View>
            <View style={styles.demandAction}>
              <Text style={styles.demandBudget}>{demand.budget}</Text>
              <TouchableOpacity style={styles.proposalButton}>
                <Text style={styles.proposalButtonText}>Enviar proposta</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.reviewCard}> 
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>Última avaliação</Text>
            <View style={styles.reviewBadge}>
              <MaterialIcons name="star" size={14} color="#227D41" />
              <Text style={styles.reviewBadgeText}>{lastReview.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.reviewAuthor}>{lastReview.name} · {lastReview.date}</Text>
          <Text style={styles.reviewComment}>{lastReview.comment}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          { label: 'Início', icon: 'home', active: true },
          { label: 'Demandas', icon: 'list' },
          { label: 'Chat', icon: 'chat-bubble-outline' },
          { label: 'Relatório', icon: 'bar-chart' },
          { label: 'Perfil', icon: 'person' },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.navItem}>
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={item.active ? '#0D3D8B' : '#7A7A95'}
            />
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F4FB',
  },
  container: {
    paddingBottom: 120,
  },
  header: {
    backgroundColor: '#0D3D8B',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#B8CCF6',
    fontSize: 14,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBadgeText: {
    color: '#D1E0FF',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -22,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
  },
  metricLabel: {
    color: '#7A7A95',
    fontSize: 13,
    marginBottom: 10,
  },
  metricNote: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  sectionHeader: {
    marginTop: 24,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7A7A95',
  },
  demandCard: {
    marginTop: 16,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  demandInfo: {
    flex: 1,
    marginRight: 12,
  },
  demandTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    color: '#111',
  },
  demandSubtitle: {
    fontSize: 13,
    color: '#7A7A95',
    marginBottom: 12,
  },
  demandMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  demandTag: {
    backgroundColor: '#F8F3E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  demandTagText: {
    color: '#D86A3F',
    fontWeight: '700',
    fontSize: 12,
  },
  demandDistance: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  demandAction: {
    alignItems: 'flex-end',
  },
  demandBudget: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  proposalButton: {
    backgroundColor: '#0D3D8B',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  proposalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  reviewCard: {
    backgroundColor: '#E9F7EE',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewBadge: {
    flexDirection: 'row',
    backgroundColor: '#D6F0D8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    gap: 6,
  },
  reviewBadgeText: {
    color: '#227D41',
    fontWeight: '700',
    fontSize: 13,
  },
  reviewAuthor: {
    color: '#2B2B2B',
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewComment: {
    color: '#505050',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    color: '#7A7A95',
    fontSize: 10,
    marginTop: 4,
  },
  navLabelActive: {
    color: '#0D3D8B',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#0D3D8B',
  },
  switchLabel: {
    color: '#7A7A95',
    fontWeight: '700',
  },
  switchLabelActive: {
    color: '#fff',
  },
});
