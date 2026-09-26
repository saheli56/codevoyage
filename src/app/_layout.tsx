import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Globe, CurrencyInr, UsersThree, BellRinging, ChartBar } from 'phosphor-react-native';
import { Palette } from '@/constants/theme';
import { AppModeProvider } from '@/context/AppModeContext';
import { ThemeProvider, useAppTheme } from '@/context/ThemeContext';

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <Tabs
        screenOptions={{
          tabBarActiveTintColor: Palette.brand.primary,
          tabBarInactiveTintColor: colors.textMuted,
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopColor: colors.divider,
            borderTopWidth: 1,
            height: 60 + (Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10)),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 8),
            paddingTop: 8,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: 1,
            letterSpacing: 0.3,
          },
          tabBarItemStyle: {
            paddingTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Shield',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <ShieldCheck size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="urlScanner"
          options={{
            title: 'Inspect',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <Globe size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="liveFeed"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <BellRinging size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Pay',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <CurrencyInr size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Intel',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <UsersThree size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="evaluation"
          options={{
            title: 'Metrics',
            tabBarIcon: ({ color, focused }) => (
              <View style={{ opacity: focused ? 1 : 0.7 }}>
                <ChartBar size={21} color={String(color)} weight={focused ? 'fill' : 'regular'} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            href: null,
          }}
        />
      </Tabs>
  );
}

import { startNativeInterception } from '@/services/autoProtection';
import { useEffect } from 'react';

export default function AppLayout() {
  useEffect(() => {
    startNativeInterception();
  }, []);

  return (
    <ThemeProvider>
      <AppModeProvider>
        <TabNavigator />
      </AppModeProvider>
    </ThemeProvider>
  );
}
