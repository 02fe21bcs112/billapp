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

interface BarcodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onProductScanned: (productData: { name: string; price?: number }) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onClose,
  onProductScanned,
}) => {
  const { colors } = useTheme();

  const simulateScan = () => {
    const mockProducts = [
      { name: 'Coca Cola 500ml', price: 2.99 },
      { name: 'Sandwich - Turkey Club', price: 8.50 },
      { name: 'Coffee - Large Latte', price: 4.75 },
      { name: 'Energy Bar', price: 3.25 },
      { name: 'Bottled Water', price: 1.99 },
      { name: 'Protein Shake', price: 5.99 },
      { name: 'Bagel with Cream Cheese', price: 4.50 },
    ];

    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];

    Alert.alert(
      'Product Scanned',
      `Found: ${randomProduct.name}\nPrice: $${randomProduct.price.toFixed(2)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add Item',
          onPress: () => {
            onProductScanned(randomProduct);
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
          <Text style={[styles.title, { color: colors.text }]}>Barcode Scanner</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.simulationContainer}>
            <Ionicons name="barcode-outline" size={120} color={colors.primary} />
            <Text style={[styles.simulationTitle, { color: colors.text }]}>
              Barcode Scanner Simulation
            </Text>
            <Text style={[styles.simulationText, { color: colors.textSecondary }]}>
              This is a simulation for Expo Go compatibility.
              In a production build, you would be able to:
            </Text>
            <View style={styles.featureList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                📱 Scan product barcodes with camera
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                🔍 Auto-detect product information
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                💰 Auto-fill item names and prices
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                🛒 Speed up bill entry process
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.simulateButton, { backgroundColor: colors.primary }]}
            onPress={simulateScan}
          >
            <Ionicons name="barcode" size={24} color="white" />
            <Text style={styles.simulateButtonText}>Simulate Barcode Scan</Text>
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

export default BarcodeScanner;
