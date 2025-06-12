import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { theme, spacing } from '@/constants/theme';

type ContractorRegistrationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ContractorRegistration'>;

interface Props {
  navigation: ContractorRegistrationScreenNavigationProp;
}

export function ContractorRegistrationScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon source="truck" size={64} color={theme.colors.primary} />
          </View>
          <Text variant="displaySmall" style={styles.title}>
            Independent Contractor
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Premium features for professional contractors
          </Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Coming Soon
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Our Independent Contractor platform is currently under development. 
              We're building advanced features specifically designed for owner operators:
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Authority setup assistance and compliance tracking
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Premium freight opportunities and load matching
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  AI-powered business insights and recommendations
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Advanced document management and verification
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Financial tools and payment processing
                </Text>
              </View>
              <View style={styles.feature}>
                <Icon source="check-circle" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium" style={styles.featureText}>
                  Route optimization and fleet management
                </Text>
              </View>
            </View>

            <Text variant="bodyMedium" style={styles.notifyText}>
              Be the first to know when contractor registration opens. 
              We'll notify you as soon as these premium features are available.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.alternativeCard} mode="outlined">
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.alternativeTitle}>
              Start as a Driver Today
            </Text>
            <Text variant="bodyMedium" style={styles.alternativeDescription}>
              While contractor features are in development, you can register as a driver 
              to access our verified network and begin earning immediately.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DriverRegistration')}
              style={styles.alternativeButton}
            >
              Register as Driver
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Welcome')}
            style={styles.backButton}
          >
            Back to Options
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  title: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    color: theme.colors.onSurface,
    lineHeight: 20,
  },
  notifyText: {
    color: theme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  alternativeCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.xl,
  },
  alternativeTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  alternativeDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
    textAlign: 'center',
  },
  alternativeButton: {
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  backButton: {
    minWidth: 200,
  },
});