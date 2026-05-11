import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function VoterLoginScreen() {
  const { loginStudent } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await loginStudent({ email, password });
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}> 
          <Text style={styles.appName}>CampusVote</Text>
          <Text style={styles.appTagline}>SNSU Online Voting System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Student Login</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Student Email</Text>
            <TextInput
              style={styles.input}
              placeholder="student@snsu.edu.ph"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Login</Text>
            }
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={() => Alert.alert('Google Sign-In', 'Coming soon!')}>
            <Text style={styles.secondaryBtnIcon}>G</Text>
            <Text style={styles.secondaryBtnText}>Sign in with Gmail</Text>
          </TouchableOpacity>

          <View style={styles.links}>
            <TouchableOpacity onPress={() => router.push('/(auth)/VoterRegister')}>
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.linkBold}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  logoArea: { alignItems: 'center', marginBottom: 28 },

  logoEmoji: { fontSize: 36 },
  appName: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
  appTagline: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3 },
  card: {
    width: '100%', maxWidth: 390, backgroundColor: Colors.white,
    borderRadius: 24, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 22, textAlign: 'center' },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    height: 50, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, fontSize: 15,
    color: Colors.text, backgroundColor: '#fafafa',
  },
  pwRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14, height: 50, justifyContent: 'center' },
  primaryBtn: {
    height: 52, backgroundColor: Colors.primaryLight,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ebebeb' },
  dividerText: { marginHorizontal: 10, color: Colors.textMuted, fontSize: 12 },
  secondaryBtn: {
    height: 50, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 26, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 10, backgroundColor: '#fff',
  },
  secondaryBtnIcon: {
    fontSize: 16, fontWeight: '900', color: '#4285F4',
    fontStyle: 'italic',
  },
  secondaryBtnText: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  links: { marginTop: 20, gap: 8, alignItems: 'center' },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkBold: { color: Colors.primaryLight, fontWeight: '700' },
});
