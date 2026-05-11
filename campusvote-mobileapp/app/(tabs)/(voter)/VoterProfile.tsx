import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VoterProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/VoterLogin');
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: handleLogout },
    ]);
  };

  const name = user?.name || 'James Lizada';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const email = user?.email || 'jameslizada@campus.edu.ph';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.bellBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      {/* My Profile + Verified */}
      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>My Profile</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      </View>

      {/* Info cards */}
      <View style={styles.infoCardsRow}>
        <View style={styles.infoCard}>
          <Ionicons name="school-outline" size={18} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoValue}>3rd Year</Text>
          <Text style={styles.infoLabel}>Year Level</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="book-outline" size={18} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoValue}>BSICT</Text>
          <Text style={styles.infoLabel}>Course</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="star-outline" size={18} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoValue}>Active</Text>
          <Text style={styles.infoLabel}>Status</Text>
        </View>
      </View>

      {/* Profile banner */}
      <View style={styles.banner}>
        <View style={styles.bannerInner}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerName}>{name}</Text>
            <View style={styles.participantBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.primary} />
              <Text style={styles.participantText}>Election Participant</Text>
            </View>
            <Text style={styles.bannerEmail}>{email}</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Votes Cast</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100%</Text>
          <Text style={styles.statLabel}>Participation</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>2025</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.accountSection}>
        <Text style={styles.accountTitle}>ACCOUNT INFORMATION</Text>

        <View style={styles.accountItem}>
          <View style={styles.accountIconWrap}>
            <Ionicons name="mail-outline" size={16} color={Colors.primary} />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Email Address</Text>
            <Text style={styles.accountValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.accountItem}>
          <View style={[styles.accountIconWrap, { backgroundColor: '#F3E5F5' }]}>
            <Text style={[styles.accountIconText, { color: '#8E24AA' }]}>ID</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Student ID</Text>
            <Text style={styles.accountValue}>2024-0042</Text>
          </View>
        </View>

        <View style={styles.accountItem}>
          <View style={[styles.accountIconWrap, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="calendar-outline" size={16} color="#F57C00" />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Member Since</Text>
            <Text style={styles.accountValue}>January 15, 2025</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  content: { paddingBottom: 32 },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  bellBtn: { position: 'relative', padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 14,
    gap: 10,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a2a3a' },
  verifiedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  infoCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: { marginBottom: 6 },
  infoValue: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  infoLabel: { fontSize: 10, color: '#8899aa', fontWeight: '600' },

  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    overflow: 'visible',
  },
  bannerInner: { flexDirection: 'row', alignItems: 'center' },
  initialsCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  initialsText: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  bannerInfo: { flex: 1 },
  bannerName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  participantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    marginBottom: 6,
  },
  participantText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  bannerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1a2a3a', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#8899aa', fontWeight: '600' },

  accountSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#99aabb',
    letterSpacing: 1,
    marginBottom: 12,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  accountIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountIconText: { fontSize: 10, fontWeight: '800' },
  accountInfo: { flex: 1 },
  accountLabel: { fontSize: 12, color: '#99aabb', marginBottom: 2 },
  accountValue: { fontSize: 14, fontWeight: '700', color: '#1a2a3a' },

  logoutBtn: {
    backgroundColor: '#f44336',
    borderRadius: 14,
    paddingVertical: 7,
    alignItems: 'center',
    marginHorizontal: 120,
  },
  logoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
