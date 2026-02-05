import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Settings: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;
export type AddTransactionScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddTransaction'
>;
export type SettingsScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Settings'
>;
