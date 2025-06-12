import React from 'react';
import { StatusBar } from 'expo-status-bar';
import BillSplitterApp from './src/BillSplitterApp';

export default function App() {
  return (
    <>
      <BillSplitterApp />
      <StatusBar style="dark" />
    </>
  );
}
