import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Text, Card, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { ApiService } from '@/services/ApiService';
import { theme, spacing } from '@/constants/theme';

type DriverRegistrationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'DriverRegistration'>;

interface Props {
  navigation: DriverRegistrationScreenNavigationProp;
}

export function DriverRegistrationScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // License Information
    licenseNumber: '',
    licenseState: '',
    licenseExpiry: '',
    cdlClass: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
  });

  const totalSteps = 4;
  const progress = step / totalSteps;

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await ApiService.registerDriver(formData);
      Alert.alert(
        'Registration Successful',
        'Your driver registration has been submitted. You will receive a confirmation email shortly.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Registration Failed', 'Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text variant="titleLarge" style={styles.stepTitle}>
              Personal Information
            </Text>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              label="Phone Number"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Date of Birth (MM/DD/YYYY)"
              value={formData.dateOfBirth}
              onChangeText={(value) => updateFormData('dateOfBirth', value)}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text variant="titleLarge" style={styles.stepTitle}>
              Address Information
            </Text>
            <TextInput
              label="Street Address"
              value={formData.street}
              onChangeText={(value) => updateFormData('street', value)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                label="State"
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="ZIP Code"
                value={formData.zipCode}
                onChangeText={(value) => updateFormData('zipCode', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text variant="titleLarge" style={styles.stepTitle}>
              License Information
            </Text>
            <TextInput
              label="Driver's License Number"
              value={formData.licenseNumber}
              onChangeText={(value) => updateFormData('licenseNumber', value)}
              mode="outlined"
              style={styles.input}
            />
            <View style={styles.row}>
              <TextInput
                label="License State"
                value={formData.licenseState}
                onChangeText={(value) => updateFormData('licenseState', value)}
                mode="outlined"
                style={[styles.input, styles.halfInput]}
              />
              <TextInput
                label="Expiry Date"
                value={formData.licenseExpiry}
                onChangeText={(value) => updateFormData('licenseExpiry', value)}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
            </View>
            <TextInput
              label="CDL Class (if applicable)"
              value={formData.cdlClass}
              onChangeText={(value) => updateFormData('cdlClass', value)}
              mode="outlined"
              style={styles.input}
            />
          </View>
        );

      case 4:
        return (
          <View>
            <Text variant="titleLarge" style={styles.stepTitle}>
              Emergency Contact
            </Text>
            <TextInput
              label="Emergency Contact Name"
              value={formData.emergencyName}
              onChangeText={(value) => updateFormData('emergencyName', value)}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Emergency Contact Phone"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TextInput
              label="Relationship"
              value={formData.emergencyRelation}
              onChangeText={(value) => updateFormData('emergencyRelation', value)}
              mode="outlined"
              style={styles.input}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Driver Registration
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Step {step} of {totalSteps}
        </Text>
        <ProgressBar progress={progress} style={styles.progressBar} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            {renderStep()}
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <Button
            mode="outlined"
            onPress={() => setStep(step - 1)}
            style={styles.backButton}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button
          mode="contained"
          onPress={handleNext}
          loading={isLoading}
          disabled={isLoading}
          style={styles.nextButton}
        >
          {step === totalSteps ? 'Submit Registration' : 'Next'}
        </Button>
      </View>
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
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: spacing.lg,
  },
  stepTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});