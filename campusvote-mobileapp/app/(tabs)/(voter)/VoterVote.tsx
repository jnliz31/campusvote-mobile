import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api, Election } from '@/services/api';
import { useRouter } from 'expo-router';

export default function VoterVoteScreen() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const response = await api.getElections('active');
      if (response.data) {
        setElections(response.data);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vote Now</Text>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Cast Your Vote</Text>
        <Text style={styles.bannerSubtitle}>Select an election to cast your vote</Text>
      </View>

      {/* Election cards */}
      {elections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active elections at the moment</Text>
        </View>
      ) : (
        elections.map((e) => (
          <View key={e.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardIcon}>
                <Ionicons name="business-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>{e.title}</Text>
            <Text style={styles.cardDesc}>{e.description || 'No description available'}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people-outline" size={12} color="#8899aa" />
                <Text style={styles.metaText}>{e.candidates?.length || 0} Candidates</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.voteBtn}
              onPress={() => {
                Alert.alert('Vote', `View candidates for "${e.title}" - Candidate selection coming soon!`);
              }}
            >
              <Text style={styles.voteBtnText}>View Candidates</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" style={styles.voteBtnIcon} />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingBottom: 32,
  },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2a3a',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#667788',
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#8899aa',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginBottom: 14,
  },
  voteBtn: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  voteBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  voteBtnIcon: {
    marginTop: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8899aa',
    textAlign: 'center',
  },
});
