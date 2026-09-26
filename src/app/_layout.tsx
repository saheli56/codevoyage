import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, CurrencyInr, UsersThree, BellRinging, ChartBar } from 'phosphor-react-native';
import { Palette } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.brand.primary,
        tabBarInactiveTintColor: Palette.neutral.slate400,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: Palette.neutral.slate200,
          borderTopWidth: 1,
          height: 60 + (Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 10)),
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 8),
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Threats',
          tabBarIcon: ({ color }) => <ShieldCheck size={20} color={String(color)} weight="bold" />,
        }}
      />
      <Tabs.Screen
        name="liveFeed"
        options={{
          title: 'Live Inbox',
          tabBarIcon: ({ color }) => <BellRinging size={20} color={String(color)} weight="bold" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <CurrencyInr size={20} color={String(color)} weight="bold" />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <UsersThree size={20} color={String(color)} weight="bold" />,
        }}
      />
      <Tabs.Screen
        name="evaluation"
        options={{
          title: 'Metrics',
          tabBarIcon: ({ color }) => <ChartBar size={20} color={String(color)} weight="bold" />,
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
