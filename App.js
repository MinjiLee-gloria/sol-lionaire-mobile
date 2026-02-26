import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import OdysseyScreen from './src/screens/OdysseyScreen';
import MoreScreen from './src/screens/MoreScreen';

import { WalletProvider } from './src/context/WalletContext';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <Text style={[styles.icon, focused && styles.iconFocused]}>{emoji}</Text>
);

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarActiveTintColor: '#C9A84C',
              tabBarInactiveTintColor: '#888888',
              tabBarLabelStyle: styles.tabLabel,
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="Empire"
              component={OdysseyScreen}
              options={{
                tabBarLabel: 'Empire',
                tabBarIcon: ({ focused }) => <TabIcon emoji="🏛️" focused={focused} />,
              }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{
                tabBarLabel: 'More',
                tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1C1C1C',
    borderTopColor: '#C9A84C',
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  icon: {
    fontSize: 22,
    opacity: 0.4,
  },
  iconFocused: {
    opacity: 1,
  },
});
