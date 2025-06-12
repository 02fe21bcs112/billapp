import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Bill } from '../types';

interface CollaborationProps {
  visible: boolean;
  onClose: () => void;
  bill: Bill;
  onUpdateBill: (bill: Bill) => void;
}

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

const Collaboration: React.FC<CollaborationProps> = ({
  visible,
  onClose,
  bill,
  onUpdateBill,
}) => {
  const { colors } = useTheme();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'John Doe',
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      isOnline: false,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [shareCode, setShareCode] = useState('ABC123');

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    // Simulate sending invite
    Alert.alert(
      'Invite Sent',
      `An invitation has been sent to ${inviteEmail}`,
      [{ text: 'OK', onPress: () => setInviteEmail('') }]
    );
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my bill split! Use code: ${shareCode} in the Bill Splitter app`,
        title: 'Join Bill Split',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share code');
    }
  };

  const renderCollaborator = ({ item }: { item: Collaborator }) => (
    <View style={[styles.collaboratorItem, { backgroundColor: colors.surface }]}>
      <View style={styles.collaboratorInfo}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.collaboratorDetails}>
          <Text style={[styles.collaboratorName, { color: colors.text }]}>
            {item.name}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: item.isOnline ? colors.success : colors.textSecondary }
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {item.isOnline ? 'Online' : `Last seen ${item.lastSeen.toLocaleTimeString()}`}
            </Text>
          </View>
        </View>
      </View>
      {!item.isOnline && (
        <TouchableOpacity style={styles.removeButton}>
          <Ionicons name="close" size={16} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: colors.primary }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Collaboration</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Current Collaborators */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Current Collaborators ({collaborators.length})
            </Text>
            <FlatList
              data={collaborators}
              renderItem={renderCollaborator}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* Share Code */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Share Code
            </Text>
            <View style={styles.shareCodeContainer}>
              <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.shareCodeText, { color: colors.text }]}>
                  {shareCode}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primary }]}
                onPress={handleShareCode}
              >
                <Ionicons name="share-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Others can join by entering this code in the app
            </Text>
          </View>

          {/* Invite by Email */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Invite by Email
            </Text>
            <View style={styles.inviteContainer}>
              <TextInput
                style={[
                  styles.emailInput,
                  { 
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border 
                  }
                ]}
                placeholder="Enter email address"
                placeholderTextColor={colors.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.inviteButton, { backgroundColor: colors.primary }]}
                onPress={handleInvite}
              >
                <Text style={styles.inviteButtonText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Permissions */}
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Permissions
            </Text>
            <View style={styles.permissionItem}>
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Allow editing items
              </Text>
              <TouchableOpacity style={[styles.toggle, { backgroundColor: colors.primary }]}>
                <View style={styles.toggleKnob} />
              </TouchableOpacity>
            </View>
            <View style={styles.permissionItem}>
              <Text style={[styles.permissionText, { color: colors.text }]}>
                Allow adding people
              </Text>
              <TouchableOpacity style={[styles.toggle, { backgroundColor: colors.primary }]}>
                <View style={styles.toggleKnob} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  section: {
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  collaboratorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  collaboratorDetails: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  shareCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  codeContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareCodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  shareButton: {
    padding: 12,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
  },
  inviteContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  emailInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  inviteButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  permissionText: {
    fontSize: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-end',
  },
});

export default Collaboration;
