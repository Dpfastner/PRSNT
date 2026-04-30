import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Welcome } from './src/screens/Welcome';
import { Done } from './src/screens/Done';
import { OnboardingFlow } from './src/onboarding/OnboardingFlow';
import { colors } from './src/theme';

type AppState =
  | { kind: 'welcome' }
  | { kind: 'onboarding' }
  | { kind: 'done'; userId: string };

export default function App() {
  const [state, setState] = useState<AppState>({ kind: 'welcome' });

  return (
    <SafeAreaView style={styles.root}>
      {state.kind === 'welcome' && (
        <Welcome onStart={() => setState({ kind: 'onboarding' })} />
      )}
      {state.kind === 'onboarding' && (
        <OnboardingFlow
          onComplete={({ userId }) => setState({ kind: 'done', userId })}
        />
      )}
      {state.kind === 'done' && (
        <Done
          userId={state.userId}
          onRestart={() => setState({ kind: 'welcome' })}
        />
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
