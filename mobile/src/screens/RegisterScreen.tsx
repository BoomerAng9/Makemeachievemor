import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { theme, spacing } from '@/constants/theme';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export function RegisterScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Choose Your Path
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Select the registration type that best fits your needs
          </Text>
        </View>

        <View style={styles.options}>
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Driver Registration
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Join our verified driver network with complete compliance verification, 
                background checks, and access to premium delivery opportunities.
              </Text>
              <View style={styles.features}>
                <Text variant="bodySmall" style={styles.feature}>
                  • Complete onboarding process
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • Background verification
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • Document management
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • Job opportunities
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DriverRegistration')}
                style={styles.cardButton}
              >
                Register as Driver
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Independent Contractor
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Access premium freight opportunities, business growth tools, 
                and professional development resources for contractors.
              </Text>
              <View style={styles.features}>
                <Text variant="bodySmall" style={styles.feature}>
                  • Authority setup assistance
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • Premium freight access
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • Business development
                </Text>
                <Text variant="bodySmall" style={styles.feature}>
                  • AI-powered insights
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ContractorRegistration')}
                style={styles.cardButton}
              >
                Join as Contractor
              </Button>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>
            Already have an account?
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.loginButton}
          >
            Sign In
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
  options: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: spacing.lg,
  },
  cardTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  features: {
    marginBottom: spacing.md,
  },
  feature: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs / 2,
    lineHeight: 16,
  },
  cardButton: {
    marginTop: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  footerText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  loginButton: {
    minWidth: 200,
  },
});