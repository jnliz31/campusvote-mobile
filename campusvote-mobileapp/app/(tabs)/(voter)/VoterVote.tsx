import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api, Election, Candidate } from '@/services/api';
import { useRouter } from 'expo-router';

type Step = 'list' | 'vote' | 'success';

export default function VoterVoteScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('list');
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [votedElections, setVotedElections] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await api.getElections('active');
      if (response.data) {
        setElections(response.data);
        // Check vote status for each election
        const voted = new Set<number>();
        await Promise.all(
          response.data.map(async (e) => {
            const check = await api.checkVote(e.id);
            if (check.data?.has_voted) voted.add(e.id);
          })
        );
        setVotedElections(voted);
      }
    } catch (error) {
      console.error('Error loading elections:', error);
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSelectElection = (election: Election) => {
    if (votedElections.has(election.id)) {
      Alert.alert('Already Voted', `You have already voted in "${election.title}".`);
      return;
    }
    setSelectedElection(election);
    setSelections({});
    setStep('vote');
  };

  const handleSelectCandidate = (position: string, candidateId: number) => {
    setSelections((prev) => ({ ...prev, [position]: candidateId }));
  };

  const handleSubmitVote = async () => {
    if (!selectedElection) return;

    const positions = selectedElection.candidates
      ? [...new Set(selectedElection.candidates.map((c) => c.position || 'Candidate'))]
      : [];

    const missing = positions.filter((p) => !selections[p]);
    if (missing.length > 0) {
      Alert.alert('Incomplete', `Please select a candidate for: ${missing.join(', ')}`);
      return;
    }

    const candidateIds = Object.values(selections);
    setSubmitting(true);
    const result = await api.castVotes(selectedElection.id, candidateIds);
    setSubmitting(false);

    if (result.error) {
      Alert.alert('Vote Failed', result.error);
    } else {
      setVotedElections((prev) => new Set(prev).add(selectedElection.id));
      setStep('success');
    }
  };

  const handleBack = () => {
    setStep('list');
    setSelectedElection(null);
    setSelections({});
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      </View>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Vote Submitted!</Text>
        <Text style={styles.successDesc}>
          Your vote for "{selectedElection?.title}" has been recorded successfully.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleBack}>
          <Text style={styles.primaryBtnText}>Back to Elections</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Voting state
  if (step === 'vote' && selectedElection) {
    const candidates = selectedElection.candidates || [];
    const positions = [...new Set(candidates.map((c) => c.position || 'Candidate'))];
    const grouped = positions.map((pos) => ({
      position: pos,
      candidates: candidates.filter((c) => (c.position || 'Candidate') === pos),
    }));

    const allSelected = positions.every((p) => selections[p]);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cast Your Vote</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>{selectedElection.title}</Text>
            <Text style={styles.bannerSubtitle}>Select one candidate per position</Text>
          </View>

          {grouped.map((group) => (
            <View key={group.position} style={styles.positionSection}>
              <Text style={styles.positionTitle}>{group.position}</Text>
              {group.candidates.map((c) => {
                const isSelected = selections[group.position] === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.candidateCard, isSelected && styles.candidateCardActive]}
                    onPress={() => handleSelectCandidate(group.position, c.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.radio}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>{c.name}</Text>
                      {c.description ? (
                        <Text style={styles.candidateDesc}>{c.description}</Text>
                      ) : null}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.primaryBtn, (!allSelected || submitting) && styles.btnDisabled]}
            onPress={handleSubmitVote}
            disabled={!allSelected || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Submit Vote</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // List state
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vote Now</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Cast Your Vote</Text>
        <Text style={styles.bannerSubtitle}>Select an election to cast your vote</Text>
      </View>

      {elections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active elections at the moment</Text>
        </View>
      ) : (
        elections.map((e) => {
          const hasVoted = votedElections.has(e.id);
          return (
            <TouchableOpacity
              key={e.id}
              style={[styles.card, hasVoted && styles.cardVoted]}
              onPress={() => handleSelectElection(e)}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons name="business-outline" size={20} color={Colors.primary} />
                </View>
                <View style={[styles.badge, hasVoted ? styles.badgeVoted : styles.badgeActive]}>
                  <View style={[styles.dot, hasVoted ? styles.dotVoted : styles.dotActive]} />
                  <Text style={[styles.badgeText, hasVoted && styles.badgeTextVoted]}>
                    {hasVoted ? 'Voted' : 'Active'}
                  </Text>
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

              <View style={styles.voteBtn}>
                <Text style={styles.voteBtnText}>
                  {hasVoted ? 'View Election' : 'Vote Now'}
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" style={styles.voteBtnIcon} />
              </View>
            </TouchableOpacity>
          );
        })
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
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.success, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#1a2a3a', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#667788', textAlign: 'center', marginBottom: 28 },
  backBtn: { padding: 4 },
  positionSection: { marginHorizontal: 20, marginBottom: 20 },
  positionTitle: { fontSize: 16, fontWeight: '700', color: '#1a2a3a', marginBottom: 10 },
  candidateCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: '#E8EDF2',
  },
  candidateCardActive: { borderColor: Colors.primary, backgroundColor: '#F0F7F0' },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#ccd5df', justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  candidateInfo: { flex: 1 },
  candidateName: { fontSize: 15, fontWeight: '700', color: '#1a2a3a' },
  candidateDesc: { fontSize: 12, color: '#8899aa', marginTop: 2 },
  primaryBtn: {
    height: 52, backgroundColor: Colors.primary,
    borderRadius: 26, justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 20, marginTop: 8, marginBottom: 24,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cardVoted: { opacity: 0.85 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeActive: { backgroundColor: '#E8F5E9' },
  badgeVoted: { backgroundColor: '#E3F2FD' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: Colors.primary },
  dotVoted: { backgroundColor: '#1976D2' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  badgeTextVoted: { color: '#1976D2' },
});
