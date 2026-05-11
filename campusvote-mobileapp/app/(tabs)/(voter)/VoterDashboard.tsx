import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Announcement, Election } from '@/services/api';

export default function VoterDashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeElections, setActiveElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsRes, electionsRes] = await Promise.all([
        api.getAnnouncements(),
        api.getElections('active'),
      ]);

      setAnnouncements(announcementsRes.data || []);
      setActiveElections(electionsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/VoterLogin');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Dashboard</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome */}
      <Text style={styles.welcome}>
        Welcome, <Text style={styles.nameGreen}>{user?.name || 'Student'}!</Text>
      </Text>
      <Text style={styles.quote}>"Cast your vote and make your voice heard."</Text>

      {/* Election Status */}
      <View style={styles.statusBanner}>
        <Text style={styles.statusBannerIcon}>🗳️</Text>
        <Text style={styles.statusBannerText}>
          <Text style={styles.statusBold}>Election Status: </Text>
          <Text>{activeElections.length} active election(s) available</Text>
        </Text>
      </View>

      {/* Action Cards */}
      <View style={styles.cardsRow}>
        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Vote Now</Text>
          <Text style={styles.actionCardDesc}>Cast your vote in active elections.</Text>
          <TouchableOpacity style={styles.btnBlue} onPress={() => router.push('/(tabs)/(voter)/VoterVote')}>
            <Text style={styles.btnBlueText}>Vote Now</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>View Vote</Text>
          <Text style={styles.actionCardDesc}>Check your voting history.</Text>
          <TouchableOpacity style={styles.btnGreen} onPress={() => router.push('/(tabs)/(voter)/VoterVotes')}>
            <Text style={styles.btnGreenText}>View History</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>View Results</Text>
          <Text style={styles.actionCardDesc}>See election outcomes.</Text>
          <TouchableOpacity style={styles.btnPurple} onPress={() => router.push('/(tabs)/(voter)/VoterResults')}>
            <Text style={styles.btnPurpleText}>View Results</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Announcements */}
      <View style={styles.announceCard}>
        <Text style={styles.announceTitle}>📢 Announcements</Text>
        {announcements.length === 0 ? (
          <Text style={styles.noAnnouncements}>No announcements at the moment</Text>
        ) : (
          announcements.map((announcement) => (
            <View key={announcement.id} style={styles.announceItem}>
              <View style={[styles.announceBar, {
                backgroundColor: announcement.type === 'warning' ? Colors.warning :
                              announcement.type === 'success' ? Colors.success : Colors.primary
              }]} />
              <View style={styles.announceContent}>
                <Text style={styles.announceIcon}>
                  {announcement.type === 'warning' ? '⚠️' :
                   announcement.type === 'success' ? '✅' : '📢'}
                </Text>
                <Text style={styles.announceText}>{announcement.content}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 32 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
    marginBottom: 20,
  },
  topBarTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  searchBox: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    minWidth: 120,
  },
  searchInput: { fontSize: 12, color: Colors.text, padding: 0 },
  welcome: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  nameGreen: { color: Colors.primary },
  quote: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 20 },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D8F3DC', borderRadius: 14, padding: 14, marginBottom: 20,
  },
  statusBannerIcon: { fontSize: 18 },
  statusBannerText: { fontSize: 13, color: Colors.text },
  statusBold: { fontWeight: '800' },
  cardsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionCardTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 4, textAlign: 'center' },
  actionCardDesc: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 10, minHeight: 32 },
  btnBlue: {
    backgroundColor: '#1976D2', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
  },
  btnBlueText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnGreen: {
    backgroundColor: Colors.primary, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
  },
  btnGreenText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  btnPurple: {
    backgroundColor: '#7C4DFF', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8,
  },
  btnPurpleText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  announceCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  announceTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  announceItem: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10,
    backgroundColor: '#F5F7F5', borderRadius: 12, overflow: 'hidden',
  },
  announceBar: { width: 3, alignSelf: 'stretch' },
  announceContent: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 12, flex: 1,
  },
  announceIcon: { fontSize: 14 },
  announceText: { fontSize: 13, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
  noAnnouncements: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  logoutIcon: { padding: 4 },
});
