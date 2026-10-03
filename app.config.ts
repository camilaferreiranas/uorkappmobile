import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  return {
    ...config,
    name: config.name ?? 'uork',
    slug: config.slug ?? 'uork',
    ios: { ...config.ios, bundleIdentifier: config.ios?.bundleIdentifier ?? 'br.com.uork' },
    plugins: [
      ...(config.plugins ?? []),
      ...(iosClientId ? [[
        '@react-native-google-signin/google-signin',
        { iosUrlScheme: iosClientId.split('.').reverse().join('.') },
      ] as [string, { iosUrlScheme: string }]] : []),
    ],
  };
};
