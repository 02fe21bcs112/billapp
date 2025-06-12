import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceInputProps {
  visible: boolean;
  onClose: () => void;
  onTextRecognized: (text: string) => void;
  mode: 'item' | 'person';
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  visible,
  onClose,
  onTextRecognized,
  mode,
}) => {
  const { colors } = useTheme();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRecording) pulse();
        });
      };
      pulse();
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      if (hasPermission !== true) {
        Alert.alert('Permission required', 'Please grant microphone permission');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setRecording(null);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // In a real app, you would send this to a speech-to-text service
        // For demo purposes, we'll simulate recognition
        simulateVoiceRecognition();
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process recording');
    }
  };

  const simulateVoiceRecognition = () => {
    // Simulate speech-to-text processing
    setTimeout(() => {
      if (mode === 'item') {
        const sampleItems = [
          'Pizza slice $8.50',
          'Coffee $4.25',
          'Burger and fries $12.99',
          'Chicken sandwich $9.75',
          'Caesar salad $11.50',
        ];
        const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        onTextRecognized(randomItem);
      } else {
        const sampleNames = [
          'John Smith',
          'Sarah Johnson',
          'Mike Wilson',
          'Emily Davis',
          'David Brown',
        ];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        onTextRecognized(randomName);
      }
      onClose();
    }, 2000);
  };

  const getInstructions = () => {
    if (mode === 'item') {
      return 'Say the item name and price (e.g., "Pizza slice eight fifty")';
    }
    return 'Say the person\'s name (e.g., "John Smith")';
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Text style={[styles.message, { color: colors.text }]}>
              Requesting microphone permission...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <Ionicons name="mic-off" size={48} color={colors.error} />
            <Text style={[styles.title, { color: colors.text }]}>
              Microphone Access Required
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              Please grant microphone permission in Settings to use voice input.
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
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Animated.View
              style={[
                styles.micButton,
                {
                  backgroundColor: isRecording ? colors.error : colors.primary,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.micButtonTouchable}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={48}
                  color="white"
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={[styles.title, { color: colors.text }]}>
              {isRecording ? 'Recording...' : 'Voice Input'}
            </Text>

            <Text style={[styles.instructions, { color: colors.textSecondary }]}>
              {isRecording ? 'Tap to stop recording' : getInstructions()}
            </Text>

            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={[styles.recordingDot, { backgroundColor: colors.error }]} />
                <Text style={[styles.recordingText, { color: colors.error }]}>
                  Recording in progress...
                </Text>
              </View>
            )}

            {!isRecording && (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.primary }]}
                onPress={startRecording}
              >
                <Ionicons name="mic" size={20} color="white" />
                <Text style={styles.startButtonText}>Start Recording</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Powered by speech recognition
            </Text>
            <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
              Note: This is a demo simulation
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  content: {
    alignItems: 'center',
    marginTop: 10,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default VoiceInput;
