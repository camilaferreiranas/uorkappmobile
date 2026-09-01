import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Input } from "../../components/ui/input";
import {
  buscarCategorias,
  type Categoria,
} from "../../services/categoriaService";
import { getAddressByCep } from "../../services/api";
import { cadastrarPrestador } from "../../services/prestadorService";

export default function ProfessionalRegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [descricao, setDescricao] = useState("");
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [cepErro, setCepErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const carregarCategorias = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await buscarCategorias();
      setCategorias(
        [...resultado].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as categorias."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCategorias();
  }, [carregarCategorias]);

  const cepNormalizado = cep.replace(/\D/g, "");

  useEffect(() => {
    if (etapa !== 2 || cepNormalizado.length !== 8) {
      setCepErro("");
      setConsultandoCep(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setConsultandoCep(true);
      setCepErro("");

      try {
        const endereco = await getAddressByCep(cepNormalizado);
        if (!active) return;
        setRua(endereco.rua ?? "");
        setBairro(endereco.bairro ?? "");
        setCidade(endereco.cidade ?? "");
        setEstado(endereco.estado ?? "");
      } catch (error) {
        if (!active) return;
        setCepErro(
          error instanceof Error
            ? error.message
            : "Não foi possível consultar o CEP."
        );
      } finally {
        if (active) setConsultandoCep(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cepNormalizado, etapa]);

  const enderecoErro = useMemo(() => {
    if (cepNormalizado.length !== 8) return "Informe um CEP com 8 números.";
    if (!rua.trim()) return "Informe a rua.";
    if (!numero.trim()) return "Informe o número.";
    if (!bairro.trim()) return "Informe o bairro.";
    if (!cidade.trim()) return "Informe a cidade.";
    if (estado.trim().length !== 2) return "Informe a sigla do estado.";
    return "";
  }, [bairro, cepNormalizado, cidade, estado, numero, rua]);

  function avancarParaEndereco() {
    if (categoriaId === null) {
      Alert.alert("Selecione uma categoria", "Escolha o tipo de serviço que você oferece.");
      return;
    }

    if (!descricao.trim()) {
      Alert.alert("Informe sua descrição", "Conte brevemente como você trabalha.");
      return;
    }

    setEtapa(2);
  }

  function voltar() {
    if (etapa === 2) {
      setEtapa(1);
      return;
    }
    router.back();
  }

  function manterCampoVisivel() {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 250);
  }

  async function concluirCadastro() {
    if (categoriaId === null || !descricao.trim()) {
      setEtapa(1);
      return;
    }

    if (enderecoErro || cepErro) {
      Alert.alert("Revise o endereço", cepErro || enderecoErro);
      return;
    }

    try {
      setEnviando(true);
      await cadastrarPrestador({
        descricao: descricao.trim(),
        categoriasIds: [categoriaId],
        endereco: {
          cep: cepNormalizado,
          rua: rua.trim(),
          numero: numero.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
        },
      });
      Alert.alert("Cadastro concluído", "Seu perfil profissional está pronto.");
      router.replace("/professional-home");
    } catch (error) {
      Alert.alert(
        "Não foi possível concluir o cadastro",
        error instanceof Error ? error.message : "Tente novamente em alguns instantes."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={voltar}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <MaterialIcons name="arrow-back" size={23} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Cadastro profissional</Text>
          <Text style={styles.headerSubtitle}>Etapa {etapa} de 2</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.stepsRow}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepCircleActive]}>
              {etapa === 2 ? (
                <MaterialIcons name="check" size={16} color="#fff" />
              ) : (
                <Text style={styles.stepNumberActive}>1</Text>
              )}
            </View>
            <Text style={styles.stepLabelActive}>Serviço</Text>
          </View>
          <View style={[styles.stepLine, etapa === 2 && styles.stepLineActive]} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, etapa === 2 && styles.stepCircleActive]}>
              <Text style={etapa === 2 ? styles.stepNumberActive : styles.stepNumber}>2</Text>
            </View>
            <Text style={etapa === 2 ? styles.stepLabelActive : styles.stepLabel}>
              Endereço
            </Text>
          </View>
        </View>

        {etapa === 1 ? (
          <>
            <View style={styles.introCard}>
              <MaterialIcons name="work-outline" size={24} color="#0D3D8B" />
              <Text style={styles.introText}>
                Selecione sua categoria e escreva uma breve apresentação para os clientes.
              </Text>
            </View>

            <Text style={styles.label}>Categoria</Text>
            <Text style={styles.helperText}>Selecione uma opção</Text>

            {carregando ? (
              <View style={styles.feedbackContainer}>
                <ActivityIndicator color="#0D3D8B" />
                <Text style={styles.feedbackText}>Carregando categorias...</Text>
              </View>
            ) : erro ? (
              <View style={styles.feedbackContainer}>
                <MaterialIcons name="error-outline" size={34} color="#B3261E" />
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => void carregarCategorias()}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : categorias.length === 0 ? (
              <Text style={styles.errorText}>Nenhuma categoria está disponível.</Text>
            ) : (
              <View style={styles.categoriesGrid}>
                {categorias.map((categoria) => {
                  const selecionada = categoria.id === categoriaId;
                  return (
                    <TouchableOpacity
                      key={categoria.id}
                      style={[
                        styles.categoryButton,
                        selecionada && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setCategoriaId(categoria.id)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: selecionada }}
                    >
                      <MaterialIcons
                        name={selecionada ? "check-circle" : "radio-button-unchecked"}
                        size={20}
                        color={selecionada ? "#fff" : "#0D3D8B"}
                      />
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selecionada && styles.categoryButtonTextSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {categoria.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.descriptionHeader}>
              <Text style={styles.label}>Descrição profissional</Text>
              <Text style={styles.characterCount}>{descricao.length}/500</Text>
            </View>
            <TextInput
              style={styles.descriptionInput}
              value={descricao}
              onChangeText={setDescricao}
              onFocus={manterCampoVisivel}
              placeholder="Ex.: Trabalho com instalações e reparos há 5 anos..."
              placeholderTextColor="#9999A2"
              maxLength={500}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={avancarParaEndereco}
              disabled={carregando || categorias.length === 0}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.submitButtonText}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.introCard}>
              <MaterialIcons name="location-on" size={24} color="#0D3D8B" />
              <Text style={styles.introText}>
                Informe o endereço usado como referência para oferecer seus serviços.
              </Text>
            </View>

            <Input
              label="CEP"
              value={cep}
              onChangeText={(value) => setCep(value.replace(/\D/g, "").slice(0, 8))}
              placeholder="00000000"
              keyboardType="numeric"
              maxLength={8}
              error={cepErro}
            />

            {consultandoCep ? (
              <View style={styles.cepLoading}>
                <ActivityIndicator size="small" color="#0D3D8B" />
                <Text style={styles.feedbackText}>Consultando CEP...</Text>
              </View>
            ) : null}

            <Input
              label="Rua"
              value={rua}
              onChangeText={setRua}
              placeholder="Digite sua rua"
              autoCapitalize="words"
            />
            <Input
              label="Número"
              value={numero}
              onChangeText={setNumero}
              onFocus={manterCampoVisivel}
              placeholder="Número ou S/N"
            />
            <Input
              label="Bairro"
              value={bairro}
              onChangeText={setBairro}
              onFocus={manterCampoVisivel}
              placeholder="Digite seu bairro"
              autoCapitalize="words"
            />
            <Input
              label="Cidade"
              value={cidade}
              onChangeText={setCidade}
              onFocus={manterCampoVisivel}
              placeholder="Digite sua cidade"
              autoCapitalize="words"
            />
            <Input
              label="Estado"
              value={estado}
              onChangeText={(value) => setEstado(value.slice(0, 2).toUpperCase())}
              onFocus={manterCampoVisivel}
              placeholder="UF"
              autoCapitalize="characters"
              maxLength={2}
            />

            {enderecoErro && cepNormalizado.length > 0 ? (
              <Text style={styles.addressError}>{enderecoErro}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, enviando && styles.submitButtonDisabled]}
              onPress={() => void concluirCadastro()}
              disabled={enviando || consultandoCep}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {enviando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Concluir cadastro</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F4FB" },
  keyboardAvoidingView: { flex: 1 },
  header: {
    backgroundColor: "#0D3D8B",
    minHeight: 88,
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, alignItems: "center", paddingHorizontal: 4 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: "#B8CCF6", fontSize: 12, marginTop: 3 },
  headerSpacer: { width: 48 },
  container: { padding: 20, paddingBottom: 44 },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepItem: { alignItems: "center", width: 76 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#DDE3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: { backgroundColor: "#0D3D8B" },
  stepNumber: { color: "#7A7A95", fontSize: 13, fontWeight: "800" },
  stepNumberActive: { color: "#fff", fontSize: 13, fontWeight: "800" },
  stepLabel: { color: "#8A8A94", fontSize: 11, fontWeight: "700", marginTop: 5 },
  stepLabelActive: { color: "#0D3D8B", fontSize: 11, fontWeight: "800", marginTop: 5 },
  stepLine: {
    width: 70,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#DDE3EF",
    marginTop: 14,
    marginHorizontal: -18,
  },
  stepLineActive: { backgroundColor: "#0D3D8B" },
  introCard: {
    backgroundColor: "#E8EDFA",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 24,
  },
  introText: { flex: 1, color: "#33415C", fontSize: 13, lineHeight: 19 },
  label: { color: "#17171C", fontSize: 15, fontWeight: "800" },
  helperText: { color: "#7A7A95", fontSize: 12, marginTop: 4, marginBottom: 12 },
  feedbackContainer: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  feedbackText: { color: "#7A7A95", fontSize: 13 },
  cepLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: -5,
    marginBottom: 18,
  },
  errorText: { color: "#B3261E", fontSize: 13, lineHeight: 18, textAlign: "center" },
  addressError: {
    color: "#B3261E",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: -4,
  },
  retryButton: {
    borderRadius: 12,
    backgroundColor: "#0D3D8B",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryButtonText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 26,
  },
  categoryButton: {
    width: "48%",
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CCD6EA",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryButtonSelected: { backgroundColor: "#0D3D8B", borderColor: "#0D3D8B" },
  categoryButtonText: { flex: 1, color: "#33415C", fontSize: 13, fontWeight: "700" },
  categoryButtonTextSelected: { color: "#fff" },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  characterCount: { color: "#8A8A94", fontSize: 11 },
  descriptionInput: {
    minHeight: 138,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8DEEA",
    backgroundColor: "#fff",
    padding: 15,
    color: "#17171C",
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: "#0D3D8B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  submitButtonDisabled: { opacity: 0.65 },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
});
