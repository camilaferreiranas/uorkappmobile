import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Platform } from "react-native";

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

interface LocalizacaoSalva extends Coordenadas {
  capturadaEm: number;
}

const LOCALIZACAO_KEY = "ultima_localizacao";
const LOCALIZACAO_VALIDADE_MS = 15 * 60 * 1000;

async function lerLocalizacaoSalva(): Promise<LocalizacaoSalva | null> {
  try {
    const value =
      Platform.OS === "web"
        ? localStorage.getItem(LOCALIZACAO_KEY)
        : await AsyncStorage.getItem(LOCALIZACAO_KEY);

    if (!value) return null;

    const localizacao: LocalizacaoSalva = JSON.parse(value);
    const coordenadasValidas =
      Number.isFinite(localizacao.latitude) &&
      localizacao.latitude >= -90 &&
      localizacao.latitude <= 90 &&
      Number.isFinite(localizacao.longitude) &&
      localizacao.longitude >= -180 &&
      localizacao.longitude <= 180 &&
      Number.isFinite(localizacao.capturadaEm);

    if (!coordenadasValidas) return null;

    return localizacao;
  } catch {
    return null;
  }
}

async function salvarLocalizacao(localizacao: LocalizacaoSalva): Promise<void> {
  const value = JSON.stringify(localizacao);

  if (Platform.OS === "web") {
    localStorage.setItem(LOCALIZACAO_KEY, value);
    return;
  }

  await AsyncStorage.setItem(LOCALIZACAO_KEY, value);
}

export async function obterLocalizacaoAtual(): Promise<Coordenadas | null> {
  const localizacaoSalva = await lerLocalizacaoSalva();

  if (
    localizacaoSalva &&
    Date.now() - localizacaoSalva.capturadaEm < LOCALIZACAO_VALIDADE_MS
  ) {
    return {
      latitude: localizacaoSalva.latitude,
      longitude: localizacaoSalva.longitude,
    };
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const localizacaoAtual: LocalizacaoSalva = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      capturadaEm: Date.now(),
    };

    try {
      await salvarLocalizacao(localizacaoAtual);
    } catch (error) {
      console.warn("Não foi possível salvar a localização no dispositivo:", error);
    }

    return {
      latitude: localizacaoAtual.latitude,
      longitude: localizacaoAtual.longitude,
    };
  } catch (error) {
    console.warn("Não foi possível obter a localização atual:", error);
    return null;
  }
}
