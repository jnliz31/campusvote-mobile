import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.primary} style={styles.emoji} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.desc}>This screen doesn&apos;t exist in Univote.</Text>
        <Link href="/(auth)/VoterLogin" style={styles.link}>
          <Text style={styles.linkText}>Go to Login →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: Colors.background },
  emoji: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  desc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  link: { marginTop: 8 },
  linkText: { fontSize: 16, color: Colors.primaryLight, fontWeight: '700' },
});
