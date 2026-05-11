import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🗳️</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.desc}>This screen doesn't exist in CampusVote.</Text>
        <Link href="/(auth)/VoterLogin" style={styles.link}>
          <Text style={styles.linkText}>Go to Login →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: Colors.background },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  desc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  link: { marginTop: 8 },
  linkText: { fontSize: 16, color: Colors.primaryLight, fontWeight: '700' },
});
