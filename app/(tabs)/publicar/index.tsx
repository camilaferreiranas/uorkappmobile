import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { PillGroup } from "../../../components/ui/pill-group";
import { ScreenContainer } from "../../../components/ui/screen-container";
import { Select } from "../../../components/ui/select";
import { Colors } from "../../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  buscarCategorias,
  type Categoria,
} from "../../../services/categoriaService";
import {
  publicarDemanda,
  type FotoDemandaAsset,
  type UrgenciaDemanda,
} from "../../../services/demandaService";
import { obterLocalizacaoDetalhadaAtual } from "../../../services/locationService";

const urgencias = ["Normal", "Urgente", "Hoje"];
const urgenciaApi: Record<string, UrgenciaDemanda> = {
  Normal: "NORMAL",
  Urgente: "URGENTE",
  Hoje: "HOJE",
};
const MAX_FOTOS = 4;
const MAX_TAMANHO_FOTO = 5 * 1024 * 1024;
const TITULO_MIN_LENGTH = 5;
const TITULO_MAX_LENGTH = 60;
const DESCRICAO_MIN_LENGTH = 10;
const DESCRICAO_MAX_LENGTH = 2000;
const LOCALIZACAO_MAX_LENGTH = 255;

interface ErrosFormulario {
  categoria?: string;
  titulo?: string;
  descricao?: string;
  localizacao?: string;
  urgencia?: string;
  orcamento?: string;
}

