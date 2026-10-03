// Public OAuth identifiers; never put a client secret in the app.
export const GOOGLE_CLIENT_IDS = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '1001078574463-fnpqj5hv92f7a0k4ql70gr35qpe74569.apps.googleusercontent.com',
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
};
