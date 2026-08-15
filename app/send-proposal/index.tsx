import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Colors } from "../../constants/theme";
import { enviarProposta } from "../../services/propostaService";

const professionalServices = [
  "Instalação elétrica",
  "Troca de lâmpadas",
  "Laudo técnico",
];

export default function SendProposalScreen() {
  const router = useRouter();
  const {
    prestadorId,
    professional,
    service,
    initialTitle,
    initialDescription,
    initialBudget,
  } = useLocalSearchParams<{
    prestadorId: string;
    professional: string;
    service: string;
    initialTitle?: string;
    initialDescription?: string;
    initialBudget?: string;
  }>();

  const [title, setTitle] = useState(initialTitle ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [selectedService, setSelectedService] = useState(service ?? "");
  const [budget, setBudget] = useState(initialBudget ?? "");
  const [enviando, setEnviando] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    
    if (!title.trim()) {
      Alert.alert("Atenção", "Informe um título para a proposta.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Atenção", "Descreva o que você precisa.");
      return;
    }

    const valorNumerico = Number(
      budget.replace("R$", "").trim().replace(".", "").replace(",", ".")
    );

    if (!budget || isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert("Atenção", "Informe um orçamento válido.");
      return;
    }

    if (!prestadorId) {
      Alert.alert("Erro", "Prestador não identificado. Volte e tente novamente.");
      return;
    }

    try {
      setEnviando(true);

      await enviarProposta({
        prestadorId: Number(prestadorId),
        titulo: title.trim(),
        descricao: description.trim(),
        valor: valorNumerico,
      });

      setSubmitted(true);
      setTimeout(() => router.back(), 2000);
    } catch {
      Alert.alert("Erro", "Não foi possível enviar a proposta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialIcons name="check-circle" size={64} color="#2E7D32" />
          </View>
          <Text style={styles.successTitle}>Proposta enviada!</Text>
          <Text style={styles.successText}>
            Sua proposta foi enviada para {professional}. Aguarde o retorno.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Enviar Proposta</Text>
          <Text style={styles.headerSubtitle}>{professional}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            Preencha os detalhes da sua proposta. O profissional receberá uma notificação.
          </Text>
        </View>

        <Input
          label="Título da proposta"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Preciso trocar 3 lâmpadas na sala"
          maxLength={80}
          style={styles.input}
        />

        <Input
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o que você precisa com detalhes..."
          multiline
          numberOfLines={5}
          style={[styles.input, styles.textArea]}
        />

        <Select
          label="Tipo de serviço"
          value={selectedService}
          options={professionalServices}
          placeholder="Selecione o serviço"
          onSelect={setSelectedService}
        />

        <Input
          label="Orçamento disponível"
          value={budget}
          onChangeText={setBudget}
          placeholder="R$ 0,00"
          keyboardType="numeric"
          style={styles.input}
        />

        <Button
          title={enviando ? "Enviando..." : "Enviar proposta"}
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={enviando}
        />

        {enviando && <ActivityIndicator style={{ marginTop: 16 }} color={Colors.primary} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#FFE5D9",
    fontSize: 13,
    marginTop: 2,
  },
  container: {
    padding: 22,
    paddingTop: 26,
    paddingBottom: 60,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFF5F2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 26,
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#FFD5C8",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#5A3020",
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.white,
    borderColor: "#E5E5E5",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 18,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontSize: 15,
    color: "#6B6B6B",
    textAlign: "center",
    lineHeight: 22,
  },
});
