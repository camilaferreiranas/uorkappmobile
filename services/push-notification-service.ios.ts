type PushData = Record<string, unknown>;

export async function registrarPushTokenAtual(): Promise<null> {
  return null;
}

export async function removerPushTokenAtual(): Promise<void> {}

export function observarRenovacaoPushToken() {
  return () => undefined;
}

export function observarMensagemPushEmPrimeiroPlano() {
  return () => undefined;
}

export function observarToqueEmPush(_callback: (data: PushData) => void) {
  return { remove: () => undefined };
}

export async function consumirUltimoToqueEmPush(
  _callback: (data: PushData) => void
): Promise<void> {}