function tipoDaFoto(
  asset: ImagePicker.ImagePickerAsset
): FotoDemandaAsset["contentType"] | null {
  const tipo = asset.mimeType?.toLowerCase();
  if (tipo === "image/jpeg" || tipo === "image/png" || tipo === "image/webp") {
    return tipo;
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

function numeroDoOrcamento(valor: string): number | undefined {
  const somenteNumero = valor.replace(/[^\d.,]/g, "");
  const normalizado = somenteNumero.includes(",")
    ? somenteNumero.replace(/\./g, "").replace(",", ".")
    : somenteNumero;

  if (!normalizado) return undefined;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : undefined;
}

export default function PublicarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [urgencia, setUrgencia] = useState("Normal");
  const [orcamento, setOrcamento] = useState("");
  const [fotos, setFotos] = useState<FotoDemandaAsset[]>([]);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);
  const [publicando, setPublicando] = useState(false);
  const [erroPublicacao, setErroPublicacao] = useState("");
  const [erros, setErros] = useState<ErrosFormulario>({});

  const carregarCategorias = useCallback(async () => {
    setCarregandoCategorias(true);
    setErroCategorias("");
    try {
      setCategorias(await buscarCategorias());
    } catch (error) {
      setErroCategorias(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as categorias."
      );
    } finally {
      setCarregandoCategorias(false);
    }
  }, []);

  useEffect(() => {
    void carregarCategorias();
  }, [carregarCategorias]);

  const nomesCategorias = useMemo(
    () => categorias.map((categoria) => categoria.nome),
    [categorias]
  );
  const nomeCategoria =
    categorias.find((categoria) => categoria.id === categoriaId)?.nome ?? "";

  function selecionarCategoria(nome: string) {
    const categoria = categorias.find((item) => item.nome === nome);
    setCategoriaId(categoria?.id ?? null);
    setErros((atuais) => ({ ...atuais, categoria: undefined }));
  }

  async function usarLocalizacaoAtual() {
    setObtendoLocalizacao(true);
    setErroPublicacao("");
    try {
      const atual = await obterLocalizacaoDetalhadaAtual();
      if (!atual) {
        Alert.alert(
          "Localização não disponível",
          "Permita o acesso à localização ou informe um CEP ou ponto de referência."
        );
        return;
      }

      setLocalizacao(atual.descricao);
      setLatitude(atual.latitude);
      setLongitude(atual.longitude);
      setErros((atuais) => ({ ...atuais, localizacao: undefined }));
    } finally {
      setObtendoLocalizacao(false);
    }
  }

  async function adicionarFotos() {
    if (fotos.length >= MAX_FOTOS) return;

    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso às fotos para anexar imagens à demanda."
      );
      return;
    }

    const restantes = MAX_FOTOS - fotos.length;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: restantes,
      quality: 0.8,
    });
    if (resultado.canceled) return;

    const novasFotos: FotoDemandaAsset[] = [];
    let possuiFotoInvalida = false;

    for (const asset of resultado.assets.slice(0, restantes)) {
      const contentType = tipoDaFoto(asset);
      if (
        !contentType ||
        (asset.fileSize != null && asset.fileSize > MAX_TAMANHO_FOTO)
      ) {
        possuiFotoInvalida = true;
        continue;
      }

      novasFotos.push({
        uri: asset.uri,
        nome: asset.fileName ?? `demanda-${Date.now()}-${novasFotos.length}.jpg`,
        contentType,
        tamanhoBytes: asset.fileSize,
      });
    }

    setFotos((atuais) => [...atuais, ...novasFotos].slice(0, MAX_FOTOS));
    if (possuiFotoInvalida) {
      Alert.alert(
        "Algumas fotos não foram adicionadas",
        "Use imagens JPEG, PNG ou WebP com até 5 MB cada."
      );
    }
  }

  function removerFoto(uri: string) {
    setFotos((atuais) => atuais.filter((foto) => foto.uri !== uri));
  }

  function validar(): boolean {
    const novosErros: ErrosFormulario = {};
    const valorOrcamento = numeroDoOrcamento(orcamento);
    const tituloSemEspacos = titulo.trim();
    const descricaoSemEspacos = descricao.trim();
    const localizacaoSemEspacos = localizacao.trim();

    if (
      categoriaId == null ||
      categoriaId <= 0 ||
      !categorias.some((categoria) => categoria.id === categoriaId)
    ) {
      novosErros.categoria = "Selecione uma categoria válida.";
    }

    if (!tituloSemEspacos) novosErros.titulo = "O título é obrigatório.";
    else if (tituloSemEspacos.length < TITULO_MIN_LENGTH) {
      novosErros.titulo = `O título deve ter pelo menos ${TITULO_MIN_LENGTH} caracteres.`;
    } else if (tituloSemEspacos.length > TITULO_MAX_LENGTH) {
      novosErros.titulo = `O título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres.`;
    }

    if (!descricaoSemEspacos) novosErros.descricao = "A descrição é obrigatória.";
    else if (descricaoSemEspacos.length < DESCRICAO_MIN_LENGTH) {
      novosErros.descricao = `A descrição deve ter pelo menos ${DESCRICAO_MIN_LENGTH} caracteres.`;
    } else if (descricaoSemEspacos.length > DESCRICAO_MAX_LENGTH) {
      novosErros.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`;
    }

    if (!localizacaoSemEspacos) {
      novosErros.localizacao = "A localização é obrigatória.";
    } else if (localizacaoSemEspacos.length > LOCALIZACAO_MAX_LENGTH) {
      novosErros.localizacao = `A localização deve ter no máximo ${LOCALIZACAO_MAX_LENGTH} caracteres.`;
    } else if ((latitude == null) !== (longitude == null)) {
      novosErros.localizacao = "Latitude e longitude devem ser informadas juntas.";
    } else if (
      latitude != null &&
      longitude != null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      novosErros.localizacao = "A localização atual é inválida. Tente capturá-la novamente.";
    }

    if (!urgenciaApi[urgencia]) {
      novosErros.urgencia = "Selecione uma urgência válida.";
    }

    if (orcamento.trim() && (valorOrcamento == null || valorOrcamento <= 0)) {
      novosErros.orcamento = "O orçamento deve ser maior que zero.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function limparFormulario() {
    setCategoriaId(null);
    setTitulo("");
    setDescricao("");
    setLocalizacao("");
    setLatitude(undefined);
    setLongitude(undefined);
    setUrgencia("Normal");
    setOrcamento("");
    setFotos([]);
    setErros({});
  }

  async function enviar() {
    setErroPublicacao("");
    if (!validar() || categoriaId == null) return;

    setPublicando(true);
    try {
      await publicarDemanda({
        categoriaId,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        localizacao: localizacao.trim(),
        latitude,
        longitude,
        urgencia: urgenciaApi[urgencia] ?? "NORMAL",
        orcamento: numeroDoOrcamento(orcamento),
        fotos,
      });
      limparFormulario();
      Alert.alert(
        "Demanda publicada",
        "Sua demanda foi publicada com sucesso.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/home") }]
      );
    } catch (error) {
      setErroPublicacao(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a demanda."
      );
    } finally {
      setPublicando(false);
    }
  }

  return (
    <ScreenContainer
      backgroundColor={Colors.background}
      contentContainerStyle={{
        ...styles.container,
        paddingTop: insets.top + 16,
      }}
    >
      <Text style={styles.pageTitle}>Publicar demanda</Text>
      <Text style={styles.pageDescription}>
        Descreva o serviço que você precisa e encontre o profissional ideal.
      </Text>

      <Select
        label="Categoria"
        value={nomeCategoria}
        options={nomesCategorias}
        placeholder={carregandoCategorias ? "Carregando categorias..." : "Selecione a categoria"}
        onSelect={selecionarCategoria}
      />
      {carregandoCategorias ? (
        <ActivityIndicator style={styles.categoryLoading} color={Colors.primary} />
      ) : null}
      {erros.categoria ? <Text style={styles.fieldError}>{erros.categoria}</Text> : null}
      {erroCategorias ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{erroCategorias}</Text>
          <TouchableOpacity onPress={() => void carregarCategorias()}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Input
        label="Título"
        value={titulo}
        onChangeText={(valor) => {
          setTitulo(valor);
          setErros((atuais) => ({ ...atuais, titulo: undefined }));
        }}
        placeholder="Ex: Troca de lâmpadas e reparos elétricos"
        maxLength={TITULO_MAX_LENGTH}
        error={erros.titulo}
        style={styles.whiteInput}
      />

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
        maxLength={DESCRICAO_MAX_LENGTH}
        error={erros.descricao}
        style={[styles.whiteInput, styles.textArea]}
      />

      <View style={styles.fieldGroup}>
        <Input
          label="Localização"
          value={localizacao}
          onChangeText={(valor) => {
            setLocalizacao(valor);
            setLatitude(undefined);
            setLongitude(undefined);
            setErros((atuais) => ({ ...atuais, localizacao: undefined }));
          }}
          placeholder="CEP ou ponto de referência"
          maxLength={LOCALIZACAO_MAX_LENGTH}
          error={erros.localizacao}
          style={styles.whiteInput}
        />
        <Button
          title={obtendoLocalizacao ? "Obtendo localização..." : "Usar localização atual"}
          onPress={() => void usarLocalizacaoAtual()}
          loading={obtendoLocalizacao}
          disabled={obtendoLocalizacao}
          style={styles.gpsButton}
          textStyle={styles.gpsButtonText}
        />
      </View>

      <PillGroup
        label="Urgência"
        options={urgencias}
        value={urgencia}
        onSelect={(valor) => {
          setUrgencia(valor);
          setErros((atuais) => ({ ...atuais, urgencia: undefined }));
        }}
      />
      {erros.urgencia ? <Text style={styles.fieldError}>{erros.urgencia}</Text> : null}

      <Input
        label="Orçamento estimado (opcional)"
        value={orcamento}
        onChangeText={(valor) => {
          setOrcamento(valor);
          setErros((atuais) => ({ ...atuais, orcamento: undefined }));
        }}
        placeholder="R$ 0,00"
        keyboardType="decimal-pad"
        maxLength={18}
        error={erros.orcamento}
        style={styles.whiteInput}
      />

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Fotos (opcional)</Text>
        {fotos.length > 0 ? (
          <View style={styles.photosRow}>
            {fotos.map((foto) => (
              <View key={foto.uri} style={styles.photoContainer}>
                <Image source={{ uri: foto.uri }} style={styles.photoThumb} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removerFoto(foto.uri)}
                  accessibilityRole="button"
                  accessibilityLabel="Remover foto"
                >
                  <MaterialIcons name="close" size={17} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.photoHint}>
            Adicione até 4 fotos para explicar melhor sua demanda.
          </Text>
        )}
        <Button
          title={fotos.length >= MAX_FOTOS ? "Limite de 4 fotos atingido" : "Adicionar foto"}
          variant="secondary"
          onPress={() => void adicionarFotos()}
          disabled={fotos.length >= MAX_FOTOS || publicando}
          style={styles.photoButton}
        />
      </View>

      {erroPublicacao ? <Text style={styles.submitError}>{erroPublicacao}</Text> : null}

      <Button
        title="Publicar demanda"
        onPress={() => void enviar()}
        loading={publicando}
        disabled={publicando || carregandoCategorias || Boolean(erroCategorias)}
        style={styles.publishButton}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingBottom: 130,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.black,
    marginBottom: 8,
  },
  pageDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.black,
    fontWeight: "700",
    marginBottom: 10,
  },
  whiteInput: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  categoryLoading: {
    alignSelf: "flex-start",
    marginTop: -12,
    marginBottom: 12,
  },
  fieldError: {
    color: Colors.error,
    fontSize: 13,
    marginTop: -14,
    marginBottom: 14,
  },
  inlineError: {
    backgroundColor: "#FDECEA",
    borderRadius: 12,
    padding: 12,
    marginTop: -10,
    marginBottom: 18,
  },
  inlineErrorText: {
    color: Colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
  },
  gpsButton: {
    marginTop: -8,
    alignSelf: "flex-start",
    minWidth: 210,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    width: "auto",
  },
  gpsButtonText: {
    fontSize: 14,
  },
  photosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  photoContainer: {
    position: "relative",
  },
  photoThumb: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  removePhotoButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.background,
  },
  photoHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  photoButton: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitError: {
    color: Colors.error,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },
  publishButton: {
    marginTop: 20,
    borderRadius: 18,
    paddingVertical: 18,
  },
});
