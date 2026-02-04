import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Categories: undefined;
  PaymentMethods: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<RootTabParamList, 'Home'>;
export type AddTransactionScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'AddTransaction'
>;
export type CategoriesScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Categories'
>;
export type PaymentMethodsScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'PaymentMethods'
>;
