import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ReceiptCameraProps {
  onReceiptCaptured: (imageUri: string) => void;
  onClose: () => void;
  visible: boolean;
}

const ReceiptCamera: React.FC<ReceiptCameraProps> = ({
  onReceiptCaptured,
  onClose,
  visible,
}) => {
  const { colors } = useTheme();

  const simulateCapture = () => {
    // Simulate receipt capture for Expo Go compatibility
    Alert.alert(
      'Receipt Captured',
      'Receipt photo simulation completed! In a production app, this would capture an actual photo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Simulated Receipt',
          onPress: () => {
            onReceiptCaptured('simulated://receipt-image');
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Receipt Camera</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.simulationContainer}>
            <Ionicons name="camera-outline" size={120} color={colors.primary} />
            <Text style={[styles.simulationTitle, { color: colors.text }]}>
              Camera Simulation
            </Text>
            <Text style={[styles.simulationText, { color: colors.textSecondary }]}>
              This is a simulation for Expo Go compatibility.
              In a production build, you would be able to:
            </Text>
            <View style={styles.featureList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                📸 Capture receipt photos with camera
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                🖼️ Select photos from gallery
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                🔍 Auto-detect text from receipts
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                💾 Attach photos to bills
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.simulateButton, { backgroundColor: colors.primary }]}
            onPress={simulateCapture}
          >
            <Ionicons name="camera" size={24} color="white" />
            <Text style={styles.simulateButtonText}>Simulate Receipt Capture</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  simulationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  simulationTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  simulationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'left',
  },
  simulateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  simulateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReceiptCamera;
