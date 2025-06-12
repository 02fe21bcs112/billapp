import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant access to photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      onReceiptCaptured(capturedImage);
      setCapturedImage(null);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (permission === null) {
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

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            Camera access is required to capture receipts
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {capturedImage ? (
          <View style={styles.previewContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            </ScrollView>
            <View style={[styles.controlsContainer, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.border }]}
                onPress={retakePhoto}
              >
                <Ionicons name="camera-outline" size={24} color={colors.text} />
                <Text style={[styles.controlButtonText, { color: colors.text }]}>
                  Retake
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.success }]}
                onPress={confirmImage}
              >
                <Ionicons name="checkmark-outline" size={24} color="white" />
                <Text style={styles.controlButtonTextWhite}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
              <Text style={styles.title}>Capture Receipt</Text>
              <View style={styles.placeholder} />
            </View>

            <CameraView
              style={styles.camera}
              facing={facing}
              ref={cameraRef}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.focusFrame} />
                <Text style={styles.instructionText}>
                  Position the receipt within the frame
                </Text>
              </View>
            </CameraView>

            <View style={[styles.controlsContainer, { backgroundColor: colors.surface }]}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.border }]}
                onPress={pickFromGallery}
              >
                <Ionicons name="images-outline" size={24} color={colors.text} />
                <Text style={[styles.controlButtonText, { color: colors.text }]}>
                  Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: colors.border }]}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse-outline" size={24} color={colors.text} />
                <Text style={[styles.controlButtonText, { color: colors.text }]}>
                  Flip
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

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
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: width * 0.8,
    height: height * 0.5,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    minWidth: 80,
  },
  controlButtonText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  controlButtonTextWhite: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    color: 'white',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E5EA',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  previewContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  previewImage: {
    width: width * 0.9,
    height: height * 0.7,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReceiptCamera;
