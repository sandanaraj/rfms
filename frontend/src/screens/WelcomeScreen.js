// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to File Management App</Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Please login or register to continue.   </Text>
        <Button title="Login" onPress={() => navigation.navigate('Login')} />
        <Button title="Register" onPress={() => navigation.navigate('Register')} />
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 40,
    fontWeight: 'bold',
    textAlign: 'center',
  },
 
});

