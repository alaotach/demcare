import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

import { useAuthStore } from '../store/authStore';
import { UserRole, RootStackParamList, AuthStackParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Doctor Screens
import DoctorDashboard from '../screens/doctor/DoctorDashboard';
import AddPatientScreen from '../screens/doctor/AddPatientScreen';
import PatientProfileScreen from '../screens/doctor/PatientProfileScreen';
import PatientOverviewScreen from '../screens/doctor/PatientOverviewScreen';
import AddSleepDataScreen from '../screens/doctor/AddSleepDataScreen';
import AddMoodEntryScreen from '../screens/doctor/AddMoodEntryScreen';

// Common Screens
import CameraFeedScreen from '../screens/CameraFeedScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ title: 'DemCare Login' }}
      />
      <AuthStack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ title: 'Create Account' }}
      />
    </AuthStack.Navigator>
  );
}

// Doctor Tab Navigator
function DoctorTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Camera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Subscription':
              iconName = focused ? 'crown' : 'crown-outline';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface
      })}
    >
      <Tab.Screen name="Dashboard" component={DoctorDashboard} />
      <Tab.Screen name="Camera" component={CameraFeedScreen} />
      <Tab.Screen name="Subscription" component={SubscriptionScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main App Stack
function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DoctorTabs" 
        component={DoctorTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddPatient" 
        component={AddPatientScreen}
        options={{ title: 'Add New Patient' }}
      />
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen}
        options={{ title: 'Patient Profile' }}
      />
      <Stack.Screen 
        name="PatientOverview" 
        component={PatientOverviewScreen}
        options={{ title: 'Patient Overview' }}
      />
      <Stack.Screen 
        name="AddSleepData" 
        component={AddSleepDataScreen}
        options={{ title: 'Add Sleep Data' }}
      />
      <Stack.Screen 
        name="AddMoodEntry" 
        component={AddMoodEntryScreen}
        options={{ title: 'Mood Check-in' }}
      />
    </Stack.Navigator>
  );
}

// Main Navigator
export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthStackScreen />;
  }

  // For now, only implementing Doctor role
  // You can extend this for other roles
  if (user?.role === UserRole.DOCTOR) {
    return <AppStack />;
  }

  // Default to doctor dashboard for other roles (can be customized)
  return <AppStack />;
}
