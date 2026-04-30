import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Home: undefined;
  CreateGroup: undefined;
  GroupDetail: { groupId: string };
  AddMember: { groupId: string };
  CreateEvent: { groupId: string };
  EventDetail: { eventId: string };
};

export type ScreenProps<K extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, K>;
