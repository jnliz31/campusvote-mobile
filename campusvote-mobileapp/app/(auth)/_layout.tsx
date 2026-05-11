import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="VoterLogin" />
      <Stack.Screen name="VoterRegister" />
    </Stack>
  );
}
