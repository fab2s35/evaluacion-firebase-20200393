import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Navigation from './src/navigation/Navigation';
import { API_KEY } from '@env';

export default function App() {
  useEffect(() => {
    console.log("API_KEY desde @env:", API_KEY);
  }, []);

  return (
    <Navigation />
  );
}
