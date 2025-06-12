import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { theme, spacing } from '@/constants/theme';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text variant="headlineLarge" style={styles.logoText}>
              ACHIEVEMOR
            </Text>
          </View>
          <Text variant="titleLarge" style={styles.subtitle}>
            Owner Operator Platform
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text variant="displaySmall" style={styles.heroTitle}>
            Choose 2 ACHIEVEMOR
          </Text>
          <Text variant="bodyLarge" style={styles.heroDescription}>
            Comprehensive onboarding platform for owner operator independent contractors. 
            Streamlined compliance verification, verified job opportunities, and professional business growth services.
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.actionCards}>
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Driver Registration
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Join our verified driver network with complete compliance verification
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DriverRegistration')}
                style={styles.cardButton}
              >
                Get Started as Driver
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Independent Contractor
              </Text>
              <Text variant="bodyMedium" style={styles.cardDescription}>
                Access premium freight opportunities and business growth tools
              </Text>
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

        {/* Login Section */}
        <View style={styles.loginSection}>
          <Text variant="bodyMedium" style={styles.loginText}>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.primary,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  heroTitle: {
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: 'bold',
  },
  heroDescription: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionCards: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  cardButton: {
    marginTop: spacing.xs,
  },
  loginSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: spacing.lg,
  },
  loginText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  loginButton: {
    minWidth: 200,
  },
});