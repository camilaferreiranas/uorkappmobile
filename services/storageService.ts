import AsyncStorage from "@react-native-async-storage/async-storage";

export async function salvarUsuario(usuario: any) {
  await AsyncStorage.setItem("usuario", JSON.stringify(usuario));
}

export async function obterUsuario() {
  const usuario = await AsyncStorage.getItem("usuario");

  return usuario ? JSON.parse(usuario) : null;
}