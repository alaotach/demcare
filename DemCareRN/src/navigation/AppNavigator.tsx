import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { useTheme } from 'react-native-paper';

import { useAuthStore } from '../store/authStore';
import { UserRole, RootStackParamList, AuthStackParamList } from '../types';

// Auth Screens
import LoginScreen from '../screens/auth/EnhancedLoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import DemoAccountsScreen from '../screens/DemoAccountsScreen';

// Doctor Screens
import DoctorDashboard from '../screens/doctor/EnhancedDoctorDashboard';
import CaretakerDashboard from '../screens/doctor/CaretakerDashboard';
import AddPatientScreen from '../screens/doctor/EnhancedAddPatientScreen';
import QuickAddPatientScreen from '../screens/doctor/QuickAddPatientScreen';
import PatientProfileScreen from '../screens/doctor/EnhancedPatientProfileScreen';
import PatientOverviewScreen from '../screens/doctor/PatientOverviewScreen';
import AddSleepDataScreen from '../screens/doctor/AddSleepDataScreen';
import AddMoodEntryScreen from '../screens/doctor/AddMoodEntryScreen';
import PatientLocationScreen from '../screens/doctor/PatientLocationScreen';
import ReportsScreen from '../screens/doctor/ReportsScreen';
import LiveMonitoringScreen from '../screens/doctor/LiveMonitoringScreen';
import AnalyticsScreen from '../screens/doctor/AnalyticsScreen';

import PatientSelectorScreen from '../screens/doctor/PatientSelectorScreen';
import MemoryTestScreen from '../screens/MemoryTestScreen';
import MedicationManagementScreen from '../screens/MedicationManagementScreen';

// Common Screens
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SettingsScreen from '../screens/EnhancedSettingsScreen';
import LiveFeedScreen from '../screens/LiveFeedScreen';

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStackScreen() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="DemoAccounts" 
        component={DemoAccountsScreen}
        options={{ 
          headerShown: true,
          title: 'Demo Accounts',
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </AuthStack.Navigator>
  );
}

// Caretaker Tab Navigator
function CaretakerTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'heart';
              break;
            case 'Camera':
              iconName = 'camera';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={CaretakerDashboard} />
      <Tab.Screen 
        name="Camera" 
        component={LiveFeedScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
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
              iconName = 'grid';
              break;
            case 'Camera':
              iconName = 'camera';
              break;
            case 'Subscription':
              iconName = 'star';
              break;
            case 'Settings':
              iconName = 'cog';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        // Remove all headers from tab screens
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={DoctorDashboard} />
      <Tab.Screen 
        name="Camera" 
        component={LiveFeedScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main Navigator
export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <AuthStackScreen />;
  }

  // Role-based navigation
  if (user?.role === UserRole.DOCTOR) {
    return <DoctorAppStack />;
  } else if (user?.role === UserRole.CAREGIVER) {
    return <CaretakerAppStack />;
  }

  // Default to doctor dashboard for other roles
  return <DoctorAppStack />;
}

// Doctor App Stack
function DoctorAppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="DoctorTabs" 
        component={DoctorTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddPatient" 
        component={AddPatientScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PatientOverview" 
        component={PatientOverviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Locations" 
        component={PatientLocationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LiveMonitoring" 
        component={LiveMonitoringScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Caretaker App Stack
function CaretakerAppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen 
        name="CaretakerTabs" 
        component={CaretakerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="QuickAddPatient" 
        component={QuickAddPatientScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PatientSelector" 
        component={PatientSelectorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PatientProfile" 
        component={PatientProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PatientOverview" 
        component={PatientOverviewScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddSleepData" 
        component={AddSleepDataScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddMoodEntry" 
        component={AddMoodEntryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MemoryTest" 
        component={MemoryTestScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MedicationManagement" 
        component={MedicationManagementScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Locations" 
        component={PatientLocationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
