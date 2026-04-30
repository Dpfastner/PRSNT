import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Welcome } from '../screens/Welcome';
import { Done } from '../screens/Done';
import { Home } from '../screens/Home';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { CreateGroup } from '../screens/groups/CreateGroup';
import { GroupDetail } from '../screens/groups/GroupDetail';
import { AddMember } from '../screens/groups/AddMember';
import { CreateEvent } from '../screens/events/CreateEvent';
import { EventDetail } from '../screens/events/EventDetail';
import { colors } from '../theme';
import type { RootStackParamList } from './types';
import type { Session } from '../storage/session';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  session: Session | null;
  onSessionEstablished: (session: Session) => void;
  onSignOut: () => void;
}

export function RootNavigator({ session, onSessionEstablished, onSignOut }: Props) {
  const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '600' as const },
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <NavigationContainer>
      {session ? (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <Home
                {...props}
                userId={session.userId}
                displayName={session.displayName}
                onSignOut={onSignOut}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="CreateGroup" options={{ title: '' }}>
            {(props) => <CreateGroup {...props} userId={session.userId} />}
          </Stack.Screen>
          <Stack.Screen name="GroupDetail" options={{ title: '' }}>
            {(props) => <GroupDetail {...props} userId={session.userId} />}
          </Stack.Screen>
          <Stack.Screen name="AddMember" options={{ title: '' }} component={AddMember} />
          <Stack.Screen name="CreateEvent" options={{ title: '' }}>
            {(props) => <CreateEvent {...props} userId={session.userId} />}
          </Stack.Screen>
          <Stack.Screen name="EventDetail" options={{ title: '' }}>
            {(props) => <EventDetail {...props} userId={session.userId} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
          <Stack.Screen name="Welcome">
            {(props) => (
              <Welcome onStart={() => props.navigation.navigate('Onboarding')} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Onboarding">
            {() => (
              <OnboardingFlow
                onComplete={({ userId, displayName }) =>
                  onSessionEstablished({ userId, displayName })
                }
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
