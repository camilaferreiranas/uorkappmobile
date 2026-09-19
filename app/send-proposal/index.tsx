import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PillGroup } from "../../components/ui/pill-group";
import { Select } from "../../components/ui/select";
import { Colors } from "../../constants/theme";
import { obterLocalizacaoDetalhadaAtual } from "../../services/locationService";
import { enviarProposta, type NovaProposta } from "../../services/propostaService";

const OUTROS = "Outros";
const URGENCIAS = ["Normal", "Urgente", "Hoje"];
const URGENCIA_API: Record<string, NovaProposta["urgencia"]> = {
  Normal: "NORMAL",
  Urgente: "URGENTE",
  Hoje: "HOJE",
};
const MAX_FOTO_BYTES = 5 * 1024 * 1024;
const MAX_TIPO_SERVICO = 60;
const MAX_DESCRICAO = 500;
const MAX_LOCALIZACAO = 255;

type FotoProposta = NonNullable<NovaProposta["foto"]>;

interface ErrosFormulario {
  tipoServico?: string;
  descricao?: string;
  localizacao?: string;
  urgencia?: string;
}

function tipoDaFoto(
  asset: ImagePicker.ImagePickerAsset
): FotoProposta["contentType"] | null {
  const mimeType = asset.mimeType?.toLowerCase();
  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp"
  ) {
    return mimeType;
  }

  const extensao = (asset.fileName ?? asset.uri)
    .split(/[?#]/, 1)[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  if (extensao === "jpg" || extensao === "jpeg") return "image/jpeg";
  if (extensao === "png") return "image/png";
  if (extensao === "webp") return "image/webp";
  return null;
}

function lerServicos(valor?: string): string[] {
  if (!valor) return [];
  try {
    const itens = JSON.parse(valor) as unknown;
    return Array.isArray(itens)
      ? itens.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  } catch {
    return [];
  }
}

export default function SendProposalScreen() {
  const router = useRouter();
  const {
    prestadorId,
    professional,
    service,
    serviceOptions,
    initialDescription,
    initialLocation,
    initialUrgency,
  } = useLocalSearchParams<{
    prestadorId: string;
    professional: string;
    service?: string;
    serviceOptions?: string;
    initialDescription?: string;
    initialLocation?: string;
    initialUrgency?: string;
  }>();

  const opcoesServico = useMemo(() => {
    const opcoes = [service ?? "", ...lerServicos(serviceOptions)]
      .map((item) => item.trim())
      .filter((item) => item && item.toLowerCase() !== OUTROS.toLowerCase());
    return [...new Set(opcoes), OUTROS];
  }, [service, serviceOptions]);

  const [servicoSelecionado, setServicoSelecionado] = useState(service ?? "");
  const [outroServico, setOutroServico] = useState("");
  const [descricao, setDescricao] = useState(initialDescription ?? "");
  const [localizacao, setLocalizacao] = useState(initialLocation ?? "");
  const [urgencia, setUrgencia] = useState(
    URGENCIAS.includes(initialUrgency ?? "") ? initialUrgency! : "Normal"
  );
  const [foto, setFoto] = useState<FotoProposta | undefined>();
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroEnvio, setErroEnvio] = useState("");
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  const tipoServico =
    servicoSelecionado === OUTROS ? outroServico.trim() : servicoSelecionado.trim();

  async function usarLocalizacaoAtual() {
    setObtendoLocalizacao(true);
    setErroEnvio("");
    try {
      const atual = await obterLocalizacaoDetalhadaAtual();
      if (!atual) {
        Alert.alert(
          "Localização não disponível",
          "Permita o acesso à localização ou informe o endereço do serviço."
        );
        return;
      }
      setLocalizacao(atual.descricao);
      setErros((atuais) => ({ ...atuais, localizacao: undefined }));
    } finally {
      setObtendoLocalizacao(false);
    }
  }

  async function selecionarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso às fotos para anexar uma imagem à proposta."
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (resultado.canceled) return;

    const asset = resultado.assets[0];
    const contentType = tipoDaFoto(asset);
    if (!contentType || (asset.fileSize != null && asset.fileSize > MAX_FOTO_BYTES)) {
      Alert.alert(
        "Foto inválida",
        "Use uma imagem JPEG, PNG ou WebP com até 5 MB."
      );
      return;
    }

    setFoto({
      uri: asset.uri,
      nome: asset.fileName ?? `proposta-${Date.now()}.jpg`,
      contentType,
    });
  }

  function validar(): boolean {
    const novosErros: ErrosFormulario = {};
    const descricaoNormalizada = descricao.trim();
    const localizacaoNormalizada = localizacao.trim();

    if (!tipoServico) {
      novosErros.tipoServico =
        servicoSelecionado === OUTROS
          ? "Informe qual tipo de serviço você precisa."
          : "Selecione o tipo de serviço.";
    } else if (tipoServico.length < 2 || tipoServico.length > MAX_TIPO_SERVICO) {
      novosErros.tipoServico = "O tipo de serviço deve ter entre 2 e 60 caracteres.";
    }

    if (!descricaoNormalizada) {
      novosErros.descricao = "A descrição é obrigatória.";
    } else if (descricaoNormalizada.length < 10) {
      novosErros.descricao = "A descrição deve ter pelo menos 10 caracteres.";
    }

    if (!localizacaoNormalizada) {
      novosErros.localizacao = "A localização do serviço é obrigatória.";
    }

    if (!URGENCIA_API[urgencia]) {
      novosErros.urgencia = "Selecione a urgência da demanda.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function enviar() {
    setErroEnvio("");
    if (!validar()) return;

    const id = Number(prestadorId);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setErroEnvio("Prestador não identificado. Volte e tente novamente.");
      return;
    }

    setEnviando(true);
    try {
      await enviarProposta({
        prestadorId: id,
        tipoServico,
        descricao: descricao.trim(),
        localizacao: localizacao.trim(),
        urgencia: URGENCIA_API[urgencia] ?? "NORMAL",
        foto,
      });
      setEnviada(true);
    } catch (error) {
      setErroEnvio(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a proposta."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (enviada) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={70} color={Colors.success} />
          <Text style={styles.successTitle}>Proposta enviada!</Text>
          <Text style={styles.successText}>
            {professional} recebeu sua solicitação e poderá analisar os detalhes do serviço.
          </Text>
          <Button title="Voltar ao perfil" onPress={() => router.back()} style={styles.successButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Enviar proposta</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{professional}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Select
          label="Tipo de serviço"
          value={servicoSelecionado}
          options={opcoesServico}
          placeholder="Selecione o tipo de serviço"
          onSelect={(valor) => {
            setServicoSelecionado(valor);
            setErros((atuais) => ({ ...atuais, tipoServico: undefined }));
          }}
        />
        {servicoSelecionado === OUTROS ? (
          <Input
            label="Qual serviço você precisa?"
            value={outroServico}
            onChangeText={(valor) => {
              setOutroServico(valor);
              setErros((atuais) => ({ ...atuais, tipoServico: undefined }));
            }}
            placeholder="Ex: Montagem de móveis"
            maxLength={MAX_TIPO_SERVICO}
            error={erros.tipoServico}
            style={styles.input}
          />
        ) : erros.tipoServico ? (
          <Text style={styles.fieldError}>{erros.tipoServico}</Text>
        ) : null}

        <Input
          label="Descrição"
          value={descricao}
          onChangeText={(valor) => {
            setDescricao(valor);
            setErros((atuais) => ({ ...atuais, descricao: undefined }));
          }}
          placeholder="Descreva com detalhes o serviço que você precisa"
          multiline
          numberOfLines={6}
          maxLength={MAX_DESCRICAO}
          error={erros.descricao}
          style={[styles.input, styles.textArea]}
        />

        <Input
          label="Localização do serviço"
          value={localizacao}
          onChangeText={(valor) => {
            setLocalizacao(valor);
            setErros((atuais) => ({ ...atuais, localizacao: undefined }));
          }}
          placeholder="CEP, endereço ou ponto de referência"
          maxLength={MAX_LOCALIZACAO}
          error={erros.localizacao}
          style={styles.input}
        />
        <Button
          title={obtendoLocalizacao ? "Obtendo localização..." : "Usar localização atual"}
          onPress={() => void usarLocalizacaoAtual()}
          loading={obtendoLocalizacao}
          disabled={obtendoLocalizacao || enviando}
          style={styles.locationButton}
        />

        <PillGroup
          label="Urgência da demanda"
          options={URGENCIAS}
          value={urgencia}
          onSelect={(valor) => {
            setUrgencia(valor);
            setErros((atuais) => ({ ...atuais, urgencia: undefined }));
          }}
        />
        {erros.urgencia ? <Text style={styles.fieldError}>{erros.urgencia}</Text> : null}

        <View style={styles.photoSection}>
          <Text style={styles.label}>Foto (opcional)</Text>
          {foto ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: foto.uri }} style={styles.photoPreview} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => setFoto(undefined)}
                accessibilityLabel="Remover foto"
              >
                <MaterialIcons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.photoHint}>Você pode anexar uma imagem de até 5 MB.</Text>
          )}
          <Button
            title={foto ? "Trocar foto" : "Adicionar foto"}
            variant="secondary"
            onPress={() => void selecionarFoto()}
            disabled={enviando}
            style={styles.photoButton}
          />
        </View>

        {erroEnvio ? <Text style={styles.submitError}>{erroEnvio}</Text> : null}
        <Button
          title={enviando ? "Enviando..." : "Enviar proposta"}
          onPress={() => void enviar()}
          disabled={enviando}
          style={styles.submitButton}
        />
        {enviando ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
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
  headerContent: { flex: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  headerSubtitle: { color: Colors.primaryLight, fontSize: 13, marginTop: 2 },
  container: { padding: 22, paddingTop: 26, paddingBottom: 60 },
  input: { backgroundColor: Colors.white, borderColor: Colors.border },
  textArea: { minHeight: 130, textAlignVertical: "top" },
  fieldError: { color: Colors.error, fontSize: 13, marginTop: -14, marginBottom: 16 },
  locationButton: {
    alignSelf: "flex-start",
    width: "auto",
    minWidth: 210,
    marginTop: -8,
    marginBottom: 22,
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  photoSection: { marginTop: 2, marginBottom: 8 },
  label: { color: Colors.black, fontSize: 14, fontWeight: "700", marginBottom: 10 },
  photoHint: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  photoPreviewContainer: { alignSelf: "flex-start", position: "relative" },
  photoPreview: { width: 120, height: 120, borderRadius: 18, backgroundColor: Colors.background },
  removePhotoButton: {
    position: "absolute",
    top: -7,
    right: -7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButton: { marginTop: 14, borderRadius: 15, borderColor: Colors.border },
  submitError: { color: Colors.error, textAlign: "center", fontSize: 13, lineHeight: 18, marginTop: 12 },
  submitButton: { marginTop: 18, borderRadius: 18, paddingVertical: 18 },
  loading: { marginTop: 14 },
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  successTitle: { fontSize: 26, fontWeight: "800", color: "#111", marginTop: 18 },
  successText: { fontSize: 15, color: "#666", textAlign: "center", lineHeight: 22, marginTop: 10 },
  successButton: { marginTop: 28, borderRadius: 16 },
});
