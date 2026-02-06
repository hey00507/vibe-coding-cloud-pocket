import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: { selectedDate?: string } | undefined;
  AddTransaction: undefined;
  Statistics: undefined;
  Settings: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;
export type AddTransactionScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddTransaction'
>;
export type StatisticsScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Statistics'
>;
export type SettingsScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Settings'
>;
