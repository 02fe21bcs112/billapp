import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // Simulate product lookup from barcode
    // In a real app, you would query a product database
    const mockProducts: { [key: string]: { name: string; price: number } } = {
      '012345678905': { name: 'Coca Cola 500ml', price: 2.99 },
      '012345678912': { name: 'Sandwich - Turkey Club', price: 8.50 },
      '012345678929': { name: 'Coffee - Large Latte', price: 4.75 },
      '012345678936': { name: 'Energy Bar', price: 3.25 },
      '012345678943': { name: 'Bottled Water', price: 1.99 },
    };

    const product = mockProducts[data] || {
      name: `Product ${data.slice(-4)}`,
      price: Math.floor(Math.random() * 20) + 1,
    };

    Alert.alert(
      'Product Scanned',
      `Found: ${product.name}\nPrice: $${product.price.toFixed(2)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setScanned(false),
        },
        {
          text: 'Add Item',
          onPress: () => {
            onProductScanned(product);
            onClose();
          },
        },
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.permissionContainer}>
            <Ionicons name="camera-outline" size={64} color={colors.error} />
            <Text style={[styles.title, { color: colors.text }]}>
              Camera Access Required
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              Please grant camera permission to scan barcodes and add items quickly.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Barcode</Text>
          <View style={styles.placeholder} />
        </View>

        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.scanner}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.instructionText}>
                Position the barcode within the frame
              </Text>
            </View>

            <View style={styles.bottomContainer}>
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={20} color="white" />
                <Text style={styles.infoText}>
                  Scan product barcodes to quickly add items with prices
                </Text>
              </View>
              
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text style={styles.rescanText}>Tap to scan again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BarCodeScanner>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.7;

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
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  scanArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scanFrame: {
    width: scanAreaSize,
    height: scanAreaSize * 0.6,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  bottomContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rescanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BarcodeScanner;
