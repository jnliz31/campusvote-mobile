import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const ELECTION = {
  title: 'Student Council 2025',
  status: 'Ended',
};

const POSITIONS = [
  {
    position: 'President',
    candidates: [
      { name: 'Sarah Johnson', initials: 'SJ', votes: 142, pct: 58, winner: true },
      { name: 'Michael Chen', initials: 'MC', votes: 102, pct: 42, winner: false },
    ],
  },
  {
    position: 'Vice President',
    candidates: [
      { name: 'Emma Rodriguez', initials: 'ER', votes: 135, pct: 55, winner: true },
      { name: 'David Kim', initials: 'DK', votes: 109, pct: 45, winner: false },
    ],
  },
];

function InitialsCircle({ initials }: { initials: string }) {
  return (
    <View style={styles.initialsCircle}>
      <Text style={styles.initialsText}>{initials}</Text>
    </View>
  );
}

function WinnerBadge() {
  return (
    <View style={styles.winnerBadge}>
      <Text style={styles.winnerText}>Winner</Text>
    </View>
  );
}

function CandidateCard({ candidate }: { candidate: any }) {
  return (
    <View style={styles.candidateCard}>
      <View style={styles.candidateTop}>
        <InitialsCircle initials={candidate.initials} />
        <Text style={styles.candidateName}>{candidate.name}</Text>
        {candidate.winner && <WinnerBadge />}
        <Text style={styles.voteCount}>{candidate.votes} votes</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${candidate.pct}%` }]}>
          <Text style={styles.progressText}>{candidate.pct}%</Text>
        </View>
      </View>
    </View>
  );
}

export default function VoterResultsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Results</Text>
      </View>

      {/* Page title */}
      <Text style={styles.pageTitle}>Election Results</Text>
      <Text style={styles.pageSubtitle}>View the results of ended elections</Text>

      {/* Election info card */}
      <View style={styles.electionCard}>
        <View style={styles.electionIcon}>
          <Ionicons name="school-outline" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.electionTitle}>{ELECTION.title}</Text>
        <View style={styles.endedBadge}>
          <Text style={styles.endedText}>{ELECTION.status}</Text>
        </View>
      </View>

      {/* Positions */}
      {POSITIONS.map((pos) => (
        <View key={pos.position} style={styles.positionSection}>
          <Text style={styles.positionTitle}>{pos.position}</Text>
          {pos.candidates.map((c) => (
            <CandidateCard key={c.name} candidate={c} />
          ))}
        </View>
      ))}
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a2a3a',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#8899aa',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  electionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  electionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  electionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2a3a',
  },
  endedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  endedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  positionSection: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a2a3a',
    marginBottom: 10,
    marginTop: 4,
  },
  candidateCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E6EB',
  },
  candidateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  candidateName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2a3a',
  },
  winnerBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#556677',
  },
  progressBg: {
    height: 24,
    backgroundColor: '#E8EDF2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    minWidth: 36,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
