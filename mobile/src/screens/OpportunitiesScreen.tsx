import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Button, Chip, FAB, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/ApiService';
import { theme, spacing } from '@/constants/theme';

export function OpportunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const { data: opportunities, isLoading, refetch } = useQuery({
    queryKey: ['opportunities', selectedFilter, searchQuery],
    queryFn: () => ApiService.getOpportunities({
      type: selectedFilter !== 'all' ? selectedFilter : undefined,
      search: searchQuery || undefined,
    }),
  });

  const filters = [
    { key: 'all', label: 'All Jobs' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'freight', label: 'Freight' },
    { key: 'local', label: 'Local' },
    { key: 'long-haul', label: 'Long Haul' },
  ];

  const handleApply = async (opportunityId: string) => {
    try {
      await ApiService.applyToOpportunity(opportunityId);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Job Opportunities
        </Text>
        
        <Searchbar
          placeholder="Search opportunities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.key}
              selected={selectedFilter === filter.key}
              onPress={() => setSelectedFilter(filter.key)}
              style={styles.filterChip}
            >
              {filter.label}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {opportunities?.length > 0 ? (
          opportunities.map((opportunity: any, index: number) => (
            <Card key={index} style={styles.opportunityCard} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium" style={styles.opportunityTitle}>
                    {opportunity.title || 'Delivery Driver Position'}
                  </Text>
                  <Chip size="small" style={styles.typeChip}>
                    {opportunity.type || 'Delivery'}
                  </Chip>
                </View>

                <Text variant="bodyMedium" style={styles.company}>
                  {opportunity.company || 'ACHIEVEMOR Partner'}
                </Text>

                <View style={styles.details}>
                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Location:
                    </Text>
                    <Text variant="bodySmall" style={styles.detailValue}>
                      {opportunity.location || 'Multiple locations'}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Pay:
                    </Text>
                    <Text variant="bodySmall" style={styles.payValue}>
                      ${opportunity.rate || '25-35'}/hour
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="bodySmall" style={styles.detailLabel}>
                      Schedule:
                    </Text>
                    <Text variant="bodySmall" style={styles.detailValue}>
                      {opportunity.schedule || 'Flexible'}
                    </Text>
                  </View>
                </View>

                <Text variant="bodySmall" style={styles.description}>
                  {opportunity.description || 'Join our verified driver network with competitive pay, flexible scheduling, and comprehensive benefits. Perfect for experienced drivers looking for reliable work.'}
                </Text>

                <View style={styles.requirements}>
                  <Text variant="bodySmall" style={styles.requirementsTitle}>
                    Requirements:
                  </Text>
                  <Text variant="bodySmall" style={styles.requirementText}>
                    • Valid driver's license
                  </Text>
                  <Text variant="bodySmall" style={styles.requirementText}>
                    • Clean driving record
                  </Text>
                  <Text variant="bodySmall" style={styles.requirementText}>
                    • Background check completion
                  </Text>
                </View>

                <View style={styles.cardActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {/* View details */}}
                    style={styles.secondaryButton}
                  >
                    View Details
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleApply(opportunity.id)}
                    style={styles.primaryButton}
                  >
                    Apply Now
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard} mode="outlined">
            <Card.Content style={styles.emptyContent}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No opportunities found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Try adjusting your search filters or check back later for new opportunities.
              </Text>
              <Button
                mode="contained"
                onPress={refetch}
                style={styles.refreshButton}
              >
                Refresh
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="filter"
        style={styles.fab}
        onPress={() => {/* Open filter modal */}}
        label="Filters"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  searchbar: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
  },
  filtersContainer: {
    marginBottom: spacing.xs,
  },
  filtersContent: {
    paddingRight: spacing.md,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  opportunityCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  opportunityTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  typeChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  company: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  detailValue: {
    color: theme.colors.onSurface,
  },
  payValue: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  requirements: {
    marginBottom: spacing.md,
  },
  requirementsTitle: {
    color: theme.colors.onSurface,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  requirementText: {
    color: theme.colors.onSurfaceVariant,
    marginLeft: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
  primaryButton: {
    flex: 1,
  },
  emptyCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  refreshButton: {
    minWidth: 120,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: theme.colors.primary,
  },
});