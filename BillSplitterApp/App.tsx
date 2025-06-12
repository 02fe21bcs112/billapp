import React from 'react';
import { StatusBar } from 'expo-status-bar';
import BillSplitterApp from './src/BillSplitterApp';
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BillSplitterApp />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
