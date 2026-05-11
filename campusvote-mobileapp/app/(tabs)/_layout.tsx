import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

function TabIcon({ name, focused, label }: { name: any; focused: boolean; label: string }) {
    return (
        <View style={styles.tabContainer}>
            <View style={[styles.iconCircle, focused && styles.iconCircleActive]}>
                <Ionicons
                    name={name}
                    size={22}
                    color={focused ? '#fff' : 'rgba(255,255,255,0.7)'}
                />
            </View>
            <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.primary,
                    borderTopWidth: 0,
                    height: 62,
                    paddingBottom: 4,
                    paddingTop: 7,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                    margin: 0,
                },
            }}
        >
            {/* Hidden routes */}
            <Tabs.Screen name="index" options={{ tabBarButton: () => null, tabBarItemStyle: { width: 0, flex: 0, padding: 0, margin: 0 } }} />

            {/* Voter tabs */}
            <Tabs.Screen
                name="(voter)/VoterDashboard"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="home-outline" focused={focused} label="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="(voter)/VoterVote"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="grid-outline" focused={focused} label="Vote Now" />
                    ),
                }}
            />
            <Tabs.Screen
                name="(voter)/VoterVotes"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="refresh-outline" focused={focused} label="View Votes" />
                    ),
                }}
            />
            <Tabs.Screen
                name="(voter)/VoterResults"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="bar-chart-outline" focused={focused} label="Results" />
                    ),
                }}
            />
            <Tabs.Screen
                name="(voter)/VoterProfile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name="person-outline" focused={focused} label="Profile" />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    iconCircleActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
    },
    tabLabelActive: {
        color: '#ffffff',
    },
});
