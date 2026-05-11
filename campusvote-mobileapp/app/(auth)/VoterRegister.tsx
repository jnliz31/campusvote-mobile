import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  const barColors = ['', Colors.error, Colors.warning, Colors.success];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
      {[1, 2, 3].map(i => (
        <View
          key={i}
          style={{
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= score ? barColors[score] : '#e0e0e0',
          }}
        />
      ))}
      <Text style={{ fontSize: 11, fontWeight: '700', color: barColors[score], width: 42 }}>
        {labels[score]}
      </Text>
    </View>
  );
}

export default function VoterRegisterScreen() {
  const { registerStudent } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await registerStudent({ fullName, email, password });
    setLoading(false);
    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    } else {
      Alert.alert(
        'Account Created! 🎉',
        'Your SNSU voting account is ready. Please log in.',
        [{ text: 'Login Now', onPress: () => router.replace('/(auth)/VoterLogin') }]
      );
    }
  };

  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.appName}>CampusVote</Text>
          <Text style={styles.appTagline}>Create your voting account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Student Registration</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

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
            <Text style={styles.hint}>Must use your @snsu.edu.ph email</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text>{showPw ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <PasswordStrength password={password} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1 }, pwMismatch && styles.inputError]}
                placeholder="Re-enter your password"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                <Text>{showConfirm ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {pwMismatch && <Text style={styles.errorText}>Passwords do not match</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryBtnText}>Register</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
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
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: {
    height: 50, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 16, fontSize: 15,
    color: Colors.text, backgroundColor: '#fafafa',
  },
  inputError: { borderColor: Colors.error },
  pwRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14, height: 50, justifyContent: 'center' },
  hint: { fontSize: 11, color: Colors.textMuted, marginTop: 4, marginLeft: 2 },
  errorText: { fontSize: 11, color: Colors.error, marginTop: 4, marginLeft: 2 },
  primaryBtn: {
    height: 52, backgroundColor: Colors.primaryLight,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  btnDisabled: { opacity: 0.65 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
  linkRow: { alignItems: 'center', paddingVertical: 14 },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  linkBold: { color: Colors.primaryLight, fontWeight: '700' },
});
