import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Avatar, List, Switch, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/services/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '@/services/ApiService';
import { theme, spacing } from '@/constants/theme';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => ApiService.getCurrentUser(),
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
  };

  const handleViewDocuments = () => {
    // Navigate to documents screen
  };

  const handleContactSupport = () => {
    // Open support contact
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Card style={styles.profileCard} mode="elevated">
          <Card.Content style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={user?.firstName?.[0] || 'U'} 
                style={styles.avatar}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text variant="bodyMedium" style={styles.profileEmail}>
                  {user?.email}
                </Text>
                <Text variant="bodySmall" style={styles.profileRole}>
                  {user?.role === 'driver' ? 'Verified Driver' : 'Independent Contractor'}
                </Text>
              </View>
            </View>
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>

        {/* Account Status */}
        <Card style={styles.statusCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Status
            </Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text variant="displaySmall" style={styles.statusNumber}>
                  {profileData?.completedJobs || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Completed Jobs
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text variant="displaySmall" style={styles.statusNumber}>
                  {profileData?.rating || '4.8'}
                </Text>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Rating
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text variant="displaySmall" style={styles.statusNumber}>
                  {profileData?.totalEarnings || '$0'}
                </Text>
                <Text variant="bodySmall" style={styles.statusLabel}>
                  Total Earnings
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Settings
            </Text>
            
            <List.Item
              title="Notifications"
              description="Receive job alerts and updates"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Location Services"
              description="Enable location for nearby opportunities"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Documents"
              description="View and manage your documents"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleViewDocuments}
            />
            
            <Divider />
            
            <List.Item
              title="Background Check Status"
              description="View verification progress"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to background check */}}
            />
          </Card.Content>
        </Card>

        {/* App Information */}
        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              App Information
            </Text>
            
            <List.Item
              title="About ACHIEVEMOR"
              description="Learn about our platform"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to about */}}
            />
            
            <Divider />
            
            <List.Item
              title="Help & Support"
              description="Get help or contact us"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleContactSupport}
            />
            
            <Divider />
            
            <List.Item
              title="Privacy Policy"
              description="Read our privacy policy"
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to privacy policy */}}
            />
            
            <Divider />
            
            <List.Item
              title="Terms of Service"
              description="View terms and conditions"
              left={(props) => <List.Icon {...props} icon="file-document-outline" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {/* Navigate to terms */}}
            />
          </Card.Content>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Actions
            </Text>
            
            <Button
              mode="outlined"
              icon="account-edit"
              onPress={handleEditProfile}
              style={styles.actionButton}
            >
              Edit Personal Information
            </Button>
            
            <Button
              mode="outlined"
              icon="lock-reset"
              onPress={() => {/* Change password */}}
              style={styles.actionButton}
            >
              Change Password
            </Button>
            
            <Button
              mode="outlined"
              icon="download"
              onPress={() => {/* Export data */}}
              style={styles.actionButton}
            >
              Export My Data
            </Button>
            
            <Button
              mode="contained"
              icon="logout"
              onPress={handleLogout}
              style={[styles.actionButton, styles.logoutButton]}
              buttonColor={theme.colors.error}
            >
              Sign Out
            </Button>
          </Card.Content>
        </Card>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text variant="bodySmall" style={styles.versionText}>
            ACHIEVEMOR Mobile v1.0.0
          </Text>
          <Text variant="bodySmall" style={styles.versionText}>
            © 2024 ACHIEVEMOR. All rights reserved.
          </Text>
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
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  profileContent: {
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: theme.colors.onSurfaceVariant,
  },
  profileRole: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  editButton: {
    marginTop: spacing.sm,
  },
  statusCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusNumber: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusLabel: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  settingsCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  infoCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  actionsCard: {
    margin: spacing.md,
    backgroundColor: theme.colors.surface,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  versionText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
});