import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { logScreenView, logButtonClick } from '../utils/crashlytics';
import * as analytics from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';

type Props = { onBack: () => void; onUpgrade: () => void };

const Row = ({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress?: () => void }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => {
    logButtonClick(`Settings: ${label}`, 'SettingsScreen');
    analytics.logEvent('settings_option_clicked', { option: label });
    if (onPress) onPress();
  }}>
    <View style={styles.rowLeft}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <FontAwesome name="chevron-right" size={14} color="#262626" />
  </TouchableOpacity>
);

const SettingsScreen = ({ onBack, onUpgrade }: Props) => {
  const { user, signOut, deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmationVisible, setConfirmationVisible] = React.useState(false);
  const [actionType, setActionType] = React.useState<'logout' | 'delete' | null>(null);

  // Log screen view
  useEffect(() => {
    logScreenView('SettingsScreen');
  }, []);

  const handleLogoutPress = () => {
    setActionType('logout');
    setConfirmationVisible(true);
  };

  const handleDeletePress = () => {
    setActionType('delete');
    setConfirmationVisible(true);
  };

  const onConfirmAction = async () => {
    setConfirmationVisible(false);
    if (actionType === 'logout') {
      try {
        await signOut();
      } catch (error) {
        console.error("Logout failed", error);
      }
    } else if (actionType === 'delete') {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } catch (error) {
        console.error("Delete failed", error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            logButtonClick('Back Button', 'SettingsScreen');
            onBack();
          }}>
            <FontAwesome name="angle-left" color="#000" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Setting</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Profile Section */}
        {user && (
          <View style={styles.profileCard}>
            <Image
              source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.displayName || 'User'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Header card */}
        {!user?.isPremium && (
          <View style={styles.headerCard}>
            <View>
              <Text style={styles.headerTitle}>Unlimited</Text>
              <Text style={styles.headerSub}>Transformations</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn} onPress={() => {
              logButtonClick('Upgrade Now Button', 'SettingsScreen');
              analytics.logEvent('upgrade_prompt', { source: 'settings' });
              onUpgrade();
            }}>
              <Text style={styles.upgradeText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Options */}
        <Row icon={<MaterialCommunityIcons name="information-outline" size={16} color="#262626" />} label="About" />
        <Row icon={<MaterialCommunityIcons name="alert-circle-outline" size={16} color="#262626" />} label="Report a problem" />
        <Row icon={<MaterialCommunityIcons name="message-reply-outline" size={16} color="#262626" />} label="Feedback" />
        <Row icon={<MaterialCommunityIcons name="account-plus-outline" size={16} color="#262626" />} label="Tell a friend" />
        <Row icon={<MaterialCommunityIcons name="shield-outline" size={16} color="#262626" />} label="Privacy and Policy" />
        <Row icon={<MaterialCommunityIcons name="file-document-outline" size={16} color="#262626" />} label="Terms and Conditions" />
        <Row
          icon={<MaterialCommunityIcons name="logout" size={16} color="#262626" />}
          label="Logout"
          onPress={handleLogoutPress}
        />
        <Row
          icon={<MaterialCommunityIcons name="delete-outline" size={16} color="#EF4444" />}
          label={isDeleting ? "Deleting..." : "Delete account"}
          onPress={handleDeletePress}
        />
      </ScrollView>

      <ConfirmationModal
        visible={confirmationVisible}
        title={actionType === 'logout' ? 'Log Out' : 'Delete Account'}
        message={
          actionType === 'logout'
            ? 'Are you sure you want to log out?'
            : 'Are you sure you want to permanently delete your account? This action cannot be undone.'
        }
        confirmText={actionType === 'logout' ? 'Log Out' : 'Delete'}
        cancelText="Cancel"
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmationVisible(false)}
        isDestructive={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 140,
    backgroundColor: '#F7F8FB',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: '#F4F5FA',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F4F5FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
});

export default SettingsScreen;


