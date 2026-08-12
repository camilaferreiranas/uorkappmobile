import * as Location from "expo-location";

export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export async function obterLocalizacaoAtual(): Promise<Coordenadas | null> {
  try {
    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== Location.PermissionStatus.GRANTED) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn("Não foi possível obter a localização atual:", error);
    return null;
  }
}
