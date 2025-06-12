import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuth } from '@/services/AuthContext';
import { theme, spacing } from '@/constants/theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to your ACHIEVEMOR account
          </Text>
        </View>

        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              disabled={isLoading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              style={styles.input}
              disabled={isLoading}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <Button
              mode="text"
              onPress={() => {/* TODO: Implement forgot password */}}
              style={styles.forgotButton}
              disabled={isLoading}
            >
              Forgot Password?
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footer}>
          <Text variant="bodyMedium" style={styles.footerText}>
            Don't have an account?
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={styles.registerButton}
            disabled={isLoading}
          >
            Create Account
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
    marginTop: spacing.xl,
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
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: spacing.xl,
  },
  cardContent: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  forgotButton: {
    alignSelf: 'center',
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
  registerButton: {
    minWidth: 200,
  },
});