import notifee, { AndroidImportance, EventType } from "@notifee/react-native";
import {
  deleteToken,
  getInitialNotification,
  getMessaging,
  getToken as getFirebaseToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import { PermissionsAndroid, Platform } from "react-native";

import { API_URL } from "./api_url";
import { getToken } from "./token-storage";

const PUSH_TOKEN_KEY = "uork_fcm_push_token";
const CHANNEL_ID = "propostas";
const REQUEST_TIMEOUT_MS = 8000;
const firebaseMessaging = getMessaging();

async function request(
  method: "POST" | "DELETE",
  fcmToken: string,
  accessToken?: string
) {
  const stored = accessToken ? null : await getToken();
  const token = accessToken ?? stored?.accessToken;
  if (!token) throw new Error("Sessão expirada. Entre novamente.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/notificacoes/push-tokens`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token: fcmToken }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Não foi possível atualizar as notificações do aparelho.");
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function criarCanalAndroid() {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: "Propostas",
    description: "Atualizações sobre propostas de serviço do Uork",
    importance: AndroidImportance.HIGH,
    vibration: true,
    lights: true,
    lightColor: "#174A9C",
  });
}

async function solicitarPermissaoAndroid(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if (Number(Platform.Version) < 33) return true;

  const permissao = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );
  return permissao === PermissionsAndroid.RESULTS.GRANTED;
}

async function registrarTokenNoBackend(fcmToken: string): Promise<void> {
  await request("POST", fcmToken);
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, fcmToken);
}

export async function registrarPushTokenAtual(): Promise<string | null> {
  if (Platform.OS !== "android") return null;
  if (!(await solicitarPermissaoAndroid())) return null;

  await criarCanalAndroid();
  const fcmToken = await getFirebaseToken(firebaseMessaging);
  await registrarTokenNoBackend(fcmToken);
  return fcmToken;
}

export async function removerPushTokenAtual(accessToken?: string): Promise<void> {
  if (Platform.OS !== "android") return;

  const fcmToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!fcmToken) return;

  let erroRemocao: unknown;
  try {
    await request("DELETE", fcmToken, accessToken);
  } catch (error) {
    erroRemocao = error;
  } finally {
    await deleteToken(firebaseMessaging).catch(() => undefined);
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  }

  if (erroRemocao) throw erroRemocao;
}

export function observarRenovacaoPushToken() {
  if (Platform.OS !== "android") return () => undefined;

  return onTokenRefresh(firebaseMessaging, (fcmToken) => {
    void registrarTokenNoBackend(fcmToken).catch((error) => {
      console.warn("Não foi possível renovar o token FCM:", error);
    });
  });
}

export function observarMensagemPushEmPrimeiroPlano() {
  if (Platform.OS !== "android") return () => undefined;

  return onMessage(firebaseMessaging, async (message) => {
    const channelId = await criarCanalAndroid();
    await notifee.displayNotification({
      title: message.notification?.title ?? "Uork",
      body: message.notification?.body,
      data: message.data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: { id: "default" },
      },
    });
  });
}

export function observarToqueEmPush(
  callback: (data: Record<string, unknown>) => void
) {
  if (Platform.OS !== "android") return { remove: () => undefined };

  const removerFirebase = onNotificationOpenedApp(firebaseMessaging, (message) => {
    callback(message.data ?? {});
  });
  const removerNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      callback(detail.notification?.data ?? {});
    }
  });

  return {
    remove: () => {
      removerFirebase();
      removerNotifee();
    },
  };
}

export async function consumirUltimoToqueEmPush(
  callback: (data: Record<string, unknown>) => void
) {
  if (Platform.OS !== "android") return;

  const mensagemFirebase = await getInitialNotification(firebaseMessaging);
  if (mensagemFirebase) {
    callback(mensagemFirebase.data ?? {});
    return;
  }

  const mensagemNotifee = await notifee.getInitialNotification();
  if (mensagemNotifee) {
    callback(mensagemNotifee.notification.data ?? {});
  }
}
