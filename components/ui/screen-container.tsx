import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  contentContainerStyle,
  backgroundColor = Colors.primary,
}: ScreenContainerProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
  },
});
