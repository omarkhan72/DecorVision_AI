import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type Props = { onBack: () => void; onUpgrade: () => void };

const Row = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <TouchableOpacity style={styles.row} activeOpacity={0.8}>
    <View style={styles.rowLeft}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <FontAwesome name="chevron-right" size={14} color="#262626" />
  </TouchableOpacity>
);

const SettingsScreen = ({ onBack, onUpgrade }: Props) => {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <FontAwesome name="angle-left" color="#000" size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>Setting</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Header card */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>Unlimited</Text>
          <Text style={styles.headerSub}>Transformations</Text>
        </View>
        <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
          <Text style={styles.upgradeText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>

      {/* Options */}
      <Row icon={<MaterialCommunityIcons name="information-outline" size={16} color="#262626" />} label="About" />
      <Row icon={<MaterialCommunityIcons name="alert-circle-outline" size={16} color="#262626" />} label="Report a problem" />
      <Row icon={<MaterialCommunityIcons name="message-reply-outline" size={16} color="#262626" />} label="Feedback" />
      <Row icon={<MaterialCommunityIcons name="account-plus-outline" size={16} color="#262626" />} label="Tell a friend" />
      <Row icon={<MaterialCommunityIcons name="shield-outline" size={16} color="#262626" />} label="Privacy and Policy" />
      <Row icon={<MaterialCommunityIcons name="file-document-outline" size={16} color="#262626" />} label="Terms and Conditions" />
      <Row icon={<MaterialCommunityIcons name="logout" size={16} color="#262626" />} label="Logout" />
      <Row icon={<MaterialCommunityIcons name="delete-outline" size={16} color="#EF4444" />} label="Delete account" />
    </ScrollView>
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


