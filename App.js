import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import EmpireScreen from './src/screens/EmpireScreen';
import DistrictScreen from './src/screens/DistrictScreen';
import MoreScreen from './src/screens/MoreScreen';

import { WalletProvider } from './src/context/WalletContext';

const Tab = createBottomTabNavigator();


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
              tabBarInactiveTintColor: '#555555',
              tabBarLabelStyle: styles.tabLabel,
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Empire"
              component={EmpireScreen}
              options={{
                tabBarLabel: 'Empire',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="District"
              component={DistrictScreen}
              options={{
                tabBarLabel: 'District',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="More"
              component={MoreScreen}
              options={{
                tabBarLabel: 'More',
                tabBarIcon: ({ color, focused }) => (
                  <Ionicons name={focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline'} size={22} color={color} />
                ),
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
});
