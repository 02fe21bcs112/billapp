import { Platform } from 'react-native';

export const hapticFeedback = {
  // Light feedback for button taps
  light: () => {
    // Simulated haptic feedback for Expo Go compatibility
    console.log('Haptic feedback: light');
  },

  // Medium feedback for actions like adding items
  medium: () => {
    console.log('Haptic feedback: medium');
  },

  // Heavy feedback for deletions or important actions
  heavy: () => {
    console.log('Haptic feedback: heavy');
  },

  // Success feedback
  success: () => {
    console.log('Haptic feedback: success');
  },

  // Warning feedback
  warning: () => {
    console.log('Haptic feedback: warning');
  },

  // Error feedback
  error: () => {
    console.log('Haptic feedback: error');
  },

  // Selection feedback for small UI changes
  selection: () => {
    console.log('Haptic feedback: selection');
  },
};

export default hapticFeedback;
