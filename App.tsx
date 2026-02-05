import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { RootTabParamList } from './src/types/navigation';

import HomeScreen from './src/views/screens/HomeScreen';
import AddTransactionScreen from './src/views/screens/AddTransactionScreen';
import SettingsScreen from './src/views/screens/SettingsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabIcon = ({ label }: { label: string }) => (
  <Text style={{ fontSize: 20 }}>{label}</Text>
);

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#FFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '거래 내역',
            tabBarLabel: '홈',
            tabBarIcon: () => <TabIcon label="🏠" />,
          }}
        />
        <Tab.Screen
          name="AddTransaction"
          component={AddTransactionScreen}
          options={{
            title: '거래 추가',
            tabBarLabel: '추가',
            tabBarIcon: () => <TabIcon label="➕" />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '설정',
            tabBarLabel: '설정',
            tabBarIcon: () => <TabIcon label="⚙️" />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
