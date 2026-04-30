import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { loadSession, saveSession, type Session } from './src/storage/session';
import { colors } from './src/theme';

export default function App() {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSession()
      .then((s) => setSession(s))
      .finally(() => setBootstrapping(false));
  }, []);

  async function onSessionEstablished(s: Session) {
    await saveSession(s);
    setSession(s);
  }

  if (bootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator
        session={session}
        onSessionEstablished={onSessionEstablished}
        onSignOut={() => setSession(null)}
      />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
