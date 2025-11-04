import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


import OnBoardingScreen from './Screens/OnBoardingScreen';
import SignInScreen from './Screens/SignInScreen';
import SignUpScreen from './Screens/SignUpScreen';
import ForgotPasswordScreen from './Screens/ForgotPasswordScreen';
import ExploreScreen from './Screens/ExploreScreen';
import DealsScreen from './Screens/DealsScreen';
import MyBookingsScreen from './Screens/MyBookingsScreen';
import HotelDetailsScreen from './Screens/HotelDetailsScreen';
import BookingScreen from './Screens/BookingScreen';
import ProfileScreen from './Screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          position: 'absolute',  
          bottom: 0,             
          left: 0,               
          right: 0,
          marginBottom: 0,
          height: 100
        },
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Explore Tab */}
      <Tab.Screen 
        name="ExploreTab" 
        component={ExploreScreen}
        options={{
          title: 'Explore Hotels',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🏨' : '🏢'}</Text>
          ),
        }}
      />

      {/* Deals Tab */}
      <Tab.Screen 
        name="DealsTab" 
        component={DealsScreen}
        options={{
          title: 'Hot Deals',
          tabBarLabel: 'Deals',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '🔥' : '💰'}</Text>
          ),
        }}
      />

      {/* My Bookings Tab */}
      <Tab.Screen 
        name="BookingsTab" 
        component={MyBookingsScreen}
        options={{
          title: 'My Bookings',
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '📋' : '📄'}</Text>
          ),
        }}
      />
      
      {/* Profile Tab */}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Text style={{ fontSize: 24 }}>{focused ? '👤' : '👥'}</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasSeenOnboarding ? 'SignIn' : 'OnBoarding'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen 
          name="OnBoarding" 
          component={OnBoardingScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{ title: 'Sign In' }}
        />
        
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ title: 'Create Account' }}
        />
        
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ title: 'Reset Password' }}
        />

        {/* Main App with 4 Bottom Tabs */}
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ 
            headerShown: false,
          }}
        />
        
        {/* Detail Screens (show on top of tabs) */}
        <Stack.Screen 
          name="HotelDetails" 
          component={HotelDetailsScreen}
          options={{ title: 'Hotel Details' }}
        />
        
        <Stack.Screen 
          name="Booking" 
          component={BookingScreen}
          options={{ title: 'Book Now' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
