import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { RootTabParamList } from './src/types/navigation';

import HomeScreen from './src/views/screens/HomeScreen';
import AddTransactionScreen from './src/views/screens/AddTransactionScreen';
import StatisticsScreen from './src/views/screens/StatisticsScreen';
import SettingsScreen from './src/views/screens/SettingsScreen';
import { initializeApp } from './src/services/AppInitializer';
import { autoSyncService } from './src/services/ServiceRegistry';
import { ThemeProvider } from './src/controllers/ThemeContext';
import { useTheme } from './src/controllers/useTheme';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabIcon = ({ label }: { label: string }) => (
  <Text style={{ fontSize: 20 }}>{label}</Text>
);

function AppContent() {
  const { theme, isDark } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp()
      .then(() => setIsReady(true))
      .then(() => {
        // Google Sheets 자동 동기화 (인증 hydrate + 초기화 + 조건부 export)
        autoSyncService.initializeAndSync();
        autoSyncService.startListening();
      });

    return () => {
      autoSyncService.stopListening();
    };
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          데이터 불러오는 중...
        </Text>
      </View>
    );
  }

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.cardBackground,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.colors.tabBarBackground,
            borderTopColor: theme.colors.tabBarBorder,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerStyle: {
            backgroundColor: theme.colors.primary,
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
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: '통계',
            tabBarLabel: '통계',
            tabBarIcon: () => <TabIcon label="📊" />,
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
    </TouchableWithoutFeedback>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
