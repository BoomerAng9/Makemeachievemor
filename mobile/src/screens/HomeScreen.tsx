import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, FAB, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/ApiService';
import { theme, spacing } from '@/constants/theme';

export function HomeScreen() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-insights'],
    queryFn: () => ApiService.getDashboardInsights(),
  });

  const { data: opportunities } = useQuery({
    queryKey: ['recent-opportunities'],
    queryFn: () => ApiService.getOpportunities({ limit: 3 }),
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* Welcome Header */}
        <Card style={styles.welcomeCard} mode="elevated">
          <Card.Content style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Avatar.Text 
                size={48} 
                label={user?.firstName?.[0] || 'U'} 
                style={styles.avatar}
              />
              <View style={styles.welcomeText}>
                <Text variant="titleLarge" style={styles.welcomeTitle}>
                  Welcome back, {user?.firstName || 'Driver'}!
                </Text>
                <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
                  Ready to find your next opportunity?
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} mode="outlined">
            <Card.Content style={styles.statContent}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {dashboardData?.totalJobs || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Total Jobs
              </Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard} mode="outlined">
            <Card.Content style={styles.statContent}>
              <Text variant="displaySmall" style={styles.statNumber}>
                {dashboardData?.activeApplications || 0}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Active Applications
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Opportunities */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recent Opportunities
            </Text>
            {opportunities?.length > 0 ? (
              opportunities.slice(0, 3).map((opportunity: any, index: number) => (
                <Card key={index} style={styles.opportunityCard} mode="outlined">
                  <Card.Content style={styles.opportunityContent}>
                    <Text variant="titleSmall" style={styles.opportunityTitle}>
                      {opportunity.title || 'Delivery Opportunity'}
                    </Text>
                    <Text variant="bodySmall" style={styles.opportunityLocation}>
                      {opportunity.location || 'Multiple locations'}
                    </Text>
                    <Text variant="bodySmall" style={styles.opportunityPay}>
                      ${opportunity.rate || '25-35'}/hour
                    </Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No recent opportunities. Check back later!
              </Text>
            )}
            <Button
              mode="outlined"
              onPress={() => {/* Navigate to opportunities */}}
              style={styles.viewAllButton}
            >
              View All Opportunities
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                icon="file-document"
                onPress={() => {/* Navigate to documents */}}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Documents
              </Button>
              <Button
                mode="contained"
                icon="map-marker"
                onPress={() => {/* Navigate to location */}}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Update Location
              </Button>
              <Button
                mode="contained"
                icon="account"
                onPress={() => {/* Navigate to profile */}}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Profile
              </Button>
              <Button
                mode="contained"
                icon="help-circle"
                onPress={() => {/* Navigate to support */}}
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
              >
                Support
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={styles.sectionCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Recent Activity
            </Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text variant="bodySmall" style={styles.activityText}>
                  Profile updated successfully
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>
                  2 hours ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <Text variant="bodySmall" style={styles.activityText}>
                  Documents verified
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>
                  1 day ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <Text variant="bodySmall" style={styles.activityText}>
                  Application submitted
                </Text>
                <Text variant="bodySmall" style={styles.activityTime}>
                  3 days ago
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Quick apply action */}}
        label="Find Jobs"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  welcomeContent: {
    padding: spacing.lg,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  statContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  sectionCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  opportunityCard: {
    marginBottom: spacing.sm,
    backgroundColor: theme.colors.surfaceVariant,
  },
  opportunityContent: {
    padding: spacing.sm,
  },
  opportunityTitle: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  opportunityLocation: {
    color: theme.colors.onSurfaceVariant,
  },
  opportunityPay: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: spacing.md,
  },
  viewAllButton: {
    marginTop: spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  actionButtonContent: {
    flexDirection: 'column',
    height: 48,
  },
  activityList: {
    gap: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  activityText: {
    color: theme.colors.onSurface,
    flex: 1,
  },
  activityTime: {
    color: theme.colors.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: theme.colors.primary,
  },
});