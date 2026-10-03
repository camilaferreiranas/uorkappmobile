/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockSecureStore = new Map<string, string>();

jest.mock(
  'expo-secure-store',
  () => ({
    AFTER_FIRST_UNLOCK: 1,
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 2,
    ALWAYS: 3,
    getItemAsync: jest.fn(async (key: string) => mockSecureStore.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      mockSecureStore.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      mockSecureStore.delete(key);
    }),
    __reset: () => mockSecureStore.clear(),
    __store: mockSecureStore,
  }),
  { virtual: true }
);

jest.mock(
  'expo-crypto',
  () => ({
    getRandomBytesAsync: jest.fn(async () => new Uint8Array(16)),
    getRandomUUID: jest.fn(() => '00000000-0000-4000-8000-000000000000'),
    digestStringAsync: jest.fn(async () => 'hash'),
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    CryptoEncoding: { HEX: 'hex' },
  }),
  { virtual: true }
);

jest.mock(
  'expo-haptics',
  () => ({
    impactAsync: jest.fn(async () => undefined),
    notificationAsync: jest.fn(async () => undefined),
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-google-signin/google-signin',
  () => ({
    GoogleSignin: {
      configure: jest.fn(),
      hasPlayServices: jest.fn(async () => true),
      signIn: jest.fn(async () => ({ type: 'success', data: undefined })),
      signInSilently: jest.fn(async () => ({ type: 'success', data: undefined })),
      signOut: jest.fn(async () => undefined),
      revokeAccess: jest.fn(async () => undefined),
      getTokens: jest.fn(async () => ({ idToken: 'id-token', accessToken: 'access-token' })),
      isSignedIn: jest.fn(async () => false),
      getCurrentUser: jest.fn(async () => null),
    },
    isSuccessResponse: (value: unknown): value is { type: 'success' } =>
      !!value && (value as { type?: string }).type === 'success',
    isErrorWithCode: (value: unknown): value is { code: number } =>
      !!value && typeof (value as { code?: unknown }).code === 'number',
    statusCodes: {
      SIGN_IN_CANCELLED: 12501,
      IN_PROGRESS: 12502,
      PLAY_SERVICES_NOT_AVAILABLE: 12503,
    },
  }),
  { virtual: true }
);

jest.mock(
  '@react-native-firebase/messaging',
  () => {
    const messaging = jest.fn(() => ({
      getToken: jest.fn(async () => 'fcm-token'),
      requestPermission: jest.fn(async () => 1),
      onMessage: jest.fn(() => jest.fn()),
      onBackgroundMessage: jest.fn(),
      setBackgroundMessageHandler: jest.fn(async () => undefined),
      getInitialNotification: jest.fn(async () => null),
      onNotificationOpenedApp: jest.fn(() => jest.fn()),
      isDeviceRegisteredForRemoteMessages: jest.fn(async () => false),
      registerDeviceForRemoteMessages: jest.fn(async () => undefined),
      unsubscribeFromTopic: jest.fn(async () => undefined),
      subscribeToTopic: jest.fn(async () => undefined),
    }));
    return {
      __esModule: true,
      default: messaging,
      getMessaging: messaging,
      FirebaseMessagingTypes: {},
    };
  },
  { virtual: true }
);

jest.mock(
  '@notifee/react-native',
  () => {
    const notifee = {
      cancelAllNotifications: jest.fn(async () => undefined),
      createChannel: jest.fn(async () => 'channel-id'),
      displayNotification: jest.fn(async () => 'notification-id'),
      getInitialNotification: jest.fn(async () => null),
      onForegroundEvent: jest.fn(() => jest.fn()),
      registerForegroundService: jest.fn(async () => undefined),
      setBadgeCount: jest.fn(async () => undefined),
      stopForegroundService: jest.fn(async () => undefined),
    };
    return {
      __esModule: true,
      default: notifee,
      AndroidImportance: { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 },
      EventType: { PRESS: 0, DISMISSED: 2, TRIGGER: 4 },
      AndroidColor: {},
    };
  },
  { virtual: true }
);

const defaultFetch = jest.fn(async () => {
  throw new Error('fetch não configurado: configure o mock no teste (ver tests/helpers/mock-fetch)');
});

Object.assign(globalThis, { fetch: defaultFetch, __defaultFetch: defaultFetch });
