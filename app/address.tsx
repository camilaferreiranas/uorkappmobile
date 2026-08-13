import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Colors } from "../constants/theme";
import { useAuth } from "../contexts/auth-context";
import { getAddressByCep } from "../services/api";

export default function AddressScreen() {
  const router = useRouter();
  const { user, updateAddress } = useAuth();
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [consultingCep, setConsultingCep] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepError, setCepError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!user?.endereco) return;
    setCep(user.endereco.cep ?? "");
    setRua(user.endereco.rua ?? "");
    setNumero(user.endereco.numero ?? "");
    setBairro(user.endereco.bairro ?? "");
    setCidade(user.endereco.cidade ?? "");
    setEstado(user.endereco.estado ?? "");
  }, [user]);

  const normalizedCep = cep.replace(/\D/g, "");

  useEffect(() => {
    if (normalizedCep.length !== 8) {
      setCepError("");
      setConsultingCep(false);
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      setConsultingCep(true);
      setCepError("");
      setSubmitError("");

      try {
        const address = await getAddressByCep(normalizedCep);
        if (!active) return;

        setCep(address.cep.replace(/\D/g, ""));
        setRua(address.rua ?? "");
        setBairro(address.bairro ?? "");
        setCidade(address.cidade ?? "");
        setEstado(address.estado ?? "");
      } catch (error) {
        if (!active) return;
        setCepError(
          error instanceof Error ? error.message : "Não foi possível consultar o CEP."
        );
      } finally {
        if (active) setConsultingCep(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [normalizedCep]);

  const formError = useMemo(() => {
    if (normalizedCep.length !== 8) return "Informe um CEP com 8 números.";
    if (!rua.trim()) return "Informe a rua.";
    if (!numero.trim()) return "Informe o número.";
    if (!bairro.trim()) return "Informe o bairro.";
    if (!cidade.trim()) return "Informe a cidade.";
    if (estado.trim().length !== 2) return "Informe a sigla do estado.";
    return "";
  }, [bairro, cidade, estado, normalizedCep, numero, rua]);

  function handleCepChange(value: string) {
    setCep(value.replace(/\D/g, "").slice(0, 8));
    setCepError("");
  }

  async function handleSave() {
    if (formError || cepError) return;

    setSaving(true);
    setSubmitError("");

    try {
      await updateAddress({
        cep: normalizedCep,
        rua: rua.trim(),
        numero: numero.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
      });

      Alert.alert("Endereço atualizado", "Seu endereço foi salvo com sucesso.");
      router.back();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Não foi possível salvar o endereço."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu endereço</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>
          Digite o CEP para preencher automaticamente os dados do endereço.
        </Text>

        <View style={styles.card}>
          <Input
            label="CEP"
            value={cep}
            onChangeText={handleCepChange}
            keyboardType="numeric"
            placeholder="00000000"
            maxLength={8}
            error={cepError}
          />

          {consultingCep ? (
            <View style={styles.cepLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.cepLoadingText}>Consultando CEP...</Text>
            </View>
          ) : null}

          <Input
            label="Rua"
            value={rua}
            placeholder="Digite sua rua"
            autoCapitalize="words"
            editable={false}
            style={styles.readOnlyInput}
          />
          <Input
            label="Número"
            value={numero}
            onChangeText={setNumero}
            placeholder="Número do imóvel"
            keyboardType="numeric"
          />
          <Input
            label="Bairro"
            value={bairro}
            placeholder="Digite seu bairro"
            autoCapitalize="words"
            editable={false}
            style={styles.readOnlyInput}
          />
          <Input
            label="Cidade"
            value={cidade}
            placeholder="Digite sua cidade"
            autoCapitalize="words"
            editable={false}
            style={styles.readOnlyInput}
          />
          <Input
            label="Estado"
            value={estado}
            placeholder="UF"
            autoCapitalize="characters"
            maxLength={2}
            editable={false}
            style={styles.readOnlyInput}
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

          <Button
            title="Salvar endereço"
            onPress={handleSave}
            loading={saving}
            disabled={!!formError || !!cepError || consultingCep}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 42,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  description: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  cepLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -4,
    marginBottom: 18,
  },
  cepLoadingText: {
    color: "#737373",
    fontSize: 13,
  },
  readOnlyInput: {
    color: "#666",
    backgroundColor: "#EAEAEA",
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 4,
  },
});
