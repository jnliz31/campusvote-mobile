import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user) {
      // Not logged in → send to voter login
      if (!inAuthGroup) {
        router.replace('/(auth)/VoterLogin');
      }
    } else if (user.role === 'admin') {
      // Admin → admin tabs
      if (!inTabsGroup) {
        router.replace('/(tabs)/(admin)/AdminDashboard');
      }
    } else {
      // Student → voter tabs
      if (!inTabsGroup) {
        router.replace('/(tabs)/(voter)/VoterDashboard');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <RootLayoutNav />
    </AuthProvider>
  );
}
